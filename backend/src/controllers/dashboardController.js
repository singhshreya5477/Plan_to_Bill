const db = require('../config/db');

// Get dashboard statistics
exports.getStats = async (req, res) => {
  try {
    console.log('📊 getStats called');
    console.log('req.user:', req.user);
    
    const { userId, role } = req.user;
    console.log('userId:', userId, 'role:', role);

    let stats = {
      activeProjects: 0,
      hoursTracked: 0,
      overdueItems: 0,
      totalRevenue: 0
    };

    // Get active projects count
    if (role === 'admin' || role === 'project_manager') {
      const projectsResult = await db.query(
        `SELECT COUNT(*) as count FROM projects WHERE status != 'completed'`
      );
      stats.activeProjects = parseInt(projectsResult.rows[0].count);
    } else {
      // Team member - only their projects
      const projectsResult = await db.query(
        `SELECT COUNT(DISTINCT p.id) as count 
         FROM projects p 
         INNER JOIN project_members pm ON p.id = pm.project_id 
         WHERE pm.user_id = $1 AND p.status != 'completed'`,
        [userId]
      );
      stats.activeProjects = parseInt(projectsResult.rows[0].count);
    }

    // Get total hours tracked
    const hoursResult = await db.query(
      `SELECT COALESCE(SUM(hours), 0) as total 
       FROM time_logs 
       WHERE user_id = $1`,
      [userId]
    );
    stats.hoursTracked = parseFloat(hoursResult.rows[0].total);

    // Get overdue tasks count
    const overdueResult = await db.query(
      `SELECT COUNT(*) as count 
       FROM tasks 
       WHERE assigned_to = $1 
       AND due_date < CURRENT_DATE 
       AND status != 'completed'`,
      [userId]
    );
    stats.overdueItems = parseInt(overdueResult.rows[0].count);

    // Get total revenue (for admin/PM only)
    if (role === 'admin' || role === 'project_manager') {
      const revenueResult = await db.query(
        `SELECT COALESCE(SUM(total), 0) as total 
         FROM invoices 
         WHERE status = 'paid'`
      );
      stats.totalRevenue = parseFloat(revenueResult.rows[0].total);
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Get stats error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to load statistics' });
  }
};

// Get dashboard projects
exports.getProjects = async (req, res) => {
  try {
    const { userId, role } = req.user;

    let query;
    let params;

    if (role === 'admin' || role === 'project_manager') {
      // Admin/PM can see all projects
      query = `
        SELECT 
          p.id,
          p.name,
          p.description,
          p.status,
          p.budget,
          p.start_date,
          p.end_date,
          p.created_at,
          CASE WHEN u.first_name IS NOT NULL 
            THEN u.first_name || ' ' || u.last_name 
            ELSE NULL 
          END as manager_name,
          COUNT(DISTINCT pm.user_id) as team_size,
          COUNT(DISTINCT t.id) as total_tasks,
          COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks
        FROM projects p
        LEFT JOIN users u ON p.created_by = u.id
        LEFT JOIN project_members pm ON p.id = pm.project_id
        LEFT JOIN tasks t ON p.id = t.project_id
        GROUP BY p.id, u.first_name, u.last_name
        ORDER BY p.created_at DESC
        LIMIT 10
      `;
      params = [];
    } else {
      // Team member - only their projects
      query = `
        SELECT 
          p.id,
          p.name,
          p.description,
          p.status,
          p.budget,
          p.start_date,
          p.end_date,
          p.created_at,
          CASE WHEN u.first_name IS NOT NULL 
            THEN u.first_name || ' ' || u.last_name 
            ELSE NULL 
          END as manager_name,
          COUNT(DISTINCT pm2.user_id) as team_size,
          COUNT(DISTINCT t.id) as total_tasks,
          COUNT(DISTINCT CASE WHEN t.status = 'completed' THEN t.id END) as completed_tasks
        FROM projects p
        INNER JOIN project_members pm ON p.id = pm.project_id
        LEFT JOIN users u ON p.created_by = u.id
        LEFT JOIN project_members pm2 ON p.id = pm2.project_id
        LEFT JOIN tasks t ON p.id = t.project_id
        WHERE pm.user_id = $1
        GROUP BY p.id, u.first_name, u.last_name
        ORDER BY p.created_at DESC
        LIMIT 10
      `;
      params = [userId];
    }

    const result = await db.query(query, params);

    // Calculate progress for each project
    const projects = result.rows.map(project => ({
      ...project,
      progress: project.total_tasks > 0 
        ? Math.round((project.completed_tasks / project.total_tasks) * 100) 
        : 0
    }));

    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('❌ Get projects error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ success: false, message: 'Failed to load projects' });
  }
};

// Get role-based dashboard
exports.getDashboard = async (req, res) => {
  try {
    const { userId, role } = req.user;

    // Get user details
    const userResult = await db.query(
      'SELECT id, email, first_name, last_name, role, created_at FROM users WHERE id = $1',
      [userId]
    );

    const user = userResult.rows[0];

    // Role-based dashboard data
    let dashboardData = {
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role,
      }
    };

    // Add role-specific data
    if (role === 'admin') {
      dashboardData.message = 'Welcome to Admin Dashboard';
      dashboardData.permissions = ['manage_users', 'manage_projects', 'view_reports', 'manage_settings'];
    } else if (role === 'project_manager') {
      dashboardData.message = 'Welcome to Project Manager Dashboard';
      dashboardData.permissions = ['manage_projects', 'manage_tasks', 'view_team', 'view_reports'];
    } else if (role === 'team_member') {
      dashboardData.message = 'Welcome to Team Member Dashboard';
      dashboardData.permissions = ['view_tasks', 'update_tasks', 'log_hours'];
    }

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to load dashboard' });
  }
};
