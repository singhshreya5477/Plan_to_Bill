require('dotenv').config();
const jwt = require('jsonwebtoken');
const db = require('./src/config/db');

async function debugAdminAccess() {
  console.log('\n🔍 DEBUG ADMIN ACCESS\n');

  // 1. Check if admin user exists
  console.log('1️⃣ Checking admin user in database...');
  const adminCheck = await db.query(
    `SELECT id, email, first_name, last_name, role, is_verified, role_approved, pending_approval, created_at
     FROM users 
     WHERE email = 'ravindrakandpal10@gmail.com'`
  );

  if (adminCheck.rows.length > 0) {
    const admin = adminCheck.rows[0];
    console.log('✅ Admin user found:');
    console.log('   Email:', admin.email);
    console.log('   Name:', admin.first_name, admin.last_name);
    console.log('   Role:', admin.role);
    console.log('   Is Verified:', admin.is_verified);
    console.log('   Role Approved:', admin.role_approved);
    console.log('   Pending Approval:', admin.pending_approval);
    console.log('   Created:', admin.created_at);

    // 2. Generate a test token with the admin user
    console.log('\n2️⃣ Generating test admin token...');
    const testToken = jwt.sign(
      { userId: admin.id, email: admin.email, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log('✅ Test Token Generated:');
    console.log(testToken);

    // 3. Verify the token
    console.log('\n3️⃣ Verifying test token...');
    try {
      const decoded = jwt.verify(testToken, process.env.JWT_SECRET);
      console.log('✅ Token decoded successfully:');
      console.log('   User ID:', decoded.userId);
      console.log('   Email:', decoded.email);
      console.log('   Role:', decoded.role);

      // 4. Check role authorization
      console.log('\n4️⃣ Checking role authorization...');
      const allowedRoles = ['admin'];
      if (allowedRoles.includes(decoded.role)) {
        console.log('✅ Admin role authorized - Access should be granted!');
      } else {
        console.log('❌ Admin role NOT authorized - This is the problem!');
        console.log('   Current role in token:', decoded.role);
        console.log('   Required roles:', allowedRoles);
      }
    } catch (error) {
      console.log('❌ Token verification failed:', error.message);
    }

    // 5. Check pending users
    console.log('\n5️⃣ Checking pending users...');
    const pendingUsers = await db.query(
      `SELECT id, email, first_name, last_name, role, is_verified, pending_approval
       FROM users 
       WHERE pending_approval = true AND is_verified = true`
    );
    console.log(`Found ${pendingUsers.rows.length} pending users:`, pendingUsers.rows);

    // 6. Check all users
    console.log('\n6️⃣ Checking all users...');
    const allUsers = await db.query(
      `SELECT id, email, first_name, last_name, role, is_verified, role_approved, pending_approval
       FROM users 
       ORDER BY created_at DESC`
    );
    console.log(`Total users: ${allUsers.rows.length}`);
    allUsers.rows.forEach((u, i) => {
      console.log(`   ${i + 1}. ${u.email} - Role: ${u.role || 'NULL'}, Verified: ${u.is_verified}, Approved: ${u.role_approved}, Pending: ${u.pending_approval}`);
    });

  } else {
    console.log('❌ Admin user NOT found in database!');
    console.log('   Looking for: ravindrakandpal10@gmail.com');
    
    // List all users
    console.log('\nAll users in database:');
    const allUsers = await db.query('SELECT id, email, role FROM users');
    allUsers.rows.forEach((u, i) => {
      console.log(`   ${i + 1}. ${u.email} - Role: ${u.role || 'NULL'}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('DEBUG COMPLETE');
  console.log('='.repeat(60) + '\n');

  process.exit(0);
}

debugAdminAccess().catch(error => {
  console.error('Debug script error:', error);
  process.exit(1);
});
