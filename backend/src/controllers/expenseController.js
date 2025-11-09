const db = require('../config/db');

// ============================================
// EXPENSES
// ============================================

// Get all expenses
exports.getExpenses = async (req, res) => {
    try {
        const { project_id, user_id, status, is_billable } = req.query;
        const currentUserId = req.user.userId;
        const userRole = req.user.role;
        
        let query = `
            SELECT 
                e.*,
                p.name as project_name,
                u.first_name || ' ' || u.last_name as user_name,
                u.email as user_email,
                approver.first_name || ' ' || approver.last_name as approved_by_name
            FROM expenses e
            LEFT JOIN projects p ON e.project_id = p.id
            LEFT JOIN users u ON e.user_id = u.id
            LEFT JOIN users approver ON e.approved_by = approver.id
            WHERE 1=1
        `;
        
        const params = [];
        let paramCount = 1;

        // Team members can only see their own expenses
        if (userRole === 'team_member') {
            query += ` AND e.user_id = $${paramCount}`;
            params.push(currentUserId);
            paramCount++;
        } else if (user_id) {
            query += ` AND e.user_id = $${paramCount}`;
            params.push(user_id);
            paramCount++;
        }

        if (project_id) {
            query += ` AND e.project_id = $${paramCount}`;
            params.push(project_id);
            paramCount++;
        }

        if (status) {
            query += ` AND e.status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }

        if (is_billable !== undefined) {
            query += ` AND e.is_billable = $${paramCount}`;
            params.push(is_billable === 'true');
            paramCount++;
        }

        query += ` ORDER BY e.created_at DESC`;

        const result = await db.query(query, params);
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get expenses error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch expenses' });
    }
};

// Get expense by ID
exports.getExpenseById = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user.userId;
        const userRole = req.user.role;

        const result = await db.query(`
            SELECT 
                e.*,
                p.name as project_name,
                u.first_name || ' ' || u.last_name as user_name,
                u.email as user_email,
                approver.first_name || ' ' || approver.last_name as approved_by_name
            FROM expenses e
            LEFT JOIN projects p ON e.project_id = p.id
            LEFT JOIN users u ON e.user_id = u.id
            LEFT JOIN users approver ON e.approved_by = approver.id
            WHERE e.id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }

        // Team members can only view their own expenses
        if (userRole === 'team_member' && result.rows[0].user_id !== currentUserId) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Get expense error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch expense' });
    }
};

// Create expense
exports.createExpense = async (req, res) => {
    try {
        const {
            project_id,
            category,
            description,
            amount,
            expense_date,
            is_billable,
            receipt_url,
            notes
        } = req.body;

        const currentUserId = req.user.userId;

        // Generate expense number
        const countResult = await db.query('SELECT COUNT(*) FROM expenses');
        const count = parseInt(countResult.rows[0].count) + 1;
        const expense_number = `EXP-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;

        const result = await db.query(`
            INSERT INTO expenses (
                expense_number, project_id, user_id, category, description, amount,
                expense_date, is_billable, receipt_url, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `, [
            expense_number, project_id, currentUserId, category, description, amount,
            expense_date, is_billable || false, receipt_url, notes
        ]);

        res.status(201).json({
            success: true,
            message: 'Expense created successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Create expense error:', error);
        res.status(500).json({ success: false, message: 'Failed to create expense' });
    }
};

// Update expense (only if pending and own expense)
exports.updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user.userId;
        const userRole = req.user.role;

        // Check expense exists and ownership
        const expenseCheck = await db.query(
            'SELECT user_id, status FROM expenses WHERE id = $1',
            [id]
        );

        if (expenseCheck.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }

        const expense = expenseCheck.rows[0];

        // Only owner can update, and only if pending
        if (expense.user_id !== currentUserId && userRole !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        if (expense.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot update ${expense.status} expense`
            });
        }

        const {
            category,
            description,
            amount,
            expense_date,
            is_billable,
            receipt_url,
            notes
        } = req.body;

        const result = await db.query(`
            UPDATE expenses 
            SET category = $1, description = $2, amount = $3, expense_date = $4,
                is_billable = $5, receipt_url = $6, notes = $7, updated_at = CURRENT_TIMESTAMP
            WHERE id = $8
            RETURNING *
        `, [category, description, amount, expense_date, is_billable, receipt_url, notes, id]);

        res.json({
            success: true,
            message: 'Expense updated successfully',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update expense error:', error);
        res.status(500).json({ success: false, message: 'Failed to update expense' });
    }
};

// Approve/Reject expense (Admin or PM only)
exports.updateExpenseStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejection_reason } = req.body;
        const currentUserId = req.user.userId;
        const userRole = req.user.role;

        // Only admin and project_manager can approve/reject
        if (userRole !== 'admin' && userRole !== 'project_manager') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Validate status
        if (!['approved', 'rejected', 'reimbursed'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        let query = '';
        let params = [];

        if (status === 'approved') {
            query = `
                UPDATE expenses 
                SET status = $1, approved_by = $2, approved_at = CURRENT_TIMESTAMP, 
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $3 AND status = 'pending'
                RETURNING *
            `;
            params = [status, currentUserId, id];
        } else if (status === 'rejected') {
            query = `
                UPDATE expenses 
                SET status = $1, rejection_reason = $2, updated_at = CURRENT_TIMESTAMP
                WHERE id = $3 AND status = 'pending'
                RETURNING *
            `;
            params = [status, rejection_reason, id];
        } else if (status === 'reimbursed') {
            query = `
                UPDATE expenses 
                SET status = $1, updated_at = CURRENT_TIMESTAMP
                WHERE id = $2 AND status = 'approved'
                RETURNING *
            `;
            params = [status, id];
        }

        const result = await db.query(query, params);

        if (result.rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Expense not found or cannot be updated from current status'
            });
        }

        res.json({
            success: true,
            message: `Expense ${status} successfully`,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update expense status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update expense status' });
    }
};

// Delete expense (only if pending and own expense)
exports.deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const currentUserId = req.user.userId;
        const userRole = req.user.role;

        // Check expense exists and ownership
        const expense = await db.query(
            'SELECT user_id, status FROM expenses WHERE id = $1',
            [id]
        );

        if (expense.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }

        // Only owner or admin can delete, and only if pending
        if (expense.rows[0].user_id !== currentUserId && userRole !== 'admin') {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        if (expense.rows[0].status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot delete ${expense.rows[0].status} expense`
            });
        }

        await db.query('DELETE FROM expenses WHERE id = $1', [id]);

        res.json({
            success: true,
            message: 'Expense deleted successfully'
        });
    } catch (error) {
        console.error('Delete expense error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete expense' });
    }
};

// Get expense summary by project
exports.getExpenseSummary = async (req, res) => {
    try {
        const { project_id } = req.query;

        let query = `
            SELECT 
                COUNT(*) as total_count,
                SUM(amount) as total_amount,
                SUM(CASE WHEN is_billable THEN amount ELSE 0 END) as billable_amount,
                SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount,
                SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END) as approved_amount,
                SUM(CASE WHEN status = 'reimbursed' THEN amount ELSE 0 END) as reimbursed_amount
            FROM expenses
            WHERE 1=1
        `;

        const params = [];
        if (project_id) {
            query += ` AND project_id = $1`;
            params.push(project_id);
        }

        const result = await db.query(query, params);

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Get expense summary error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch expense summary' });
    }
};
