const db = require('../config/db');

// Get all projects (filtered by user role)
exports.getAllProjects = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    let query;
    let params;

    if (userRole === 'admin') {
      // Admin sees all projects
      query = `
        SELECT p.*, 
               u.first_name || ' ' || u.last_name as created_by_name,
               COUNT(DISTINCT pm.user_id) as team_size,
               COUNT(DISTINCT t.id) as total_tasks,
               COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END) as completed_tasks
        FROM projects p
        LEFT JOIN users u ON p.created_by = u.id
        LEFT JOIN project_members pm ON p.id = pm.project_id
        LEFT JOIN tasks t ON p.id = t.project_id
        GROUP BY p.id, u.first_name, u.last_name
        ORDER BY p.created_at DESC
      `;
      params = [];
    } else {
      // Project managers and team members see only their projects
      query = `
        SELECT p.*, 
               u.first_name || ' ' || u.last_name as created_by_name,
               pm.role as my_role,
               COUNT(DISTINCT pm2.user_id) as team_size,
               COUNT(DISTINCT t.id) as total_tasks,
               COUNT(DISTINCT CASE WHEN t.status = 'done' THEN t.id END) as completed_tasks
        FROM projects p
        LEFT JOIN users u ON p.created_by = u.id
        INNER JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = $1
        LEFT JOIN project_members pm2 ON p.id = pm2.project_id
        LEFT JOIN tasks t ON p.id = t.project_id
        GROUP BY p.id, u.first_name, u.last_name, pm.role
        ORDER BY p.created_at DESC
      `;
      params = [userId];
    }

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: {
        projects: result.rows,
        count: result.rows.length
      }
    });
  } catch (error) {
    console.error('Get all projects error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch projects' });
  }
};

// Get single project by ID
exports.getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Get project details
    const projectQuery = `
      SELECT p.*, 
             u.first_name || ' ' || u.last_name as created_by_name,
             u.email as created_by_email
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.id = $1
    `;
    const projectResult = await db.query(projectQuery, [projectId]);

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const project = projectResult.rows[0];

    // Check if user has access (admin or project member)
    if (userRole !== 'admin') {
      const memberCheck = await db.query(
        'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
        [projectId, userId]
      );

      if (memberCheck.rows.length === 0) {
        return res.status(403).json({ success: false, message: 'Access denied to this project' });
      }

      project.my_role = memberCheck.rows[0].role;
    }

    // Get team members
    const membersQuery = `
      SELECT pm.role, pm.assigned_at,
             u.id, u.email, u.first_name, u.last_name, u.role as user_role
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = $1
      ORDER BY pm.assigned_at ASC
    `;
    const membersResult = await db.query(membersQuery, [projectId]);

    // Get task statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'todo' THEN 1 END) as todo_tasks,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,
        COUNT(CASE WHEN status = 'review' THEN 1 END) as review_tasks,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as completed_tasks,
        SUM(estimated_hours) as total_estimated_hours,
        SUM(actual_hours) as total_actual_hours
      FROM tasks
      WHERE project_id = $1
    `;
    const statsResult = await db.query(statsQuery, [projectId]);

    res.json({
      success: true,
      data: {
        project,
        team_members: membersResult.rows,
        statistics: statsResult.rows[0]
      }
    });
  } catch (error) {
    console.error('Get project by ID error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch project' });
  }
};

// Create new project
exports.createProject = async (req, res) => {
  try {
    const { name, description, budget, start_date, end_date, team_members } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Only admin and project managers can create projects
    if (!['admin', 'project_manager'].includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only admins and project managers can create projects' 
      });
    }

    // Validate required fields
    if (!name) {
      return res.status(400).json({ success: false, message: 'Project name is required' });
    }

    // Create project
    const projectResult = await db.query(
      `INSERT INTO projects (name, description, budget, start_date, end_date, created_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'active')
       RETURNING *`,
      [name, description, budget || null, start_date || null, end_date || null, userId]
    );

    const project = projectResult.rows[0];

    // Add creator as project owner
    await db.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, 'owner')`,
      [project.id, userId]
    );

    // Add team members if provided
    if (team_members && Array.isArray(team_members) && team_members.length > 0) {
      for (const member of team_members) {
        if (member.user_id && member.user_id !== userId) {
          await db.query(
            `INSERT INTO project_members (project_id, user_id, role)
             VALUES ($1, $2, $3)
             ON CONFLICT (project_id, user_id) DO NOTHING`,
            [project.id, member.user_id, member.role || 'member']
          );
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ success: false, message: 'Failed to create project' });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, description, budget, start_date, end_date, status } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Check if user has permission (admin, project owner, or manager)
    if (userRole !== 'admin') {
      const memberCheck = await db.query(
        `SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2`,
        [projectId, userId]
      );

      if (memberCheck.rows.length === 0 || 
          !['owner', 'manager'].includes(memberCheck.rows[0].role)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Only project owners/managers can update projects' 
        });
      }
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (budget !== undefined) {
      updates.push(`budget = $${paramCount++}`);
      values.push(budget);
    }
    if (start_date !== undefined) {
      updates.push(`start_date = $${paramCount++}`);
      values.push(start_date);
    }
    if (end_date !== undefined) {
      updates.push(`end_date = $${paramCount++}`);
      values.push(end_date);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    values.push(projectId);
    const query = `
      UPDATE projects 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: { project: result.rows[0] }
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ success: false, message: 'Failed to update project' });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Only admin or project owner can delete
    if (userRole !== 'admin') {
      const ownerCheck = await db.query(
        `SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2 AND role = 'owner'`,
        [projectId, userId]
      );

      if (ownerCheck.rows.length === 0) {
        return res.status(403).json({ 
          success: false, 
          message: 'Only project owners can delete projects' 
        });
      }
    }

    const result = await db.query(
      'DELETE FROM projects WHERE id = $1 RETURNING name',
      [projectId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({
      success: true,
      message: `Project "${result.rows[0].name}" deleted successfully`
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete project' });
  }
};

// Add team member to project
exports.addTeamMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { user_id, role } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Check permissions
    if (userRole !== 'admin') {
      const managerCheck = await db.query(
        `SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2`,
        [projectId, userId]
      );

      if (managerCheck.rows.length === 0 || 
          !['owner', 'manager'].includes(managerCheck.rows[0].role)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Only project owners/managers can add team members' 
        });
      }
    }

    // Check if user exists
    const userExists = await db.query('SELECT id, first_name, last_name FROM users WHERE id = $1', [user_id]);
    if (userExists.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Add team member
    await db.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (project_id, user_id) 
       DO UPDATE SET role = $3`,
      [projectId, user_id, role || 'member']
    );

    const user = userExists.rows[0];
    res.json({
      success: true,
      message: `${user.first_name} ${user.last_name} added to project successfully`
    });
  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({ success: false, message: 'Failed to add team member' });
  }
};

// Remove team member from project
exports.removeTeamMember = async (req, res) => {
  try {
    const { projectId, memberId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Check permissions
    if (userRole !== 'admin') {
      const managerCheck = await db.query(
        `SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2`,
        [projectId, userId]
      );

      if (managerCheck.rows.length === 0 || 
          !['owner', 'manager'].includes(managerCheck.rows[0].role)) {
        return res.status(403).json({ 
          success: false, 
          message: 'Only project owners/managers can remove team members' 
        });
      }
    }

    // Cannot remove project owner
    const memberCheck = await db.query(
      'SELECT role FROM project_members WHERE project_id = $1 AND user_id = $2',
      [projectId, memberId]
    );

    if (memberCheck.rows.length > 0 && memberCheck.rows[0].role === 'owner') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot remove project owner' 
      });
    }

    const result = await db.query(
      'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2 RETURNING user_id',
      [projectId, memberId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Team member not found in project' });
    }

    res.json({
      success: true,
      message: 'Team member removed from project successfully'
    });
  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove team member' });
  }
};
