// Simple manual validation (avoiding express-validator issues)

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Signup validation
exports.signupValidation = (req, res, next) => {
  const { email, password, firstName, lastName, role } = req.body;
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email' });
  }
  if (!password || password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  }
  if (!firstName || firstName.trim() === '') {
    errors.push({ field: 'firstName', message: 'First name is required' });
  }
  if (!lastName || lastName.trim() === '') {
    errors.push({ field: 'lastName', message: 'Last name is required' });
  }
  if (role && !['admin', 'project_manager', 'team_member'].includes(role)) {
    errors.push({ field: 'role', message: 'Invalid role' });
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

// Project validation
exports.validateProject = (req, res, next) => {
  const { name, status, start_date, end_date } = req.body;
  const errors = [];

  if (!name || name.trim() === '') {
    errors.push({ field: 'name', message: 'Project name is required' });
  }
  if (status && !['active', 'completed', 'on_hold', 'cancelled'].includes(status)) {
    errors.push({ field: 'status', message: 'Invalid project status' });
  }
  if (start_date && end_date && new Date(start_date) > new Date(end_date)) {
    errors.push({ field: 'dates', message: 'Start date must be before end date' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  next();
};

// Task validation
exports.validateTask = (req, res, next) => {
  const { title, status, priority, project_id } = req.body;
  const errors = [];

  if (!title || title.trim() === '') {
    errors.push({ field: 'title', message: 'Task title is required' });
  }
  if (!project_id) {
    errors.push({ field: 'project_id', message: 'Project ID is required' });
  }
  if (status && !['pending', 'in_progress', 'completed', 'cancelled'].includes(status)) {
    errors.push({ field: 'status', message: 'Invalid task status' });
  }
  if (priority && !['low', 'medium', 'high', 'urgent'].includes(priority)) {
    errors.push({ field: 'priority', message: 'Invalid task priority' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  next();
};

// Expense validation
exports.validateExpense = (req, res, next) => {
  const { title, amount, project_id } = req.body;
  const errors = [];

  if (!title || title.trim() === '') {
    errors.push({ field: 'title', message: 'Expense title is required' });
  }
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    errors.push({ field: 'amount', message: 'Valid amount is required' });
  }
  if (!project_id) {
    errors.push({ field: 'project_id', message: 'Project ID is required' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  next();
};

// Invoice validation
exports.validateInvoice = (req, res, next) => {
  const { project_id, client_name, amount, issue_date, due_date } = req.body;
  const errors = [];

  if (!project_id) {
    errors.push({ field: 'project_id', message: 'Project ID is required' });
  }
  if (!client_name || client_name.trim() === '') {
    errors.push({ field: 'client_name', message: 'Client name is required' });
  }
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    errors.push({ field: 'amount', message: 'Valid amount is required' });
  }
  if (!issue_date) {
    errors.push({ field: 'issue_date', message: 'Issue date is required' });
  }
  if (!due_date) {
    errors.push({ field: 'due_date', message: 'Due date is required' });
  }
  if (issue_date && due_date && new Date(issue_date) > new Date(due_date)) {
    errors.push({ field: 'dates', message: 'Issue date must be before due date' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  next();
};
