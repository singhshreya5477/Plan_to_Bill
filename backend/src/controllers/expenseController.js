const db = require('../config/db');

// Submit an expense
exports.createExpense = async (req, res) => {
  try {
    const { title, description, amount, category, project_id, receipt_url } = req.body;
    const { userId, companyId } = req.user;

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

    // Verify user is assigned to the project
    const memberCheck = await db.query(
      `SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2`,
      [project_id, userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'You must be a member of the project to submit expenses'
      });
    }

    // Create expense
    const result = await db.query(
      `INSERT INTO expenses (title, description, amount, category, project_id, submitted_by, receipt_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, description, amount, category, project_id, userId, receipt_url]
    );

    res.status(201).json({
      success: true,
      message: 'Expense submitted successfully',
      expense: result.rows[0]
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating expense',
      error: error.message
    });
  }
};

// Get all expenses
exports.getExpenses = async (req, res) => {
  try {
    const { companyId, userId, role } = req.user;
    const { project_id, status, category } = req.query;

    let query = `
      SELECT 
        e.*,
        p.name as project_name,
        u_submitted.first_name || ' ' || u_submitted.last_name as submitted_by_name,
        u_submitted.email as submitted_by_email,
        u_approved.first_name || ' ' || u_approved.last_name as approved_by_name
      FROM expenses e
      LEFT JOIN projects p ON e.project_id = p.id
      LEFT JOIN users u_submitted ON e.submitted_by = u_submitted.id
      LEFT JOIN users u_approved ON e.approved_by = u_approved.id
      WHERE p.company_id = $1
    `;
    
    const queryParams = [companyId];
    let paramCounter = 2;

    // If team_member, only show expenses they submitted or in their projects
    if (role === 'team_member') {
      query += ` AND (e.submitted_by = $${paramCounter} OR p.id IN (
        SELECT project_id FROM project_members WHERE user_id = $${paramCounter}
      ))`;
      queryParams.push(userId);
      paramCounter++;
    }

    // Filter by project
    if (project_id) {
      query += ` AND e.project_id = $${paramCounter}`;
      queryParams.push(project_id);
      paramCounter++;
    }

    // Filter by status
    if (status) {
      query += ` AND e.status = $${paramCounter}`;
      queryParams.push(status);
      paramCounter++;
    }

    // Filter by category
    if (category) {
      query += ` AND e.category = $${paramCounter}`;
      queryParams.push(category);
      paramCounter++;
    }

    query += ` ORDER BY e.created_at DESC`;

    const result = await db.query(query, queryParams);

    res.json({
      success: true,
      expenses: result.rows
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expenses',
      error: error.message
    });
  }
};

// Get single expense
exports.getExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId, userId, role } = req.user;

    const result = await db.query(
      `SELECT 
        e.*,
        p.name as project_name,
        u_submitted.first_name || ' ' || u_submitted.last_name as submitted_by_name,
        u_submitted.email as submitted_by_email,
        u_approved.first_name || ' ' || u_approved.last_name as approved_by_name
      FROM expenses e
      LEFT JOIN projects p ON e.project_id = p.id
      LEFT JOIN users u_submitted ON e.submitted_by = u_submitted.id
      LEFT JOIN users u_approved ON e.approved_by = u_approved.id
      WHERE e.id = $1 AND p.company_id = $2`,
      [id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    const expense = result.rows[0];

    // Check if team_member has access
    if (role === 'team_member') {
      if (expense.submitted_by !== userId) {
        const hasAccess = await db.query(
          `SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2`,
          [expense.project_id, userId]
        );
        
        if (hasAccess.rows.length === 0) {
          return res.status(403).json({
            success: false,
            message: 'You do not have access to this expense'
          });
        }
      }
    }

    res.json({
      success: true,
      expense: result.rows[0]
    });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expense',
      error: error.message
    });
  }
};

// Approve or reject expense (project_manager or admin only)
exports.reviewExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'
    const { companyId, userId, role } = req.user;

    // Check if user is project_manager or admin
    if (role !== 'project_manager' && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only project managers and admins can review expenses'
      });
    }

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "approved" or "rejected"'
      });
    }

    // Get expense details
    const expenseCheck = await db.query(
      `SELECT e.*, p.company_id 
       FROM expenses e
       JOIN projects p ON e.project_id = p.id
       WHERE e.id = $1 AND p.company_id = $2`,
      [id, companyId]
    );

    if (expenseCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    const expense = expenseCheck.rows[0];

    // Check if expense is already reviewed
    if (expense.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Expense has already been reviewed'
      });
    }

    // If project_manager, verify they're assigned to this project
    if (role === 'project_manager') {
      const accessCheck = await db.query(
        `SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2 AND role = 'manager'`,
        [expense.project_id, userId]
      );

      if (accessCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to review expenses for this project'
        });
      }
    }

    // Update expense
    const result = await db.query(
      `UPDATE expenses 
       SET status = $1,
           approved_by = $2,
           approved_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [status, userId, id]
    );

    res.json({
      success: true,
      message: `Expense ${status} successfully`,
      expense: result.rows[0]
    });
  } catch (error) {
    console.error('Review expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reviewing expense',
      error: error.message
    });
  }
};

// Update expense (only by submitter and only if pending)
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, amount, category, receipt_url } = req.body;
    const { companyId, userId } = req.user;

    // Get expense details
    const expenseCheck = await db.query(
      `SELECT e.*, p.company_id 
       FROM expenses e
       JOIN projects p ON e.project_id = p.id
       WHERE e.id = $1 AND p.company_id = $2`,
      [id, companyId]
    );

    if (expenseCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    const expense = expenseCheck.rows[0];

    // Only submitter can update
    if (expense.submitted_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update expenses you submitted'
      });
    }

    // Can only update if pending
    if (expense.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update expense that has been reviewed'
      });
    }

    // Update expense
    const result = await db.query(
      `UPDATE expenses 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           amount = COALESCE($3, amount),
           category = COALESCE($4, category),
           receipt_url = COALESCE($5, receipt_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [title, description, amount, category, receipt_url, id]
    );

    res.json({
      success: true,
      message: 'Expense updated successfully',
      expense: result.rows[0]
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating expense',
      error: error.message
    });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId, userId, role } = req.user;

    // Get expense details
    const expenseCheck = await db.query(
      `SELECT e.*, p.company_id 
       FROM expenses e
       JOIN projects p ON e.project_id = p.id
       WHERE e.id = $1 AND p.company_id = $2`,
      [id, companyId]
    );

    if (expenseCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    const expense = expenseCheck.rows[0];

    // Admin or submitter can delete (only if pending)
    if (role === 'admin' || (expense.submitted_by === userId && expense.status === 'pending')) {
      await db.query(`DELETE FROM expenses WHERE id = $1`, [id]);

      res.json({
        success: true,
        message: 'Expense deleted successfully'
      });
    } else {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own pending expenses'
      });
    }
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting expense',
      error: error.message
    });
  }
};
