const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const {
    logTime,
    getTimeLogs,
    getTimeLogById,
    updateTimeLog,
    deleteTimeLog,
    getTimesheet
} = require('../controllers/timeTrackingController');

// All routes require authentication
router.use(authenticate);

// ============================================
// TIME LOG ROUTES
// ============================================

// @route   POST /api/time-tracking/log
// @desc    Log time for a task or project
// @access  Private (Project Members)
router.post('/log', logTime);

// @route   GET /api/time-tracking/logs
// @desc    Get time logs with filters
// @access  Private (Project Members can see project logs, Admins see all)
router.get('/logs', getTimeLogs);

// @route   GET /api/time-tracking/logs/:id
// @desc    Get a specific time log
// @access  Private (Owner, Project Members, Admin)
router.get('/logs/:id', getTimeLogById);

// @route   PUT /api/time-tracking/logs/:id
// @desc    Update a time log
// @access  Private (Owner, Admin)
router.put('/logs/:id', updateTimeLog);

// @route   DELETE /api/time-tracking/logs/:id
// @desc    Delete a time log
// @access  Private (Owner, Admin)
router.delete('/logs/:id', deleteTimeLog);

// ============================================
// TIMESHEET ROUTES
// ============================================

// @route   GET /api/time-tracking/timesheet
// @desc    Generate timesheet report
// @access  Private (Own timesheet or Admin)
router.get('/timesheet', getTimesheet);

module.exports = router;
