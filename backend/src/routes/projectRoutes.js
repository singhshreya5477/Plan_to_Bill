const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember
} = require('../controllers/projectController');

// All routes require authentication
router.use(authenticate);

// Get all projects (filtered by user role)
router.get('/', getAllProjects);

// Get single project by ID
router.get('/:projectId', getProjectById);

// Create new project (admin and project managers only)
router.post('/', authorize('admin', 'project_manager'), createProject);

// Update project (admin, owner, or manager)
router.put('/:projectId', updateProject);

// Delete project (admin or owner only)
router.delete('/:projectId', deleteProject);

// Team member management
router.post('/:projectId/members', addTeamMember);
router.delete('/:projectId/members/:memberId', removeTeamMember);

module.exports = router;
