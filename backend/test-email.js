require('dotenv').config();
const { sendVerificationEmail } = require('./src/utils/emailService');

console.log('Testing email service...');
console.log('Email user:', process.env.EMAIL_USER);
console.log('Email password length:', process.env.EMAIL_PASSWORD?.length);

sendVerificationEmail('kandpalravindra21@gmail.com', '123456', 'Test User')
  .then(info => {
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Email failed:', error.message);
    process.exit(1);
  });

setTimeout(() => {
  console.error('⏰ Email sending timed out after 30 seconds');
  process.exit(1);
}, 30000);
