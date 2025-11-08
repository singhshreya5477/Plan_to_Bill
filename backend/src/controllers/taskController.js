const db = require('../config/db');

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, project_id, assigned_to, due_date } = req.body;
    const { userId, companyId, role } = req.user;

    // Check if user is project_manager or admin
    if (role !== 'project_manager' && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only project managers and admins can create tasks'
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

    // If assigned_to is provided, verify they're in the project
    if (assigned_to) {
      const memberCheck = await db.query(
        `SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2`,
        [project_id, assigned_to]
      );

      if (memberCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'User is not a member of this project'
        });
      }
    }

    // Create task
    const result = await db.query(
      `INSERT INTO tasks (title, description, status, priority, project_id, assigned_to, assigned_by, due_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, description, status || 'pending', priority || 'medium', project_id, assigned_to, userId, due_date]
    );

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task: result.rows[0]
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message
    });
  }
};

// Get all tasks
exports.getTasks = async (req, res) => {
  try {
    const { companyId, userId, role } = req.user;
    const { project_id, status, priority, assigned_to } = req.query;

    let query = `
      SELECT 
        t.*,
        p.name as project_name,
        u_assigned.first_name || ' ' || u_assigned.last_name as assigned_to_name,
        u_assigned.email as assigned_to_email,
        u_by.first_name || ' ' || u_by.last_name as assigned_by_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
      LEFT JOIN users u_by ON t.assigned_by = u_by.id
      WHERE p.company_id = $1
    `;
    
    const queryParams = [companyId];
    let paramCounter = 2;

    // If team_member, only show tasks assigned to them or in their projects
    if (role === 'team_member') {
      query += ` AND (t.assigned_to = $${paramCounter} OR p.id IN (
        SELECT project_id FROM project_members WHERE user_id = $${paramCounter}
      ))`;
      queryParams.push(userId);
      paramCounter++;
    }

    // Filter by project
    if (project_id) {
      query += ` AND t.project_id = $${paramCounter}`;
      queryParams.push(project_id);
      paramCounter++;
    }

    // Filter by status
    if (status) {
      query += ` AND t.status = $${paramCounter}`;
      queryParams.push(status);
      paramCounter++;
    }

    // Filter by priority
    if (priority) {
      query += ` AND t.priority = $${paramCounter}`;
      queryParams.push(priority);
      paramCounter++;
    }

    // Filter by assigned user
    if (assigned_to) {
      query += ` AND t.assigned_to = $${paramCounter}`;
      queryParams.push(assigned_to);
      paramCounter++;
    }

    query += ` ORDER BY t.created_at DESC`;

    const result = await db.query(query, queryParams);

    res.json({
      success: true,
      tasks: result.rows
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message
    });
  }
};

// Get single task
exports.getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId, userId, role } = req.user;

    const result = await db.query(
      `SELECT 
        t.*,
        p.name as project_name,
        u_assigned.first_name || ' ' || u_assigned.last_name as assigned_to_name,
        u_assigned.email as assigned_to_email,
        u_by.first_name || ' ' || u_by.last_name as assigned_by_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
      LEFT JOIN users u_by ON t.assigned_by = u_by.id
      WHERE t.id = $1 AND p.company_id = $2`,
      [id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if team_member has access
    if (role === 'team_member') {
      const task = result.rows[0];
      if (task.assigned_to !== userId) {
        const hasAccess = await db.query(
          `SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2`,
          [task.project_id, userId]
        );
        
        if (hasAccess.rows.length === 0) {
          return res.status(403).json({
            success: false,
            message: 'You do not have access to this task'
          });
        }
      }
    }

    res.json({
      success: true,
      task: result.rows[0]
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task',
      error: error.message
    });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assigned_to, due_date } = req.body;
    const { companyId, userId, role } = req.user;

    // Get task details
    const taskCheck = await db.query(
      `SELECT t.*, p.company_id 
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE t.id = $1 AND p.company_id = $2`,
      [id, companyId]
    );

    if (taskCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const task = taskCheck.rows[0];

    // Check permissions
    if (role === 'team_member') {
      // Team members can only update status of tasks assigned to them
      if (task.assigned_to !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only update tasks assigned to you'
        });
      }
      // Team members can only update status
      if (title || description || priority || assigned_to || due_date) {
        return res.status(403).json({
          success: false,
          message: 'You can only update task status'
        });
      }
    }

    // If assigned_to is being changed, verify they're in the project
    if (assigned_to && assigned_to !== task.assigned_to) {
      const memberCheck = await db.query(
        `SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2`,
        [task.project_id, assigned_to]
      );

      if (memberCheck.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'User is not a member of this project'
        });
      }
    }

    // Set completed_at timestamp if status is being changed to completed
    let completedAt = task.completed_at;
    if (status === 'completed' && task.status !== 'completed') {
      completedAt = new Date();
    } else if (status && status !== 'completed') {
      completedAt = null;
    }

    // Update task
    const result = await db.query(
      `UPDATE tasks 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           priority = COALESCE($4, priority),
           assigned_to = COALESCE($5, assigned_to),
           due_date = COALESCE($6, due_date),
           completed_at = $7,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [title, description, status, priority, assigned_to, due_date, completedAt, id]
    );

    res.json({
      success: true,
      message: 'Task updated successfully',
      task: result.rows[0]
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: error.message
    });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId, role } = req.user;

    // Check if user is project_manager or admin
    if (role !== 'project_manager' && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only project managers and admins can delete tasks'
      });
    }

    // Verify task belongs to user's company
    const taskCheck = await db.query(
      `SELECT t.* 
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE t.id = $1 AND p.company_id = $2`,
      [id, companyId]
    );

    if (taskCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Delete task
    await db.query(`DELETE FROM tasks WHERE id = $1`, [id]);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message
    });
  }
};
