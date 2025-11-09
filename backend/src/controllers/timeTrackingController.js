const db = require('../config/db');

// ============================================
// LOG TIME
// Create a new time log entry
// ============================================
const logTime = async (req, res) => {
    const client = await db.pool.connect();
    
    try {
        const userId = req.user.userId;
        const { project_id, task_id, description, hours, log_date, is_billable, hourly_rate } = req.body;

        // Validate required fields
        if (!project_id || !hours) {
            return res.status(400).json({
                success: false,
                message: 'Project ID and hours are required'
            });
        }

        // Verify user has access to the project
        const accessCheck = await client.query(
            `SELECT pm.role FROM project_members pm 
             WHERE pm.project_id = $1 AND pm.user_id = $2`,
            [project_id, userId]
        );

        if (accessCheck.rows.length === 0 && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You do not have access to this project'
            });
        }

        // Use provided hourly_rate, or get from billing_rates if not provided
        let finalHourlyRate = hourly_rate || null;
        
        if (!finalHourlyRate) {
            // Get applicable billing rate from database
            const rateQuery = await client.query(
                `SELECT rate FROM billing_rates 
                 WHERE project_id = $1 
                 AND (user_id = $2 OR user_id IS NULL)
                 AND is_active = true
                 AND (effective_from <= CURRENT_DATE)
                 AND (effective_to IS NULL OR effective_to >= CURRENT_DATE)
                 ORDER BY user_id NULLS LAST, effective_from DESC
                 LIMIT 1`,
                [project_id, userId]
            );

            finalHourlyRate = rateQuery.rows[0]?.rate || null;
        }

        // Insert time log
        const result = await client.query(
            `INSERT INTO time_logs 
             (user_id, project_id, task_id, description, hours, log_date, is_billable, hourly_rate)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [
                userId, 
                project_id, 
                task_id || null, 
                description || null, 
                hours, 
                log_date || new Date(), 
                is_billable !== undefined ? is_billable : true,
                finalHourlyRate
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Time logged successfully',
            data: {
                timeLog: result.rows[0]
            }
        });

    } catch (error) {
        console.error('Error logging time:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to log time',
            error: error.message
        });
    } finally {
        client.release();
    }
};

// ============================================
// GET TIME LOGS
// Get time logs with filters
// ============================================
const getTimeLogs = async (req, res) => {
    const client = await db.pool.connect();
    
    try {
        const userId = req.user.userId;
        const userRole = req.user.role;
        const { 
            project_id, 
            task_id, 
            user_id, 
            start_date, 
            end_date,
            is_billable 
        } = req.query;

        let query = `
            SELECT 
                tl.*,
                CASE 
                    WHEN u.first_name IS NOT NULL THEN u.first_name || ' ' || u.last_name
                    ELSE NULL
                END as user_name,
                u.email as user_email,
                p.name as project_name,
                t.title as task_title,
                (tl.hours * COALESCE(tl.hourly_rate, 0)) as billable_amount
            FROM time_logs tl
            JOIN users u ON tl.user_id = u.id
            JOIN projects p ON tl.project_id = p.id
            LEFT JOIN tasks t ON tl.task_id = t.id
            WHERE 1=1
        `;
        
        const params = [];
        let paramCount = 1;

        // Filter by project
        if (project_id) {
            query += ` AND tl.project_id = $${paramCount}`;
            params.push(project_id);
            paramCount++;
        }

        // Filter by task
        if (task_id) {
            query += ` AND tl.task_id = $${paramCount}`;
            params.push(task_id);
            paramCount++;
        }

        // Filter by user (or restrict to own logs if not admin)
        if (user_id) {
            query += ` AND tl.user_id = $${paramCount}`;
            params.push(user_id);
            paramCount++;
        } else if (userRole !== 'admin') {
            // Non-admins can only see logs from projects they're part of
            query += ` AND tl.project_id IN (
                SELECT project_id FROM project_members WHERE user_id = $${paramCount}
            )`;
            params.push(userId);
            paramCount++;
        }

        // Filter by date range
        if (start_date) {
            query += ` AND tl.log_date >= $${paramCount}`;
            params.push(start_date);
            paramCount++;
        }

        if (end_date) {
            query += ` AND tl.log_date <= $${paramCount}`;
            params.push(end_date);
            paramCount++;
        }

        // Filter by billable status
        if (is_billable !== undefined) {
            query += ` AND tl.is_billable = $${paramCount}`;
            params.push(is_billable === 'true');
            paramCount++;
        }

        query += ` ORDER BY tl.log_date DESC, tl.created_at DESC`;

        const result = await client.query(query, params);

        // Calculate summary
        const summary = {
            total_logs: result.rows.length,
            total_hours: result.rows.reduce((sum, log) => sum + parseFloat(log.hours), 0),
            billable_hours: result.rows.filter(log => log.is_billable).reduce((sum, log) => sum + parseFloat(log.hours), 0),
            non_billable_hours: result.rows.filter(log => !log.is_billable).reduce((sum, log) => sum + parseFloat(log.hours), 0),
            total_amount: result.rows.reduce((sum, log) => sum + parseFloat(log.billable_amount || 0), 0)
        };

        res.json({
            success: true,
            data: {
                timeLogs: result.rows,
                summary
            }
        });

    } catch (error) {
        console.error('Error fetching time logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch time logs',
            error: error.message
        });
    } finally {
        client.release();
    }
};

// ============================================
// GET TIME LOG BY ID
// Get a specific time log
// ============================================
const getTimeLogById = async (req, res) => {
    const client = await db.pool.connect();
    
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;

        const result = await client.query(
            `SELECT 
                tl.*,
                CASE 
                    WHEN u.first_name IS NOT NULL THEN u.first_name || ' ' || u.last_name
                    ELSE NULL
                END as user_name,
                u.email as user_email,
                p.name as project_name,
                t.title as task_title,
                (tl.hours * COALESCE(tl.hourly_rate, 0)) as billable_amount
             FROM time_logs tl
             JOIN users u ON tl.user_id = u.id
             JOIN projects p ON tl.project_id = p.id
             LEFT JOIN tasks t ON tl.task_id = t.id
             WHERE tl.id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Time log not found'
            });
        }

        const timeLog = result.rows[0];

        // Check access permissions
        if (userRole !== 'admin' && timeLog.user_id !== userId) {
            // Check if user is part of the project
            const accessCheck = await client.query(
                `SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2`,
                [timeLog.project_id, userId]
            );

            if (accessCheck.rows.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }
        }

        res.json({
            success: true,
            data: { timeLog }
        });

    } catch (error) {
        console.error('Error fetching time log:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch time log',
            error: error.message
        });
    } finally {
        client.release();
    }
};

// ============================================
// UPDATE TIME LOG
// Update an existing time log
// ============================================
const updateTimeLog = async (req, res) => {
    const client = await db.pool.connect();
    
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;
        const { description, hours, log_date, is_billable, hourly_rate } = req.body;

        // Check if time log exists and user owns it
        const checkResult = await client.query(
            'SELECT * FROM time_logs WHERE id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Time log not found'
            });
        }

        const timeLog = checkResult.rows[0];

        // Only owner or admin can update
        if (timeLog.user_id !== userId && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own time logs'
            });
        }

        // Build update query
        const updates = [];
        const params = [];
        let paramCount = 1;

        if (description !== undefined) {
            updates.push(`description = $${paramCount}`);
            params.push(description);
            paramCount++;
        }

        if (hours !== undefined) {
            updates.push(`hours = $${paramCount}`);
            params.push(hours);
            paramCount++;
        }

        if (log_date !== undefined) {
            updates.push(`log_date = $${paramCount}`);
            params.push(log_date);
            paramCount++;
        }

        if (is_billable !== undefined) {
            updates.push(`is_billable = $${paramCount}`);
            params.push(is_billable);
            paramCount++;
        }

        if (hourly_rate !== undefined) {
            updates.push(`hourly_rate = $${paramCount}`);
            params.push(hourly_rate);
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
            `UPDATE time_logs SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            params
        );

        res.json({
            success: true,
            message: 'Time log updated successfully',
            data: {
                timeLog: result.rows[0]
            }
        });

    } catch (error) {
        console.error('Error updating time log:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update time log',
            error: error.message
        });
    } finally {
        client.release();
    }
};

// ============================================
// DELETE TIME LOG
// Delete a time log
// ============================================
const deleteTimeLog = async (req, res) => {
    const client = await db.pool.connect();
    
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;

        // Check if time log exists
        const checkResult = await client.query(
            'SELECT * FROM time_logs WHERE id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Time log not found'
            });
        }

        const timeLog = checkResult.rows[0];

        // Only owner or admin can delete
        if (timeLog.user_id !== userId && userRole !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own time logs'
            });
        }

        // Check if already invoiced
        const invoiceCheck = await client.query(
            'SELECT 1 FROM invoice_items WHERE time_log_id = $1',
            [id]
        );

        if (invoiceCheck.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete time log that has been invoiced'
            });
        }

        await client.query('DELETE FROM time_logs WHERE id = $1', [id]);

        res.json({
            success: true,
            message: 'Time log deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting time log:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete time log',
            error: error.message
        });
    } finally {
        client.release();
    }
};

// ============================================
// GET TIMESHEET
// Generate timesheet report
// ============================================
const getTimesheet = async (req, res) => {
    const client = await db.pool.connect();
    
    try {
        const { user_id, project_id, start_date, end_date, group_by } = req.query;
        const userId = req.user.userId;
        const userRole = req.user.role;

        // Default to current user if not specified
        const targetUserId = user_id || userId;

        // Admin can view any user's timesheet, others only their own
        if (userRole !== 'admin' && targetUserId != userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only view your own timesheet'
            });
        }

        // Build query based on grouping
        let query, params;
        const groupByField = group_by || 'date'; // date, project, task

        if (groupByField === 'project') {
            query = `
                SELECT 
                    p.id as project_id,
                    p.name as project_name,
                    COUNT(tl.id) as log_count,
                    SUM(tl.hours) as total_hours,
                    SUM(CASE WHEN tl.is_billable THEN tl.hours ELSE 0 END) as billable_hours,
                    SUM(CASE WHEN tl.is_billable THEN tl.hours * COALESCE(tl.hourly_rate, 0) ELSE 0 END) as billable_amount,
                    MIN(tl.log_date) as first_date,
                    MAX(tl.log_date) as last_date
                FROM time_logs tl
                JOIN projects p ON tl.project_id = p.id
                WHERE tl.user_id = $1
            `;
            params = [targetUserId];

            if (project_id) {
                query += ' AND tl.project_id = $2';
                params.push(project_id);
            }
            if (start_date) {
                query += ` AND tl.log_date >= $${params.length + 1}`;
                params.push(start_date);
            }
            if (end_date) {
                query += ` AND tl.log_date <= $${params.length + 1}`;
                params.push(end_date);
            }

            query += ' GROUP BY p.id, p.name ORDER BY total_hours DESC';

        } else if (groupByField === 'task') {
            query = `
                SELECT 
                    t.id as task_id,
                    t.title as task_title,
                    p.name as project_name,
                    COUNT(tl.id) as log_count,
                    SUM(tl.hours) as total_hours,
                    SUM(CASE WHEN tl.is_billable THEN tl.hours ELSE 0 END) as billable_hours,
                    SUM(CASE WHEN tl.is_billable THEN tl.hours * COALESCE(tl.hourly_rate, 0) ELSE 0 END) as billable_amount
                FROM time_logs tl
                LEFT JOIN tasks t ON tl.task_id = t.id
                LEFT JOIN projects p ON tl.project_id = p.id
                WHERE tl.user_id = $1
            `;
            params = [targetUserId];

            if (project_id) {
                query += ' AND tl.project_id = $2';
                params.push(project_id);
            }
            if (start_date) {
                query += ` AND tl.log_date >= $${params.length + 1}`;
                params.push(start_date);
            }
            if (end_date) {
                query += ` AND tl.log_date <= $${params.length + 1}`;
                params.push(end_date);
            }

            query += ' GROUP BY t.id, t.title, p.name ORDER BY total_hours DESC';

        } else { // group by date
            query = `
                SELECT 
                    tl.log_date as date,
                    COUNT(tl.id) as log_count,
                    SUM(tl.hours) as total_hours,
                    SUM(CASE WHEN tl.is_billable THEN tl.hours ELSE 0 END) as billable_hours,
                    SUM(CASE WHEN tl.is_billable THEN tl.hours * COALESCE(tl.hourly_rate, 0) ELSE 0 END) as billable_amount,
                    STRING_AGG(DISTINCT p.name, ', ') as projects
                FROM time_logs tl
                JOIN projects p ON tl.project_id = p.id
                WHERE tl.user_id = $1
            `;
            params = [targetUserId];

            if (project_id) {
                query += ' AND tl.project_id = $2';
                params.push(project_id);
            }
            if (start_date) {
                query += ` AND tl.log_date >= $${params.length + 1}`;
                params.push(start_date);
            }
            if (end_date) {
                query += ` AND tl.log_date <= $${params.length + 1}`;
                params.push(end_date);
            }

            query += ' GROUP BY tl.log_date ORDER BY tl.log_date DESC';
        }

        const result = await client.query(query, params);

        // Calculate summary
        const summary = {
            total_entries: result.rows.reduce((sum, row) => sum + parseInt(row.log_count), 0),
            total_hours: result.rows.reduce((sum, row) => sum + parseFloat(row.total_hours), 0),
            billable_hours: result.rows.reduce((sum, row) => sum + parseFloat(row.billable_hours || 0), 0),
            total_amount: result.rows.reduce((sum, row) => sum + parseFloat(row.billable_amount || 0), 0)
        };

        res.json({
            success: true,
            data: {
                timesheet: result.rows,
                summary,
                filters: {
                    user_id: targetUserId,
                    project_id,
                    start_date,
                    end_date,
                    group_by: groupByField
                }
            }
        });

    } catch (error) {
        console.error('Error generating timesheet:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate timesheet',
            error: error.message
        });
    } finally {
        client.release();
    }
};

module.exports = {
    logTime,
    getTimeLogs,
    getTimeLogById,
    updateTimeLog,
    deleteTimeLog,
    getTimesheet
};
