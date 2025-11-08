require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const db = require('./src/config/db');

async function testAdminAPI() {
  try {
    // 1. Get admin user
    const result = await db.query("SELECT * FROM users WHERE email = 'kandpalravindra21@gmail.com'");
    const admin = result.rows[0];
    
    console.log('\n1️⃣ Admin user:', admin.email, '- Role:', admin.role);
    
    // 2. Generate token
    const token = jwt.sign(
      { userId: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log('2️⃣ Generated token with role:', admin.role);
    console.log('   Token:', token.substring(0, 50) + '...');
    
    // 3. Test API call
    console.log('\n3️⃣ Testing API call to /api/admin/users...');
    
    const response = await axios.get('http://localhost:5000/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ SUCCESS! Status:', response.status);
    console.log('   Users found:', response.data.data.users.length);
    console.log('   First user:', response.data.data.users[0]?.email);
    
  } catch (error) {
    console.log('\n❌ FAILED!');
    console.log('   Status:', error.response?.status);
    console.log('   Message:', error.response?.data?.message);
    console.log('   Full error:', error.message);
  } finally {
    process.exit(0);
  }
}

testAdminAPI();
