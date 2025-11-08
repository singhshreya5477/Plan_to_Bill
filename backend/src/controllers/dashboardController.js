const db = require('../config/db');

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
