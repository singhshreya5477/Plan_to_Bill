const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateProject } = require('../middleware/validator');

// All routes require authentication
router.use(authenticate);

// Project CRUD operations
router.post('/', validateProject, projectController.createProject);
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

// Team member assignment
router.post('/:id/members', projectController.assignTeamMember);
router.delete('/:id/members/:userId', projectController.removeTeamMember);

module.exports = router;
