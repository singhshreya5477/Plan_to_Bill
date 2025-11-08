const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/authMiddleware');
const {
    getBillingRates,
    setBillingRate,
    getInvoices,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    recordPayment,
    getRevenueAnalytics
} = require('../controllers/billingController');

// All routes require authentication
router.use(authenticate);

// ============================================
// BILLING RATES ROUTES
// ============================================

// @route   GET /api/billing/rates
// @desc    Get billing rates
// @access  Private (Admin, Project Manager)
router.get('/rates', authorize('admin', 'project_manager'), getBillingRates);

// @route   POST /api/billing/rates
// @desc    Set a billing rate
// @access  Private (Admin, Project Manager)
router.post('/rates', authorize('admin', 'project_manager'), setBillingRate);

// ============================================
// INVOICE ROUTES
// ============================================

// @route   GET /api/billing/invoices
// @desc    Get all invoices
// @access  Private (Admin, Project Manager)
router.get('/invoices', authorize('admin', 'project_manager'), getInvoices);

// @route   GET /api/billing/invoices/:id
// @desc    Get invoice by ID with items and payments
// @access  Private (Admin, Project Manager)
router.get('/invoices/:id', authorize('admin', 'project_manager'), getInvoiceById);

// @route   POST /api/billing/invoices
// @desc    Create a new invoice
// @access  Private (Admin, Project Manager)
router.post('/invoices', authorize('admin', 'project_manager'), createInvoice);

// @route   PUT /api/billing/invoices/:id
// @desc    Update an invoice
// @access  Private (Admin, Project Manager)
router.put('/invoices/:id', authorize('admin', 'project_manager'), updateInvoice);

// @route   DELETE /api/billing/invoices/:id
// @desc    Delete an invoice
// @access  Private (Admin)
router.delete('/invoices/:id', authorize('admin'), deleteInvoice);

// ============================================
// PAYMENT ROUTES
// ============================================

// @route   POST /api/billing/payments
// @desc    Record a payment
// @access  Private (Admin, Project Manager)
router.post('/payments', authorize('admin', 'project_manager'), recordPayment);

// ============================================
// ANALYTICS ROUTES
// ============================================

// @route   GET /api/billing/analytics
// @desc    Get revenue analytics
// @access  Private (Admin, Project Manager)
router.get('/analytics', authorize('admin', 'project_manager'), getRevenueAnalytics);

module.exports = router;
