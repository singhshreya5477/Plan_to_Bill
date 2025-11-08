const db = require('../config/db');

// Get all tasks for a project
exports.getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Check if user has access to project
    if (userRole !== 'admin') {
      const memberCheck = await db.query(
        'SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2',
        [projectId, userId]
      );

      if (memberCheck.rows.length === 0) {
        return res.status(403).json({ success: false, message: 'Access denied to this project' });
      }
    }

    const query = `
      SELECT t.*,
             u1.first_name || ' ' || u1.last_name as assigned_to_name,
             u1.email as assigned_to_email,
             u2.first_name || ' ' || u2.last_name as created_by_name,
             COUNT(tc.id) as comments_count
      FROM tasks t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      LEFT JOIN task_comments tc ON t.id = tc.task_id
      WHERE t.project_id = $1
      GROUP BY t.id, u1.first_name, u1.last_name, u1.email, u2.first_name, u2.last_name
      ORDER BY 
        CASE t.priority
          WHEN 'urgent' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END,
        t.due_date ASC NULLS LAST,
        t.created_at DESC
    `;

    const result = await db.query(query, [projectId]);

    res.json({
      success: true,
      data: {
        tasks: result.rows,
        count: result.rows.length
      }
    });
  } catch (error) {
    console.error('Get project tasks error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
  }
};

// Get single task by ID
exports.getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const query = `
      SELECT t.*,
             u1.first_name || ' ' || u1.last_name as assigned_to_name,
             u1.email as assigned_to_email,
             u2.first_name || ' ' || u2.last_name as created_by_name,
             p.name as project_name
      FROM tasks t
      LEFT JOIN users u1 ON t.assigned_to = u1.id
      LEFT JOIN users u2 ON t.created_by = u2.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.id = $1
    `;

    const result = await db.query(query, [taskId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const task = result.rows[0];

    // Check if user has access to the project
    if (userRole !== 'admin') {
      const memberCheck = await db.query(
        'SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2',
        [task.project_id, userId]
      );

      if (memberCheck.rows.length === 0) {
        return res.status(403).json({ success: false, message: 'Access denied to this task' });
      }
    }

    // Get task comments
    const commentsQuery = `
      SELECT tc.*,
             u.first_name || ' ' || u.last_name as user_name,
             u.email as user_email
      FROM task_comments tc
      LEFT JOIN users u ON tc.user_id = u.id
      WHERE tc.task_id = $1
      ORDER BY tc.created_at ASC
    `;
    const commentsResult = await db.query(commentsQuery, [taskId]);

    res.json({
      success: true,
      data: {
        task,
        comments: commentsResult.rows
      }
    });
  } catch (error) {
    console.error('Get task by ID error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch task' });
  }
};

// Create new task
exports.createTask = async (req, res) => {
  try {
    const { project_id, title, description, priority, assigned_to, due_date, estimated_hours } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Validate required fields
    if (!project_id || !title) {
      return res.status(400).json({ success: false, message: 'Project ID and title are required' });
    }

    // Check if user has permission to create tasks in this project
    if (userRole !== 'admin') {
      const memberCheck = await db.query(
        `SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2`,
        [project_id, userId]
      );

      if (memberCheck.rows.length === 0) {
        return res.status(403).json({ 
          success: false, 
          message: 'You are not a member of this project' 
        });
      }

      // Only owner and manager can create tasks
      if (!['owner', 'manager'].includes(memberCheck.rows[0].role)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Only project owners/managers can create tasks' 
        });
      }
    }

    // Validate assigned user is project member
    if (assigned_to) {
      const assigneeCheck = await db.query(
        'SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2',
        [project_id, assigned_to]
      );

      if (assigneeCheck.rows.length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Assigned user is not a member of this project' 
        });
      }
    }

    const result = await db.query(
      `INSERT INTO tasks (project_id, title, description, priority, assigned_to, due_date, estimated_hours, created_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'todo')
       RETURNING *`,
      [project_id, title, description || null, priority || 'medium', assigned_to || null, 
       due_date || null, estimated_hours || null, userId]
    );

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task: result.rows[0] }
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ success: false, message: 'Failed to create task' });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, assigned_to, due_date, estimated_hours, actual_hours } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Get task to check project membership
    const taskCheck = await db.query('SELECT project_id, assigned_to FROM tasks WHERE id = $1', [taskId]);
    
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const task = taskCheck.rows[0];

    // Check permissions
    if (userRole !== 'admin') {
      const memberCheck = await db.query(
        `SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2`,
        [task.project_id, userId]
      );

      if (memberCheck.rows.length === 0) {
        return res.status(403).json({ success: false, message: 'Access denied to this task' });
      }

      const memberRole = memberCheck.rows[0].role;

      // Team members can only update their own tasks and limited fields
      if (memberRole === 'member' && task.assigned_to !== userId) {
        return res.status(403).json({ 
          success: false, 
          message: 'You can only update tasks assigned to you' 
        });
      }
    }

    // Build update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
      
      // Set completed_at when status changes to done
      if (status === 'done') {
        updates.push(`completed_at = NOW()`);
      }
    }
    if (priority !== undefined) {
      updates.push(`priority = $${paramCount++}`);
      values.push(priority);
    }
    if (assigned_to !== undefined) {
      updates.push(`assigned_to = $${paramCount++}`);
      values.push(assigned_to);
    }
    if (due_date !== undefined) {
      updates.push(`due_date = $${paramCount++}`);
      values.push(due_date);
    }
    if (estimated_hours !== undefined) {
      updates.push(`estimated_hours = $${paramCount++}`);
      values.push(estimated_hours);
    }
    if (actual_hours !== undefined) {
      updates.push(`actual_hours = $${paramCount++}`);
      values.push(actual_hours);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(taskId);
    const query = `
      UPDATE tasks 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task: result.rows[0] }
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ success: false, message: 'Failed to update task' });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Get task to check permissions
    const taskCheck = await db.query('SELECT project_id, title FROM tasks WHERE id = $1', [taskId]);
    
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const task = taskCheck.rows[0];

    // Check permissions
    if (userRole !== 'admin') {
      const memberCheck = await db.query(
        `SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2`,
        [task.project_id, userId]
      );

      if (memberCheck.rows.length === 0 || 
          !['owner', 'manager'].includes(memberCheck.rows[0].role)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Only project owners/managers can delete tasks' 
        });
      }
    }

    await db.query('DELETE FROM tasks WHERE id = $1', [taskId]);

    res.json({
      success: true,
      message: `Task "${task.title}" deleted successfully`
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete task' });
  }
};

// Add comment to task
exports.addTaskComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { comment } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    if (!comment || comment.trim() === '') {
      return res.status(400).json({ success: false, message: 'Comment cannot be empty' });
    }

    // Check if task exists and user has access
    const taskCheck = await db.query('SELECT project_id FROM tasks WHERE id = $1', [taskId]);
    
    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const task = taskCheck.rows[0];

    // Check if user is project member
    if (userRole !== 'admin') {
      const memberCheck = await db.query(
        'SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2',
        [task.project_id, userId]
      );

      if (memberCheck.rows.length === 0) {
        return res.status(403).json({ success: false, message: 'Access denied to this task' });
      }
    }

    const result = await db.query(
      `INSERT INTO task_comments (task_id, user_id, comment)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [taskId, userId, comment.trim()]
    );

    // Get user info for the comment
    const commentWithUser = await db.query(
      `SELECT tc.*, u.first_name || ' ' || u.last_name as user_name, u.email as user_email
       FROM task_comments tc
       LEFT JOIN users u ON tc.user_id = u.id
       WHERE tc.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comment: commentWithUser.rows[0] }
    });
  } catch (error) {
    console.error('Add task comment error:', error);
    res.status(500).json({ success: false, message: 'Failed to add comment' });
  }
};

// Get my tasks (tasks assigned to current user)
exports.getMyTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    const { status, priority } = req.query;

    console.log('=== getMyTasks called ===');
    console.log('User ID:', userId);
    console.log('User Role:', userRole);

    // TEMPORARY FIX: Show all tasks regardless of project membership
    // This will help us see tasks while we debug the membership issue
    let query = `
      SELECT t.*,
             p.name as project_name,
             u1.first_name || ' ' || u1.last_name as created_by_name,
             u2.first_name || ' ' || u2.last_name as assigned_to_name
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.assigned_to = u2.id
      WHERE 1=1
    `;
    let params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND t.status = $${paramCount++}`;
      params.push(status);
    }

    if (priority) {
      query += ` AND t.priority = $${paramCount++}`;
      params.push(priority);
    }

    query += ` ORDER BY 
      CASE t.priority
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
      END,
      t.due_date ASC NULLS LAST,
      t.created_at DESC
    `;

    console.log('Query params:', params);
    const result = await db.query(query, params);

    console.log('getMyTasks - Result count:', result.rows.length);
    if (result.rows.length > 0) {
      console.log('getMyTasks - First task:', result.rows[0]);
    }

    res.json({
      success: true,
      data: {
        tasks: result.rows,
        count: result.rows.length
      }
    });
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tasks' });
  }
};

// Admin: Delegate task to project manager
exports.delegateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { assignedTo, delegationNotes } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Only admins and project managers can delegate
    if (!['admin', 'project_manager'].includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins and project managers can delegate tasks' 
      });
    }

    // Get task details
    const taskCheck = await db.query(
      'SELECT * FROM tasks WHERE id = $1',
      [taskId]
    );

    if (taskCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const task = taskCheck.rows[0];

    // Check if user being assigned to exists
    const userCheck = await db.query(
      'SELECT id, role, first_name, last_name FROM users WHERE id = $1',
      [assignedTo]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const assignedUser = userCheck.rows[0];

    // Admins can delegate to project managers or team members
    // Project managers can delegate to team members
    if (userRole === 'admin' && !['project_manager', null].includes(assignedUser.role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Admins can only delegate to project managers or team members' 
      });
    }

    if (userRole === 'project_manager' && assignedUser.role && assignedUser.role !== null) {
      return res.status(400).json({ 
        success: false, 
        message: 'Project managers can only delegate to team members (users with no role)' 
      });
    }

    // Check if assigned user is a member of the project
    const memberCheck = await db.query(
      'SELECT id FROM project_members WHERE project_id = $1 AND user_id = $2',
      [task.project_id, assignedTo]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'User is not a member of this project' 
      });
    }

    // Update task with delegation info
    const updateQuery = `
      UPDATE tasks 
      SET assigned_to = $1,
          delegated_by = $2,
          delegation_notes = $3,
          is_delegated = TRUE,
          delegation_date = NOW(),
          updated_at = NOW()
      WHERE id = $4
      RETURNING *
    `;

    const result = await db.query(updateQuery, [
      assignedTo,
      userId,
      delegationNotes,
      taskId
    ]);

    // Record in delegation history
    await db.query(
      `INSERT INTO task_delegation_history (task_id, delegated_from, delegated_to, delegation_notes)
       VALUES ($1, $2, $3, $4)`,
      [taskId, userId, assignedTo, delegationNotes]
    );

    res.json({
      success: true,
      message: 'Task delegated successfully',
      data: { task: result.rows[0] }
    });
  } catch (error) {
    console.error('Delegate task error:', error);
    res.status(500).json({ success: false, message: 'Failed to delegate task' });
  }
};

// Get tasks delegated to current user (for project managers)
exports.getDelegatedTasks = async (req, res) => {
  try {
    const userId = req.user.userId;

    const query = `
      SELECT t.*,
             p.name as project_name,
             u1.first_name || ' ' || u1.last_name as delegated_by_name,
             u2.first_name || ' ' || u2.last_name as assigned_to_name,
             u2.email as assigned_to_email
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u1 ON t.delegated_by = u1.id
      LEFT JOIN users u2 ON t.assigned_to = u2.id
      WHERE t.assigned_to = $1 AND t.is_delegated = TRUE
      ORDER BY t.delegation_date DESC
    `;

    const result = await db.query(query, [userId]);

    res.json({
      success: true,
      data: {
        tasks: result.rows,
        count: result.rows.length
      }
    });
  } catch (error) {
    console.error('Get delegated tasks error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch delegated tasks' });
  }
};

// Get tasks I delegated to others (for admins and project managers)
exports.getTasksIDelegated = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    if (!['admin', 'project_manager'].includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins and project managers can view delegated tasks' 
      });
    }

    const query = `
      SELECT t.*,
             p.name as project_name,
             u.first_name || ' ' || u.last_name as assigned_to_name,
             u.email as assigned_to_email,
             u.role as assigned_to_role
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.delegated_by = $1
      ORDER BY t.delegation_date DESC
    `;

    const result = await db.query(query, [userId]);

    res.json({
      success: true,
      data: {
        tasks: result.rows,
        count: result.rows.length
      }
    });
  } catch (error) {
    console.error('Get tasks I delegated error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch delegated tasks' });
  }
};

// Get delegation history for a task
exports.getTaskDelegationHistory = async (req, res) => {
  try {
    const { taskId } = req.params;

    const query = `
      SELECT tdh.*,
             u1.first_name || ' ' || u1.last_name as delegated_from_name,
             u1.role as delegated_from_role,
             u2.first_name || ' ' || u2.last_name as delegated_to_name,
             u2.role as delegated_to_role
      FROM task_delegation_history tdh
      LEFT JOIN users u1 ON tdh.delegated_from = u1.id
      LEFT JOIN users u2 ON tdh.delegated_to = u2.id
      WHERE tdh.task_id = $1
      ORDER BY tdh.delegated_at ASC
    `;

    const result = await db.query(query, [taskId]);

    res.json({
      success: true,
      data: {
        history: result.rows,
        count: result.rows.length
      }
    });
  } catch (error) {
    console.error('Get task delegation history error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch delegation history' });
  }
};
