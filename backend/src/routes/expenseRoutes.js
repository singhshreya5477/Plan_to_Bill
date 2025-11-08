const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateExpense } = require('../middleware/validator');

// All routes require authentication
router.use(authenticate);

// Expense CRUD operations
router.post('/', validateExpense, expenseController.createExpense);
router.get('/', expenseController.getExpenses);
router.get('/:id', expenseController.getExpense);
router.put('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

// Review expense (approve/reject)
router.patch('/:id/review', expenseController.reviewExpense);

module.exports = router;
