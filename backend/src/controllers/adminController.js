const db = require('../config/db');

// Get all pending users (Admin only)
exports.getPendingUsers = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, email, first_name, last_name, is_verified, pending_approval, created_at 
       FROM users 
       WHERE pending_approval = true AND is_verified = true
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      data: {
        pendingUsers: result.rows,
        count: result.rows.length
      }
    });
  } catch (error) {
    console.error('Get pending users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch pending users' });
  }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, email, first_name, last_name, role, is_verified, role_approved, pending_approval, created_at, approved_at
       FROM users 
       ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      data: {
        users: result.rows,
        count: result.rows.length
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

// Assign role to user (Admin only)
exports.assignRole = async (req, res) => {
  try {
    const { userId } = req.params;
    let { role } = req.body;
    const adminId = req.user.userId; // From auth middleware

    // If role is null or empty, default to team_member
    if (!role || role === '' || role === 'null') {
      role = 'team_member';
    }

    // Validate role
    const validRoles = ['admin', 'project_manager', 'team_member'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role. Must be one of: admin, project_manager, team_member' 
      });
    }

    // Update user role
    const result = await db.query(
      `UPDATE users 
       SET role = $1, 
           role_approved = true, 
           pending_approval = false,
           approved_by = $2,
           approved_at = NOW()
       WHERE id = $3 AND is_verified = true
       RETURNING id, email, first_name, last_name, role, role_approved`,
      [role, adminId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found or not verified' 
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      message: `Role '${role}' assigned successfully to ${user.first_name} ${user.last_name}`,
      data: { user }
    });
  } catch (error) {
    console.error('Assign role error:', error);
    res.status(500).json({ success: false, message: 'Failed to assign role' });
  }
};

// Reject user (Admin only)
exports.rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Delete user
    const result = await db.query(
      'DELETE FROM users WHERE id = $1 AND pending_approval = true RETURNING email',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found or already approved' 
      });
    }

    res.json({
      success: true,
      message: `User ${result.rows[0].email} rejected and removed`
    });
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({ success: false, message: 'Failed to reject user' });
  }
};

// Remove user permanently (Admin only)
exports.removeUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user.userId;

    // Prevent admin from removing themselves
    if (parseInt(userId) === parseInt(adminId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'You cannot remove your own account' 
      });
    }

    // Get user details before deletion
    const userResult = await db.query(
      'SELECT email, first_name, last_name, role FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const userToDelete = userResult.rows[0];

    // Delete user (CASCADE will handle related data)
    await db.query('DELETE FROM users WHERE id = $1', [userId]);

    res.json({
      success: true,
      message: `User ${userToDelete.first_name} ${userToDelete.last_name} (${userToDelete.email}) has been permanently removed`
    });
  } catch (error) {
    console.error('Remove user error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove user' });
  }
};
