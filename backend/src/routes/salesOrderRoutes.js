const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const {
    getSalesOrders,
    getSalesOrderById,
    createSalesOrder,
    updateSalesOrder,
    updateSalesOrderStatus,
    deleteSalesOrder
} = require('../controllers/salesOrderController');

// All routes require authentication
router.use(authenticate);

// Sales Order routes
router.get('/', getSalesOrders);
router.get('/:id', getSalesOrderById);
router.post('/', createSalesOrder);
router.put('/:id', updateSalesOrder);
router.patch('/:id/status', updateSalesOrderStatus);
router.delete('/:id', deleteSalesOrder);

module.exports = router;
