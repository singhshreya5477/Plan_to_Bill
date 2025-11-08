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
    const { email, password, firstName, lastName, phone, role } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, password, first name, and last name are required' 
      });
    }

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
    
    // All new users need admin approval to assign role
    const userRole = null; // No role assigned until admin approves
    const needsApproval = true; // All users need admin approval
    const isRoleApproved = false; // Admin must approve
    
    // Create user WITHOUT role (admin will assign later)
    const result = await db.query(
      `INSERT INTO users (email, password, first_name, last_name, phone, role, verification_otp, verification_otp_expires, role_approved, pending_approval)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, email, first_name, last_name, role, phone`,
      [email, hashedPassword, firstName, lastName, phone || null, userRole, otp, otpExpires, isRoleApproved, needsApproval]
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
      message: 'Registration successful! Please check your email for verification code. After verification, wait for admin approval.',
      data: { 
        userId: user.id, 
        email: user.email,
        needsApproval: true
      }
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

    // Return simple success message - user needs to login separately
    const message = user.pending_approval 
      ? 'Email verified successfully! Your account is pending admin approval. Please wait for admin to approve your role before logging in.'
      : 'Email verified successfully! You can now login with your credentials.';

    res.json({
      success: true,
      message
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

    // Check if role is approved by admin
    if (user.pending_approval || !user.role_approved) {
      return res.status(403).json({ 
        success: false, 
        message: 'Your account is pending admin approval. Please wait for the admin to assign your role.',
        pending: true
      });
    }

    // Check if role is assigned
    if (!user.role) {
      return res.status(403).json({ 
        success: false, 
        message: 'No role assigned. Please contact admin.',
        pending: true
      });
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
          first_name: user.first_name,
          last_name: user.last_name,
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

// Resend OTP - Resend verification OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Find user
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = result.rows[0];

    // Check if already verified
    if (user.is_verified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is already verified' 
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update OTP in database
    await db.query(
      'UPDATE users SET verification_otp = $1, verification_otp_expires = $2 WHERE email = $3',
      [otp, otpExpires, email]
    );

    // Send verification email
    sendVerificationEmail(email, otp, `${user.first_name} ${user.last_name}`)
      .then(() => console.log(`✅ OTP resent to ${email}`))
      .catch(err => console.error('❌ Email error:', err.message));

    res.json({
      success: true,
      message: 'Verification code has been resent to your email'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to resend verification code' });
  }
};

// Update Profile - Update user profile information
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { firstName, lastName, phone, department } = req.body;

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (firstName !== undefined) {
      updates.push(`first_name = $${paramCount}`);
      values.push(firstName);
      paramCount++;
    }

    if (lastName !== undefined) {
      updates.push(`last_name = $${paramCount}`);
      values.push(lastName);
      paramCount++;
    }

    if (phone !== undefined) {
      updates.push(`phone = $${paramCount}`);
      values.push(phone);
      paramCount++;
    }

    if (department !== undefined) {
      updates.push(`department = $${paramCount}`);
      values.push(department);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No fields to update' 
      });
    }

    values.push(userId);
    const query = `
      UPDATE users 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING id, email, first_name, last_name, phone, department, role
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: result.rows[0]
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile' 
    });
  }
};

// Change Password - Change password for authenticated user
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be at least 6 characters' 
      });
    }

    // Get current user
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const user = userResult.rows[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to change password' 
    });
  }
};
