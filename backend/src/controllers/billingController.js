const db = require('../config/db');

// ============================================
// BILLING RATES
// ============================================

// Get billing rates
const getBillingRates = async (req, res) => {
    const client = await db.pool.connect();
    
    try {
        const { project_id, user_id, is_active } = req.query;
        const userRole = req.user.role;

        let query = `
            SELECT 
                br.*,
                p.name as project_name,
                CASE 
                    WHEN u.first_name IS NOT NULL THEN u.first_name || ' ' || u.last_name
                    ELSE NULL
                END as user_name,
                u.email as user_email
            FROM billing_rates br
            LEFT JOIN projects p ON br.project_id = p.id
            LEFT JOIN users u ON br.user_id = u.id
            WHERE 1=1
        `;
        
        const params = [];
        let paramCount = 1;

        if (project_id) {
            query += ` AND br.project_id = $${paramCount}`;
            params.push(project_id);
            paramCount++;
        }

        if (user_id) {
            query += ` AND br.user_id = $${paramCount}`;
            params.push(user_id);
            paramCount++;
        }

        if (is_active !== undefined) {
            query += ` AND br.is_active = $${paramCount}`;
            params.push(is_active === 'true');
            paramCount++;
        }

        query += ` ORDER BY br.created_at DESC`;

        const result = await client.query(query, params);

        res.json({
            success: true,
            data: {
                billingRates: result.rows
            }
        });

    } catch (error) {
        console.error('Error fetching billing rates:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch billing rates',
            error: error.message
        });
    } finally {
        client.release();
    }
};

// Create or update billing rate
const setBillingRate = async (req, res) => {
    const client = await db.pool.connect();
    
    try {
        const { 
            project_id, 
            user_id, 
            role, 
            rate_type, 
            rate, 
            currency, 
            effective_from, 
            effective_to 
        } = req.body;

        // Validate required fields
        if (!rate_type || !rate) {
            return res.status(400).json({
                success: false,
                message: 'Rate type and rate are required'
            });
        }

        // Verify project exists if specified
        if (project_id) {
            const projectCheck = await client.query(
                'SELECT 1 FROM projects WHERE id = $1',
                [project_id]
            );

            if (projectCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Project not found'
                });
            }
        }

        const result = await client.query(
            `INSERT INTO billing_rates 
             (project_id, user_id, role, rate_type, rate, currency, effective_from, effective_to, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
             RETURNING *`,
            [
                project_id || null,
                user_id || null,
                role || null,
                rate_type,
                rate,
                currency || 'USD',
                effective_from || new Date(),
                effective_to || null
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Billing rate set successfully',
            data: {
                billingRate: result.rows[0]
            }
        });

    } catch (error) {
        console.error('Error setting billing rate:', error);
        
        if (error.code === '23505') { // Unique constraint violation
            return res.status(400).json({
                success: false,
                message: 'A billing rate with this configuration already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to set billing rate',
            error: error.message
        });
    } finally {
        client.release();
    }
};

// ============================================
// INVOICES
// ============================================

// Get all invoices
const getInvoices = async (req, res) => {
    const client = await db.pool.connect();
    
    try {
        const { project_id, status, start_date, end_date } = req.query;

        let query = `
            SELECT 
                i.*,
                p.name as project_name,
                CASE 
                    WHEN u.first_name IS NOT NULL THEN u.first_name || ' ' || u.last_name
                    ELSE NULL
                END as created_by_name,
                COALESCE(SUM(pay.amount), 0) as paid_amount,
                i.total - COALESCE(SUM(pay.amount), 0) as balance
            FROM invoices i
            JOIN projects p ON i.project_id = p.id
            LEFT JOIN users u ON i.created_by = u.id
            LEFT JOIN payments pay ON i.id = pay.invoice_id
            WHERE 1=1
        `;
        
        const params = [];
        let paramCount = 1;

        if (project_id) {
            query += ` AND i.project_id = $${paramCount}`;
            params.push(project_id);
            paramCount++;
        }

        if (status) {
            query += ` AND i.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }

        if (start_date) {
            query += ` AND i.issue_date >= $${paramCount}`;
            params.push(start_date);
            paramCount++;
        }

        if (end_date) {
            query += ` AND i.issue_date <= $${paramCount}`;
            params.push(end_date);
            paramCount++;
        }

        query += ` GROUP BY i.id, p.name, u.first_name, u.last_name ORDER BY i.created_at DESC`;

        const result = await client.query(query, params);

        res.json({
            success: true,
            data: {
                invoices: result.rows
            }
        });

    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch invoices',
            error: error.message
        });
    } finally {
        client.release();
    }
};

// Get invoice by ID
const getInvoiceById = async (req, res) => {
    const client = await db.pool.connect();
    
    try {
        const { id } = req.params;

        // Get invoice details
        const invoiceResult = await client.query(
            `SELECT 
                i.*,
                p.name as project_name,
                CASE 
                    WHEN u.first_name IS NOT NULL THEN u.first_name || ' ' || u.last_name
                    ELSE NULL
                END as created_by_name,
                COALESCE(SUM(pay.amount), 0) as paid_amount,
                i.total - COALESCE(SUM(pay.amount), 0) as balance
             FROM invoices i
             JOIN projects p ON i.project_id = p.id
             LEFT JOIN users u ON i.created_by = u.id
             LEFT JOIN payments pay ON i.id = pay.invoice_id
             WHERE i.id = $1
             GROUP BY i.id, p.name, u.first_name, u.last_name`,
            [id]
        );

        if (invoiceResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        // Get invoice items
        const itemsResult = await client.query(
            `SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY id`,
            [id]
        );

        // Get payments
        const paymentsResult = await client.query(
            `SELECT 
                p.*,
                CASE 
                    WHEN u.first_name IS NOT NULL THEN u.first_name || ' ' || u.last_name
                    ELSE NULL
                END as recorded_by_name
             FROM payments p
             LEFT JOIN users u ON p.recorded_by = u.id
             WHERE p.invoice_id = $1
             ORDER BY p.payment_date DESC`,
            [id]
        );

        res.json({
            success: true,
            data: {
                invoice: {
                    ...invoiceResult.rows[0],
                    items: itemsResult.rows,
                    payments: paymentsResult.rows
                }
            }
        });

    } catch (error) {
        console.error('Error fetching invoice:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch invoice',
            error: error.message
        });
    } finally {
        client.release();
    }
};

// Create invoice
const createInvoice = async (req, res) => {
    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN');

        const {
            project_id,
            client_name,
            client_email,
            client_address,
            issue_date,
            due_date,
            tax_rate,
            discount_amount,
            notes,
            terms,
            items // Array of { description, quantity, unit_price } or { time_log_id }
        } = req.body;

        // Validate required fields
        if (!project_id || !client_name || !due_date || !items || items.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Project, client name, due date, and items are required'
            });
        }

        // Generate invoice number
        const invoiceNumberResult = await client.query(
            `SELECT 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || '-' || 
             LPAD((COUNT(*) + 1)::TEXT, 3, '0') as invoice_number
             FROM invoices
             WHERE EXTRACT(YEAR FROM issue_date) = EXTRACT(YEAR FROM CURRENT_DATE)
             AND EXTRACT(MONTH FROM issue_date) = EXTRACT(MONTH FROM CURRENT_DATE)`
        );

        const invoiceNumber = invoiceNumberResult.rows[0].invoice_number;

        // Create invoice
        const invoiceResult = await client.query(
            `INSERT INTO invoices 
             (invoice_number, project_id, client_name, client_email, client_address,
              issue_date, due_date, tax_rate, discount_amount, notes, terms, created_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING *`,
            [
                invoiceNumber,
                project_id,
                client_name,
                client_email || null,
                client_address || null,
                issue_date || new Date(),
                due_date,
                tax_rate || 0,
                discount_amount || 0,
                notes || null,
                terms || null,
                req.user.userId
            ]
        );

        const invoice = invoiceResult.rows[0];

        // Add invoice items
        for (const item of items) {
            if (item.time_log_id) {
                // Create item from time log
                const timeLogResult = await client.query(
                    `SELECT 
                        tl.description || ' (' || TO_CHAR(tl.log_date, 'YYYY-MM-DD') || ')' as description,
                        tl.hours as quantity,
                        COALESCE(tl.hourly_rate, 0) as unit_price
                     FROM time_logs tl
                     WHERE tl.id = $1 AND tl.project_id = $2 AND tl.is_billable = true`,
                    [item.time_log_id, project_id]
                );

                if (timeLogResult.rows.length > 0) {
                    const timeLog = timeLogResult.rows[0];
                    await client.query(
                        `INSERT INTO invoice_items (invoice_id, time_log_id, description, quantity, unit_price)
                         VALUES ($1, $2, $3, $4, $5)`,
                        [invoice.id, item.time_log_id, timeLog.description, timeLog.quantity, timeLog.unit_price]
                    );
                }
            } else {
                // Create manual item
                await client.query(
                    `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price)
                     VALUES ($1, $2, $3, $4)`,
                    [invoice.id, item.description, item.quantity || 1, item.unit_price]
                );
            }
        }

        await client.query('COMMIT');

        // Fetch complete invoice with items
        const completeInvoice = await getInvoiceComplete(client, invoice.id);

        res.status(201).json({
            success: true,
            message: 'Invoice created successfully',
            data: {
                invoice: completeInvoice
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating invoice:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create invoice',
            error: error.message
        });
    } finally {
        client.release();
    }
};

// Helper function to get complete invoice
async function getInvoiceComplete(client, invoiceId) {
    const result = await client.query(
        `SELECT 
            i.*,
            p.name as project_name,
            json_agg(json_build_object(
                'id', ii.id,
                'description', ii.description,
                'quantity', ii.quantity,
                'unit_price', ii.unit_price,
                'amount', ii.amount
            )) as items
         FROM invoices i
         JOIN projects p ON i.project_id = p.id
         LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
         WHERE i.id = $1
         GROUP BY i.id, p.name`,
        [invoiceId]
    );
    return result.rows[0];
}

// Update invoice
const updateInvoice = async (req, res) => {
    const client = await db.pool.connect();
    
    try {
        const { id } = req.params;
        const {
            client_name,
            client_email,
            client_address,
            due_date,
            status,
            tax_rate,
            discount_amount,
            notes,
            terms
        } = req.body;

        // Check if invoice exists
        const checkResult = await client.query(
            'SELECT status FROM invoices WHERE id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        // Don't allow editing paid invoices
        if (checkResult.rows[0].status === 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Cannot edit a paid invoice'
            });
        }

        // Build update query
        const updates = [];
        const params = [];
        let paramCount = 1;

        if (client_name !== undefined) {
            updates.push(`client_name = $${paramCount}`);
            params.push(client_name);
            paramCount++;
        }

        if (client_email !== undefined) {
            updates.push(`client_email = $${paramCount}`);
            params.push(client_email);
            paramCount++;
        }

        if (client_address !== undefined) {
            updates.push(`client_address = $${paramCount}`);
            params.push(client_address);
            paramCount++;
        }

        if (due_date !== undefined) {
            updates.push(`due_date = $${paramCount}`);
            params.push(due_date);
            paramCount++;
        }

        if (status !== undefined) {
            updates.push(`status = $${paramCount}`);
            params.push(status);
            paramCount++;
        }

        if (tax_rate !== undefined) {
            updates.push(`tax_rate = $${paramCount}`);
            params.push(tax_rate);
            paramCount++;
        }

        if (discount_amount !== undefined) {
            updates.push(`discount_amount = $${paramCount}`);
            params.push(discount_amount);
            paramCount++;
        }

        if (notes !== undefined) {
            updates.push(`notes = $${paramCount}`);
            params.push(notes);
            paramCount++;
        }

        if (terms !== undefined) {
            updates.push(`terms = $${paramCount}`);
            params.push(terms);
            paramCount++;
        }

        if (updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        params.push(id);
        const result = await client.query(
            `UPDATE invoices SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            params
        );

        // Recalculate totals if tax or discount changed
        if (tax_rate !== undefined || discount_amount !== undefined) {
            await client.query(
                `UPDATE invoices 
                 SET tax_amount = subtotal * (tax_rate / 100),
                     total = subtotal + (subtotal * (tax_rate / 100)) - discount_amount
                 WHERE id = $1`,
                [id]
            );
        }

        const completeInvoice = await getInvoiceComplete(client, id);

        res.json({
            success: true,
            message: 'Invoice updated successfully',
            data: {
                invoice: completeInvoice
            }
        });

    } catch (error) {
        console.error('Error updating invoice:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update invoice',
            error: error.message
        });
    } finally {
        client.release();
    }
};

// Delete invoice
const deleteInvoice = async (req, res) => {
    const client = await db.pool.connect();
    
    try {
        const { id } = req.params;

        // Check if invoice has payments
        const paymentsCheck = await client.query(
            'SELECT 1 FROM payments WHERE invoice_id = $1',
            [id]
        );

        if (paymentsCheck.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete invoice with recorded payments'
            });
        }

        const result = await client.query(
            'DELETE FROM invoices WHERE id = $1 RETURNING invoice_number',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        res.json({
            success: true,
            message: `Invoice ${result.rows[0].invoice_number} deleted successfully`
        });

    } catch (error) {
        console.error('Error deleting invoice:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete invoice',
            error: error.message
        });
    } finally {
        client.release();
    }
};

// ============================================
// PAYMENTS
// ============================================

// Record payment
const recordPayment = async (req, res) => {
    const client = await db.pool.connect();
    
    try {
        const {
            invoice_id,
            amount,
            payment_date,
            payment_method,
            transaction_id,
            notes
        } = req.body;

        // Validate required fields
        if (!invoice_id || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Invoice ID and amount are required'
            });
        }

        // Verify invoice exists and get balance
        const invoiceCheck = await client.query(
            `SELECT i.total, COALESCE(SUM(p.amount), 0) as paid
             FROM invoices i
             LEFT JOIN payments p ON i.id = p.invoice_id
             WHERE i.id = $1
             GROUP BY i.id, i.total`,
            [invoice_id]
        );

        if (invoiceCheck.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        const invoice = invoiceCheck.rows[0];
        const balance = invoice.total - invoice.paid;

        if (amount > balance) {
            return res.status(400).json({
                success: false,
                message: `Payment amount ($${amount}) exceeds invoice balance ($${balance})`
            });
        }

        const result = await client.query(
            `INSERT INTO payments 
             (invoice_id, amount, payment_date, payment_method, transaction_id, notes, recorded_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                invoice_id,
                amount,
                payment_date || new Date(),
                payment_method || null,
                transaction_id || null,
                notes || null,
                req.user.userId
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Payment recorded successfully',
            data: {
                payment: result.rows[0]
            }
        });

    } catch (error) {
        console.error('Error recording payment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to record payment',
            error: error.message
        });
    } finally {
        client.release();
    }
};

// ============================================
// ANALYTICS
// ============================================

// Get revenue analytics
const getRevenueAnalytics = async (req, res) => {
    const client = await db.pool.connect();
    
    try {
        const { start_date, end_date, group_by } = req.query;
        const groupByField = group_by || 'month'; // month, quarter, year, project

        let query, params = [];
        let paramCount = 1;

        if (groupByField === 'project') {
            query = `
                SELECT 
                    p.id as project_id,
                    p.name as project_name,
                    COUNT(DISTINCT i.id) as invoice_count,
                    SUM(i.total) as total_invoiced,
                    SUM(CASE WHEN i.status = 'paid' THEN i.total ELSE 0 END) as total_paid,
                    SUM(CASE WHEN i.status = 'overdue' THEN i.total ELSE 0 END) as total_overdue,
                    SUM(i.total) - SUM(CASE WHEN i.status = 'paid' THEN i.total ELSE 0 END) as total_outstanding
                FROM projects p
                LEFT JOIN invoices i ON p.id = i.project_id
                WHERE 1=1
            `;

            if (start_date) {
                query += ` AND i.issue_date >= $${paramCount}`;
                params.push(start_date);
                paramCount++;
            }

            if (end_date) {
                query += ` AND i.issue_date <= $${paramCount}`;
                params.push(end_date);
                paramCount++;
            }

            query += ` GROUP BY p.id, p.name ORDER BY total_invoiced DESC NULLS LAST`;

        } else {
            let dateGrouping;
            if (groupByField === 'year') {
                dateGrouping = "DATE_TRUNC('year', i.issue_date)";
            } else if (groupByField === 'quarter') {
                dateGrouping = "DATE_TRUNC('quarter', i.issue_date)";
            } else { // month
                dateGrouping = "DATE_TRUNC('month', i.issue_date)";
            }

            query = `
                SELECT 
                    ${dateGrouping} as period,
                    COUNT(i.id) as invoice_count,
                    SUM(i.total) as total_invoiced,
                    SUM(CASE WHEN i.status = 'paid' THEN i.total ELSE 0 END) as total_paid,
                    SUM(CASE WHEN i.status = 'overdue' THEN i.total ELSE 0 END) as total_overdue,
                    SUM(i.total) - SUM(CASE WHEN i.status = 'paid' THEN i.total ELSE 0 END) as total_outstanding
                FROM invoices i
                WHERE 1=1
            `;

            if (start_date) {
                query += ` AND i.issue_date >= $${paramCount}`;
                params.push(start_date);
                paramCount++;
            }

            if (end_date) {
                query += ` AND i.issue_date <= $${paramCount}`;
                params.push(end_date);
                paramCount++;
            }

            query += ` GROUP BY ${dateGrouping} ORDER BY period DESC`;
        }

        const result = await client.query(query, params);

        // Overall summary
        const summaryQuery = await client.query(
            `SELECT 
                COUNT(DISTINCT i.id) as total_invoices,
                SUM(i.total) as total_invoiced,
                SUM(CASE WHEN i.status = 'paid' THEN i.total ELSE 0 END) as total_paid,
                SUM(CASE WHEN i.status = 'draft' THEN i.total ELSE 0 END) as total_draft,
                SUM(CASE WHEN i.status = 'sent' THEN i.total ELSE 0 END) as total_sent,
                SUM(CASE WHEN i.status = 'overdue' THEN i.total ELSE 0 END) as total_overdue,
                SUM(i.total) - SUM(CASE WHEN i.status = 'paid' THEN i.total ELSE 0 END) as total_outstanding,
                AVG(i.total) as average_invoice_value
             FROM invoices i
             WHERE ($1::date IS NULL OR i.issue_date >= $1)
             AND ($2::date IS NULL OR i.issue_date <= $2)`,
            [start_date || null, end_date || null]
        );

        res.json({
            success: true,
            data: {
                analytics: result.rows,
                summary: summaryQuery.rows[0]
            }
        });

    } catch (error) {
        console.error('Error fetching revenue analytics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch revenue analytics',
            error: error.message
        });
    } finally {
        client.release();
    }
};

module.exports = {
    getBillingRates,
    setBillingRate,
    getInvoices,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    recordPayment,
    getRevenueAnalytics
};
