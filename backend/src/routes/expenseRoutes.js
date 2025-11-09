const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const {
    getExpenses,
    getExpenseById,
    createExpense,
    updateExpense,
    updateExpenseStatus,
    deleteExpense,
    getExpenseSummary
} = require('../controllers/expenseController');

// All routes require authentication
router.use(authenticate);

// Expense routes
router.get('/', getExpenses);
router.get('/summary', getExpenseSummary);
router.get('/:id', getExpenseById);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.patch('/:id/status', updateExpenseStatus);
router.delete('/:id', deleteExpense);

module.exports = router;
