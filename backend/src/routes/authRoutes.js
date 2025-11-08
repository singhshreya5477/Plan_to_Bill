const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validator = require('../middleware/validator');
const { authenticate } = require('../middleware/authMiddleware');

// Authentication routes
router.post('/signup', validator.signupValidation, authController.signup);
router.post('/verify-email', validator.verifyEmailValidation, authController.verifyEmail);
router.post('/resend-otp', authController.resendOTP);
router.post('/login', validator.loginValidation, authController.login);
router.post('/forgot-password', validator.forgotPasswordValidation, authController.forgotPassword);
router.post('/reset-password', validator.resetPasswordValidation, authController.resetPassword);

// Protected routes (require authentication)
router.put('/profile', authenticate, authController.updateProfile);
router.post('/change-password', authenticate, authController.changePassword);

module.exports = router;
