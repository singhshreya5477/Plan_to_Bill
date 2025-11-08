const jwt = require('jsonwebtoken');
require('dotenv').config();

// Get the token from command line argument
const token = process.argv[2];

if (!token) {
  console.log('❌ Usage: node debug-token.js <your-jwt-token>');
  console.log('📝 To get your token: Open browser dev tools > Application > Local Storage > token');
  process.exit(1);
}

try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('✅ Token is valid!');
  console.log('📋 Token contains:');
  console.log(decoded);
  
  if (decoded.role === 'admin') {
    console.log('✅ User has ADMIN role - API calls should work');
  } else {
    console.log('❌ User role is:', decoded.role || 'NONE');
    console.log('💡 You need to log in with kandpalravindra21@gmail.com to get admin access');
  }
} catch (error) {
  console.error('❌ Token is invalid or expired:', error.message);
  console.log('💡 You need to log in again to get a fresh token');
}