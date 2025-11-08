// Simple manual validation (avoiding express-validator issues)

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Signup validation
exports.signupValidation = (req, res, next) => {
  const { email, password, confirmPassword, firstName, lastName } = req.body;
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid work email' });
  }
  if (!password || password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  }
  if (!confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Please confirm your password' });
  }
  if (password && confirmPassword && password !== confirmPassword) {
    errors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
  }
  if (!firstName || firstName.trim() === '') {
    errors.push({ field: 'firstName', message: 'First name is required' });
  }
  if (!lastName || lastName.trim() === '') {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  next();
};

// Login validation
exports.loginValidation = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email' });
  }
  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  next();
};

// Verify email validation
exports.verifyEmailValidation = (req, res, next) => {
  const { email, otp } = req.body;
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email' });
  }
  if (!otp || otp.length !== 6) {
    errors.push({ field: 'otp', message: 'OTP must be 6 digits' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  next();
};

// Forgot password validation
exports.forgotPasswordValidation = (req, res, next) => {
  const { email } = req.body;
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  next();
};

// Reset password validation
exports.resetPasswordValidation = (req, res, next) => {
  const { email, otp, newPassword } = req.body;
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email' });
  }
  if (!otp || otp.length !== 6) {
    errors.push({ field: 'otp', message: 'OTP must be 6 digits' });
  }
  if (!newPassword || newPassword.length < 6) {
    errors.push({ field: 'newPassword', message: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  next();
};
