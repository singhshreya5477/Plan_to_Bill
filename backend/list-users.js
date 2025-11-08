require('dotenv').config();
const db = require('./src/config/db');

async function listUsers() {
  try {
    const result = await db.query('SELECT email, role, is_verified, role_approved, pending_approval FROM users ORDER BY created_at');
    
    console.log('\n📋 All Users in Database:\n');
    result.rows.forEach((u, i) => {
      console.log(`${i + 1}. ${u.email}`);
      console.log(`   Role: ${u.role || 'NULL'}`);
      console.log(`   Verified: ${u.is_verified}`);
      console.log(`   Approved: ${u.role_approved}`);
      console.log(`   Pending: ${u.pending_approval}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listUsers();
