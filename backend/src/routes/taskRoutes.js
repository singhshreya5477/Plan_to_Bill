const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const {
  getProjectTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  addTaskComment,
  getMyTasks,
  delegateTask,
  getDelegatedTasks,
  getTasksIDelegated,
  getTaskDelegationHistory
} = require('../controllers/taskController');

// All routes require authentication
router.use(authenticate);

// Debug endpoint
router.get('/debug-auth', (req, res) => {
  res.json({
    success: true,
    user: {
      userId: req.user.userId,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Get tasks assigned to current user
router.get('/my-tasks', getMyTasks);

// Delegation routes
router.post('/:taskId/delegate', delegateTask);
router.get('/delegated/to-me', getDelegatedTasks);
router.get('/delegated/by-me', getTasksIDelegated);
router.get('/:taskId/delegation-history', getTaskDelegationHistory);

// Get all tasks for a project
router.get('/project/:projectId', getProjectTasks);

// Get single task by ID
router.get('/:taskId', getTaskById);

// Create new task
router.post('/', createTask);

// Update task
router.put('/:taskId', updateTask);

// Delete task
router.delete('/:taskId', deleteTask);

// Add comment to task
router.post('/:taskId/comments', addTaskComment);

module.exports = router;
