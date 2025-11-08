const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send verification OTP email
async function sendVerificationEmail(email, otp, name) {
  const mailOptions = {
    from: `"Plan to Bill" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email - Plan to Bill',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .otp-box { background: white; border: 2px dashed #4CAF50; padding: 20px; margin: 20px 0; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4CAF50; border-radius: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Plan to Bill</h1>
          </div>
          <div class="content">
            <h2>Welcome, ${name}!</h2>
            <p>Thank you for registering. Please verify your email address to activate your account.</p>
            <p>Your verification code is:</p>
            <div class="otp-box">${otp}</div>
            <p>This code will expire in 10 minutes.</p>
            <p style="color: #666; font-size: 14px;">If you didn't create an account, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Plan to Bill. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return await transporter.sendMail(mailOptions);
}

// Send password reset OTP email
async function sendPasswordResetEmail(email, otp, name) {
  const mailOptions = {
    from: `"Plan to Bill" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your Password - Plan to Bill',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FF9800; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
          .otp-box { background: white; border: 2px dashed #FF9800; padding: 20px; margin: 20px 0; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #FF9800; border-radius: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Plan to Bill</h1>
          </div>
          <div class="content">
            <h2>Hello, ${name}!</h2>
            <p>You requested to reset your password. Use the code below:</p>
            <div class="otp-box">${otp}</div>
            <p>This code will expire in 10 minutes.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 Plan to Bill. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  return await transporter.sendMail(mailOptions);
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};
