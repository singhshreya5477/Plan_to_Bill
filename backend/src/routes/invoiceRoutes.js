const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateInvoice } = require('../middleware/validator');

// All routes require authentication
router.use(authenticate);

// Invoice CRUD operations
router.post('/', validateInvoice, invoiceController.createInvoice);
router.get('/', invoiceController.getInvoices);
router.get('/:id', invoiceController.getInvoice);
router.put('/:id', invoiceController.updateInvoice);
router.delete('/:id', invoiceController.deleteInvoice);

// Invoice actions
router.patch('/:id/send', invoiceController.sendInvoice);
router.patch('/:id/mark-paid', invoiceController.markAsPaid);

module.exports = router;
