const db = require('../config/db');

// Generate unique invoice number
const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${year}${month}-${random}`;
};

// Create invoice (trigger invoice)
exports.createInvoice = async (req, res) => {
  try {
    const {
      project_id,
      client_name,
      client_email,
      amount,
      tax_amount,
      issue_date,
      due_date,
      notes,
      items
    } = req.body;
    const { userId, companyId, role } = req.user;

    // Check if user is project_manager or admin
    if (role !== 'project_manager' && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only project managers and admins can create invoices'
      });
    }

    // Verify project belongs to user's company
    const projectCheck = await db.query(
      `SELECT * FROM projects WHERE id = $1 AND company_id = $2`,
      [project_id, companyId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // If project_manager, verify they're assigned to this project
    if (role === 'project_manager') {
      const accessCheck = await db.query(
        `SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2 AND role = 'manager'`,
        [project_id, userId]
      );

      if (accessCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to create invoices for this project'
        });
      }
    }

    // Calculate total amount
    const taxAmt = tax_amount || 0;
    const totalAmount = parseFloat(amount) + parseFloat(taxAmt);

    // Generate invoice number
    const invoiceNumber = generateInvoiceNumber();

    // Create invoice
    const result = await db.query(
      `INSERT INTO invoices (invoice_number, project_id, client_name, client_email, amount, tax_amount, total_amount, issue_date, due_date, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [invoiceNumber, project_id, client_name, client_email, amount, taxAmt, totalAmount, issue_date, due_date, notes, userId]
    );

    const invoice = result.rows[0];

    // Add invoice items if provided
    if (items && items.length > 0) {
      for (const item of items) {
        const itemAmount = parseFloat(item.quantity) * parseFloat(item.unit_price);
        await db.query(
          `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, amount)
           VALUES ($1, $2, $3, $4, $5)`,
          [invoice.id, item.description, item.quantity, item.unit_price, itemAmount]
        );
      }
    }

    // Get complete invoice with items
    const completeInvoice = await db.query(
      `SELECT 
        i.*,
        p.name as project_name,
        json_agg(
          json_build_object(
            'id', ii.id,
            'description', ii.description,
            'quantity', ii.quantity,
            'unit_price', ii.unit_price,
            'amount', ii.amount
          )
        ) FILTER (WHERE ii.id IS NOT NULL) as items
      FROM invoices i
      LEFT JOIN projects p ON i.project_id = p.id
      LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
      WHERE i.id = $1
      GROUP BY i.id, p.name`,
      [invoice.id]
    );

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      invoice: completeInvoice.rows[0]
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating invoice',
      error: error.message
    });
  }
};

// Get all invoices
exports.getInvoices = async (req, res) => {
  try {
    const { companyId, userId, role } = req.user;
    const { project_id, status } = req.query;

    let query = `
      SELECT 
        i.*,
        p.name as project_name,
        u.first_name || ' ' || u.last_name as created_by_name
      FROM invoices i
      LEFT JOIN projects p ON i.project_id = p.id
      LEFT JOIN users u ON i.created_by = u.id
      WHERE p.company_id = $1
    `;
    
    const queryParams = [companyId];
    let paramCounter = 2;

    // If team_member, only show invoices from their projects
    if (role === 'team_member') {
      query += ` AND p.id IN (
        SELECT project_id FROM project_members WHERE user_id = $${paramCounter}
      )`;
      queryParams.push(userId);
      paramCounter++;
    }

    // Filter by project
    if (project_id) {
      query += ` AND i.project_id = $${paramCounter}`;
      queryParams.push(project_id);
      paramCounter++;
    }

    // Filter by status
    if (status) {
      query += ` AND i.status = $${paramCounter}`;
      queryParams.push(status);
      paramCounter++;
    }

    query += ` ORDER BY i.created_at DESC`;

    const result = await db.query(query, queryParams);

    res.json({
      success: true,
      invoices: result.rows
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoices',
      error: error.message
    });
  }
};

// Get single invoice
exports.getInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId, userId, role } = req.user;

    const result = await db.query(
      `SELECT 
        i.*,
        p.name as project_name,
        u.first_name || ' ' || u.last_name as created_by_name,
        json_agg(
          json_build_object(
            'id', ii.id,
            'description', ii.description,
            'quantity', ii.quantity,
            'unit_price', ii.unit_price,
            'amount', ii.amount
          )
        ) FILTER (WHERE ii.id IS NOT NULL) as items
      FROM invoices i
      LEFT JOIN projects p ON i.project_id = p.id
      LEFT JOIN users u ON i.created_by = u.id
      LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
      WHERE i.id = $1 AND p.company_id = $2
      GROUP BY i.id, p.name, u.first_name, u.last_name`,
      [id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    const invoice = result.rows[0];

    // Check if team_member has access
    if (role === 'team_member') {
      const hasAccess = await db.query(
        `SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2`,
        [invoice.project_id, userId]
      );
      
      if (hasAccess.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this invoice'
        });
      }
    }

    res.json({
      success: true,
      invoice: result.rows[0]
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoice',
      error: error.message
    });
  }
};

// Update invoice
exports.updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      client_name,
      client_email,
      amount,
      tax_amount,
      status,
      issue_date,
      due_date,
      paid_date,
      notes
    } = req.body;
    const { companyId, userId, role } = req.user;

    // Check if user is project_manager or admin
    if (role !== 'project_manager' && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only project managers and admins can update invoices'
      });
    }

    // Get invoice details
    const invoiceCheck = await db.query(
      `SELECT i.*, p.company_id 
       FROM invoices i
       JOIN projects p ON i.project_id = p.id
       WHERE i.id = $1 AND p.company_id = $2`,
      [id, companyId]
    );

    if (invoiceCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    const invoice = invoiceCheck.rows[0];

    // If project_manager, verify they're assigned to this project
    if (role === 'project_manager') {
      const accessCheck = await db.query(
        `SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2 AND role = 'manager'`,
        [invoice.project_id, userId]
      );

      if (accessCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update invoices for this project'
        });
      }
    }

    // Calculate new total if amount or tax changes
    const newAmount = amount !== undefined ? amount : invoice.amount;
    const newTaxAmount = tax_amount !== undefined ? tax_amount : invoice.tax_amount;
    const totalAmount = parseFloat(newAmount) + parseFloat(newTaxAmount);

    // Update invoice
    const result = await db.query(
      `UPDATE invoices 
       SET client_name = COALESCE($1, client_name),
           client_email = COALESCE($2, client_email),
           amount = COALESCE($3, amount),
           tax_amount = COALESCE($4, tax_amount),
           total_amount = $5,
           status = COALESCE($6, status),
           issue_date = COALESCE($7, issue_date),
           due_date = COALESCE($8, due_date),
           paid_date = COALESCE($9, paid_date),
           notes = COALESCE($10, notes),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [client_name, client_email, amount, tax_amount, totalAmount, status, issue_date, due_date, paid_date, notes, id]
    );

    res.json({
      success: true,
      message: 'Invoice updated successfully',
      invoice: result.rows[0]
    });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating invoice',
      error: error.message
    });
  }
};

// Delete invoice
exports.deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId, userId, role } = req.user;

    // Check if user is project_manager or admin
    if (role !== 'project_manager' && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only project managers and admins can delete invoices'
      });
    }

    // Get invoice details
    const invoiceCheck = await db.query(
      `SELECT i.*, p.company_id 
       FROM invoices i
       JOIN projects p ON i.project_id = p.id
       WHERE i.id = $1 AND p.company_id = $2`,
      [id, companyId]
    );

    if (invoiceCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    const invoice = invoiceCheck.rows[0];

    // Cannot delete paid invoices
    if (invoice.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete paid invoices'
      });
    }

    // If project_manager, verify they're assigned to this project
    if (role === 'project_manager') {
      const accessCheck = await db.query(
        `SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2 AND role = 'manager'`,
        [invoice.project_id, userId]
      );

      if (accessCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete invoices for this project'
        });
      }
    }

    // Delete invoice (cascade will handle invoice_items)
    await db.query(`DELETE FROM invoices WHERE id = $1`, [id]);

    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting invoice',
      error: error.message
    });
  }
};

// Mark invoice as sent
exports.sendInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId, userId, role } = req.user;

    // Check if user is project_manager or admin
    if (role !== 'project_manager' && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only project managers and admins can send invoices'
      });
    }

    // Get invoice details
    const invoiceCheck = await db.query(
      `SELECT i.*, p.company_id 
       FROM invoices i
       JOIN projects p ON i.project_id = p.id
       WHERE i.id = $1 AND p.company_id = $2`,
      [id, companyId]
    );

    if (invoiceCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    const invoice = invoiceCheck.rows[0];

    // Can only send draft invoices
    if (invoice.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft invoices can be sent'
      });
    }

    // Update status to sent
    const result = await db.query(
      `UPDATE invoices 
       SET status = 'sent',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    res.json({
      success: true,
      message: 'Invoice sent successfully',
      invoice: result.rows[0]
    });
  } catch (error) {
    console.error('Send invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending invoice',
      error: error.message
    });
  }
};

// Mark invoice as paid
exports.markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { paid_date } = req.body;
    const { companyId, userId, role } = req.user;

    // Check if user is project_manager or admin
    if (role !== 'project_manager' && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only project managers and admins can mark invoices as paid'
      });
    }

    // Get invoice details
    const invoiceCheck = await db.query(
      `SELECT i.*, p.company_id 
       FROM invoices i
       JOIN projects p ON i.project_id = p.id
       WHERE i.id = $1 AND p.company_id = $2`,
      [id, companyId]
    );

    if (invoiceCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    // Update status to paid
    const result = await db.query(
      `UPDATE invoices 
       SET status = 'paid',
           paid_date = COALESCE($1, CURRENT_DATE),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [paid_date, id]
    );

    res.json({
      success: true,
      message: 'Invoice marked as paid',
      invoice: result.rows[0]
    });
  } catch (error) {
    console.error('Mark as paid error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking invoice as paid',
      error: error.message
    });
  }
};
