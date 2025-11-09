const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const {
    getVendorBills,
    getVendorBillById,
    createVendorBill,
    updateVendorBill,
    updateVendorBillStatus,
    deleteVendorBill
} = require('../controllers/vendorBillController');

// All routes require authentication
router.use(authenticate);

// Vendor Bill routes
router.get('/', getVendorBills);
router.get('/:id', getVendorBillById);
router.post('/', createVendorBill);
router.put('/:id', updateVendorBill);
router.patch('/:id/status', updateVendorBillStatus);
router.delete('/:id', deleteVendorBill);

module.exports = router;
