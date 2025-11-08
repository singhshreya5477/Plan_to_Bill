require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./src/config/db');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function testAdminLogin() {
  console.log('\n🔐 ADMIN LOGIN TEST\n');

  const email = 'kandpalravindra21@gmail.com';
  
  rl.question('Enter password for ' + email + ': ', async (password) => {
    try {
      // Find user
      const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      
      if (result.rows.length === 0) {
        console.log('❌ User not found');
        process.exit(1);
      }

      const user = result.rows[0];
      console.log('\n📋 User found:');
      console.log('   Email:', user.email);
      console.log('   Name:', user.first_name, user.last_name);
      console.log('   Role:', user.role);
      console.log('   Verified:', user.is_verified);
      console.log('   Approved:', user.role_approved);
      console.log('   Pending:', user.pending_approval);

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        console.log('\n❌ Invalid password!');
        process.exit(1);
      }

      console.log('\n✅ Password correct!');

      // Check if can login
      if (!user.is_verified) {
        console.log('❌ Email not verified');
        process.exit(1);
      }

      if (user.pending_approval || !user.role_approved) {
        console.log('❌ Account pending approval');
        process.exit(1);
      }

      if (!user.role) {
        console.log('❌ No role assigned');
        process.exit(1);
      }

      console.log('✅ All checks passed!');

      // Generate token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log('\n🎫 Generated JWT Token:');
      console.log('─'.repeat(80));
      console.log(token);
      console.log('─'.repeat(80));

      // Decode and verify
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('\n📝 Decoded Token:');
      console.log(JSON.stringify(decoded, null, 2));

      console.log('\n✅ TOKEN IS VALID!');
      console.log('   User ID:', decoded.userId);
      console.log('   Email:', decoded.email);
      console.log('   Role:', decoded.role);
      console.log('   Expires:', new Date(decoded.exp * 1000).toLocaleString());

      if (decoded.role === 'admin') {
        console.log('\n🎉 You have ADMIN access! This token will work for admin dashboard.');
      } else {
        console.log('\n❌ Role is not admin! This is the problem.');
      }

      console.log('\n💡 TO FIX YOUR ISSUE:');
      console.log('1. Go to: http://localhost:5173/debug-current-token.html');
      console.log('2. Click "Clear Token & User"');
      console.log('3. Click "Quick Login as Admin"');
      console.log('4. Enter email: ' + email);
      console.log('5. Enter your password');
      console.log('6. Try accessing admin dashboard again');

    } catch (error) {
      console.error('❌ Error:', error.message);
    } finally {
      rl.close();
      process.exit(0);
    }
  });
}

testAdminLogin();
