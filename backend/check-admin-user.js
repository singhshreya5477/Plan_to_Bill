require('dotenv').config();
const db = require('./src/config/db');

async function checkAdminUser() {
  console.log('\n🔍 CHECKING ADMIN USER STATUS\n');

  // Check the admin user
  const result = await db.query(
    `SELECT id, email, first_name, last_name, role, is_verified, role_approved, pending_approval, created_at, approved_at
     FROM users 
     WHERE email = 'kandpalravindra21@gmail.com'`
  );

  if (result.rows.length > 0) {
    const admin = result.rows[0];
    console.log('✅ Admin user found:\n');
    console.log('ID:', admin.id);
    console.log('Email:', admin.email);
    console.log('Name:', admin.first_name, admin.last_name);
    console.log('Role:', admin.role);
    console.log('Is Verified:', admin.is_verified);
    console.log('Role Approved:', admin.role_approved);
    console.log('Pending Approval:', admin.pending_approval);
    console.log('Created At:', admin.created_at);
    console.log('Approved At:', admin.approved_at);

    console.log('\n📋 Status Checks:');
    console.log('✓ Has admin role?', admin.role === 'admin' ? '✅ YES' : '❌ NO - Role is: ' + (admin.role || 'NULL'));
    console.log('✓ Is verified?', admin.is_verified ? '✅ YES' : '❌ NO');
    console.log('✓ Role approved?', admin.role_approved ? '✅ YES' : '❌ NO');
    console.log('✓ Not pending?', !admin.pending_approval ? '✅ YES' : '❌ NO - Still pending');

    const canLogin = admin.is_verified && !admin.pending_approval && admin.role_approved && admin.role;
    console.log('\n🎯 Can login?', canLogin ? '✅ YES' : '❌ NO');

    if (!canLogin) {
      console.log('\n🔧 FIXING ADMIN USER...');
      await db.query(
        `UPDATE users 
         SET role = 'admin', 
             is_verified = true, 
             role_approved = true, 
             pending_approval = false,
             approved_at = NOW()
         WHERE email = 'kandpalravindra21@gmail.com'`
      );
      console.log('✅ Admin user fixed! Try logging in again.');
    }
  } else {
    console.log('❌ Admin user NOT found!');
    console.log('\nLet me show you all users:');
    const allUsers = await db.query('SELECT id, email, role, is_verified, role_approved, pending_approval FROM users');
    allUsers.rows.forEach((u, i) => {
      console.log(`${i + 1}. ${u.email}`);
      console.log(`   Role: ${u.role || 'NULL'}, Verified: ${u.is_verified}, Approved: ${u.role_approved}, Pending: ${u.pending_approval}`);
    });
  }

  process.exit(0);
}

checkAdminUser().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
