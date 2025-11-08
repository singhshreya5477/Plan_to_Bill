const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const {
  getPendingUsers,
  getAllUsers,
  assignRole,
  rejectUser,
  removeUser
} = require('../controllers/adminController');

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));  // Changed from ['admin'] to 'admin'

// Get all pending users waiting for role assignment
router.get('/pending-users', getPendingUsers);

// Get all users
router.get('/users', getAllUsers);

// Assign role to a user
router.post('/users/:userId/assign-role', assignRole);

// Reject/delete a pending user (must come BEFORE the general delete route)
router.delete('/users/:userId/reject', rejectUser);

// Remove/delete any user permanently
router.delete('/users/:userId', removeUser);

module.exports = router;
