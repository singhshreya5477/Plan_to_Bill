const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validator = require('../middleware/validator');

// Authentication routes
router.post('/signup', validator.signupValidation, authController.signup);
router.post('/verify-email', validator.verifyEmailValidation, authController.verifyEmail);
router.post('/login', validator.loginValidation, authController.login);
router.post('/forgot-password', validator.forgotPasswordValidation, authController.forgotPassword);
router.post('/reset-password', validator.resetPasswordValidation, authController.resetPassword);

module.exports = router;
