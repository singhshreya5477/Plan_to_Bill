const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/authMiddleware');

// Protected dashboard routes
router.get('/', authenticate, dashboardController.getDashboard);
router.get('/stats', authenticate, dashboardController.getStats);
router.get('/projects', authenticate, dashboardController.getProjects);

module.exports = router;
