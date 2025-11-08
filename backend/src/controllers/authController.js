const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../utils/emailService');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Signup - Register new user and send OTP
exports.signup = async (req, res) => {
  console.log('📝 Signup request received:', req.body.email);
  try {
    const { email, password, firstName, lastName, role } = req.body;

    console.log('1. Checking if user exists...');
    // Check if user exists
    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      console.log('❌ User already exists');
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    console.log('2. Hashing password...');
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('3. Generating OTP...');
    // Generate OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log('4. Creating user in database...');
    // Create user
    const result = await db.query(
      `INSERT INTO users (email, password, first_name, last_name, role, verification_otp, verification_otp_expires)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, email, first_name, last_name, role`,
      [email, hashedPassword, firstName, lastName, role || 'team_member', otp, otpExpires]
    );

    const user = result.rows[0];
    console.log('5. User created, sending email...');

    // Send verification email (don't wait for it)
    sendVerificationEmail(email, otp, `${firstName} ${lastName}`)
      .then(() => console.log(`✅ Email sent to ${email}`))
      .catch(err => console.error('❌ Email error:', err.message));

    console.log('6. Sending response...');
    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for verification code.',
      data: { userId: user.id, email: user.email }
    });
    console.log('✅ Response sent');
  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
};

// Verify Email - Verify OTP
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const result = await db.query(
      'SELECT * FROM users WHERE email = $1 AND verification_otp = $2',
      [email, otp]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    const user = result.rows[0];

    // Check if OTP expired
    if (new Date() > new Date(user.verification_otp_expires)) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    // Update user as verified
    await db.query(
      'UPDATE users SET is_verified = true, verification_otp = NULL, verification_otp_expires = NULL WHERE email = $1',
      [email]
    );

    res.json({
      success: true,
      message: 'Email verified successfully! You can now login.'
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check if verified
    if (!user.is_verified) {
      return res.status(401).json({ success: false, message: 'Please verify your email first' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

// Forgot Password - Send reset OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Email not found' });
    }

    const user = result.rows[0];
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await db.query(
      'UPDATE users SET reset_password_otp = $1, reset_password_otp_expires = $2 WHERE email = $3',
      [otp, otpExpires, email]
    );

    // Send password reset email (don't wait for it)
    sendPasswordResetEmail(email, otp, `${user.first_name} ${user.last_name}`)
      .then(() => console.log(`✅ Reset email sent to ${email}`))
      .catch(err => console.error('❌ Email error:', err.message));

    res.json({
      success: true,
      message: 'Password reset code sent to your email'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Failed to send reset code' });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const result = await db.query(
      'SELECT * FROM users WHERE email = $1 AND reset_password_otp = $2',
      [email, otp]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    const user = result.rows[0];

    if (new Date() > new Date(user.reset_password_otp_expires)) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      'UPDATE users SET password = $1, reset_password_otp = NULL, reset_password_otp_expires = NULL WHERE email = $2',
      [hashedPassword, email]
    );

    res.json({
      success: true,
      message: 'Password reset successful! You can now login.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Password reset failed' });
  }
};
