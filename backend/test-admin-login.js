const axios = require('axios');

async function testAdminLogin() {
  try {
    console.log('🔐 Testing login with admin account: kandpalravindra21@gmail.com');
    console.log('⚠️  You need to provide the correct password for this account');
    console.log('📝 Edit this file and replace "YOUR_PASSWORD_HERE" with the actual password\n');
    
    const password = 'YOUR_PASSWORD_HERE'; // Replace with actual password
    
    if (password === 'YOUR_PASSWORD_HERE') {
      console.log('❌ Please edit this file and set the correct password first!');
      return;
    }
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'kandpalravindra21@gmail.com',
      password: password
    });
    
    console.log('✅ Login successful!');
    console.log('📋 User info:', JSON.stringify(response.data.data.user, null, 2));
    console.log('🔑 Token (first 50 chars):', response.data.data.token.substring(0, 50) + '...');
    
    // Test admin API with this token
    const token = response.data.data.token;
    console.log('\n🧪 Testing admin API with fresh token...');
    
    const adminResponse = await axios.get('http://localhost:5000/api/admin/pending-users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Admin API successful!');
    console.log('📊 Pending users count:', adminResponse.data.data.count);
    
    // Test all users API
    const allUsersResponse = await axios.get('http://localhost:5000/api/admin/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('📊 All users count:', allUsersResponse.data.data.count);
    console.log('\n🎉 All admin APIs are working correctly!');
    console.log('💡 Use this token in your browser localStorage to fix the issue.');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('💡 This usually means wrong password or unverified account');
    }
  }
}

testAdminLogin();