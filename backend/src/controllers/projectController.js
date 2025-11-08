const db = require('../config/db');

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const { name, description, status, start_date, end_date, budget } = req.body;
    const { userId, companyId, role } = req.user;

    // Check if user is project_manager or admin
    if (role !== 'project_manager' && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only project managers and admins can create projects'
      });
    }

    // Create project
    const result = await db.query(
      `INSERT INTO projects (name, description, status, start_date, end_date, budget, company_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, description, status || 'active', start_date, end_date, budget, companyId, userId]
    );

    // Automatically assign the creator as project manager
    await db.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, $3)`,
      [result.rows[0].id, userId, 'manager']
    );

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: result.rows[0]
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating project',
      error: error.message
    });
  }
};

// Get all projects for the user's company
exports.getProjects = async (req, res) => {
  try {
    const { companyId, userId, role } = req.user;
    const { status, search } = req.query;

    let query = `
      SELECT 
        p.*,
        u.first_name || ' ' || u.last_name as creator_name,
        COUNT(DISTINCT pm.user_id) as team_size
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE p.company_id = $1
    `;
    
    const queryParams = [companyId];
    let paramCounter = 2;

    // If team_member, only show projects they're assigned to
    if (role === 'team_member') {
      query += ` AND p.id IN (
        SELECT project_id FROM project_members WHERE user_id = $${paramCounter}
      )`;
      queryParams.push(userId);
      paramCounter++;
    }

    // Filter by status
    if (status) {
      query += ` AND p.status = $${paramCounter}`;
      queryParams.push(status);
      paramCounter++;
    }

    // Search by name or description
    if (search) {
      query += ` AND (p.name ILIKE $${paramCounter} OR p.description ILIKE $${paramCounter})`;
      queryParams.push(`%${search}%`);
      paramCounter++;
    }

    query += ` GROUP BY p.id, u.first_name, u.last_name ORDER BY p.created_at DESC`;

    const result = await db.query(query, queryParams);

    res.json({
      success: true,
      projects: result.rows
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message
    });
  }
};

// Get single project details
exports.getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId, userId, role } = req.user;

    const result = await db.query(
      `SELECT 
        p.*,
        u.first_name || ' ' || u.last_name as creator_name,
        json_agg(
          json_build_object(
            'user_id', pm_user.id,
            'name', pm_user.first_name || ' ' || pm_user.last_name,
            'email', pm_user.email,
            'role', pm.role,
            'assigned_at', pm.assigned_at
          )
        ) FILTER (WHERE pm_user.id IS NOT NULL) as team_members
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN project_members pm ON p.id = pm.project_id
      LEFT JOIN users pm_user ON pm.user_id = pm_user.id
      WHERE p.id = $1 AND p.company_id = $2
      GROUP BY p.id, u.first_name, u.last_name`,
      [id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if team_member has access
    if (role === 'team_member') {
      const hasAccess = await db.query(
        `SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2`,
        [id, userId]
      );
      
      if (hasAccess.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'You do not have access to this project'
        });
      }
    }

    res.json({
      success: true,
      project: result.rows[0]
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project',
      error: error.message
    });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, start_date, end_date, budget } = req.body;
    const { companyId, userId, role } = req.user;

    // Check if user is project_manager or admin
    if (role !== 'project_manager' && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only project managers and admins can update projects'
      });
    }

    // Verify project belongs to user's company
    const projectCheck = await db.query(
      `SELECT * FROM projects WHERE id = $1 AND company_id = $2`,
      [id, companyId]
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
        [id, userId]
      );

      if (accessCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update this project'
        });
      }
    }

    // Update project
    const result = await db.query(
      `UPDATE projects 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           status = COALESCE($3, status),
           start_date = COALESCE($4, start_date),
           end_date = COALESCE($5, end_date),
           budget = COALESCE($6, budget),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [name, description, status, start_date, end_date, budget, id]
    );

    res.json({
      success: true,
      message: 'Project updated successfully',
      project: result.rows[0]
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating project',
      error: error.message
    });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId, userId, role } = req.user;

    // Check if user is project_manager or admin
    if (role !== 'project_manager' && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only project managers and admins can delete projects'
      });
    }

    // Verify project belongs to user's company
    const projectCheck = await db.query(
      `SELECT * FROM projects WHERE id = $1 AND company_id = $2`,
      [id, companyId]
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
        [id, userId]
      );

      if (accessCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this project'
        });
      }
    }

    // Delete project (cascade will handle project_members)
    await db.query(`DELETE FROM projects WHERE id = $1`, [id]);

    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting project',
      error: error.message
    });
  }
};

// Assign team member to project
exports.assignTeamMember = async (req, res) => {
  try {
    const { id } = req.params; // project_id
    const { user_id, role: memberRole } = req.body;
    const { companyId, userId, role } = req.user;

    // Check if user is project_manager or admin
    if (role !== 'project_manager' && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only project managers and admins can assign team members'
      });
    }

    // Verify project belongs to user's company
    const projectCheck = await db.query(
      `SELECT * FROM projects WHERE id = $1 AND company_id = $2`,
      [id, companyId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Verify user_id belongs to same company
    const userCheck = await db.query(
      `SELECT * FROM users WHERE id = $1 AND company_id = $2`,
      [user_id, companyId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found in your company'
      });
    }

    // Assign team member
    const result = await db.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, $3)
       ON CONFLICT (project_id, user_id) 
       DO UPDATE SET role = $3
       RETURNING *`,
      [id, user_id, memberRole || 'member']
    );

    res.json({
      success: true,
      message: 'Team member assigned successfully',
      assignment: result.rows[0]
    });
  } catch (error) {
    console.error('Assign team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning team member',
      error: error.message
    });
  }
};

// Remove team member from project
exports.removeTeamMember = async (req, res) => {
  try {
    const { id, userId: memberUserId } = req.params;
    const { companyId, userId, role } = req.user;

    // Check if user is project_manager or admin
    if (role !== 'project_manager' && role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only project managers and admins can remove team members'
      });
    }

    // Verify project belongs to user's company
    const projectCheck = await db.query(
      `SELECT * FROM projects WHERE id = $1 AND company_id = $2`,
      [id, companyId]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Remove team member
    const result = await db.query(
      `DELETE FROM project_members 
       WHERE project_id = $1 AND user_id = $2
       RETURNING *`,
      [id, memberUserId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Team member not found in this project'
      });
    }

    res.json({
      success: true,
      message: 'Team member removed successfully'
    });
  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing team member',
      error: error.message
    });
  }
};
