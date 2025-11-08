require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createAdmin() {
  try {
    console.log('🚀 Creating admin user...\n');

    // Admin credentials
    const email = 'sajalrathi457@gmail.com';
    const password = 'Boby3078@';
    const firstName = 'Admin';
    const lastName = 'User';
    const role = 'admin';

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log('⚠️  User already exists. Updating password...');
      
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Update the existing user
      await pool.query(
        `UPDATE users 
         SET password = $1, 
             role = $2, 
             is_verified = TRUE,
             updated_at = CURRENT_TIMESTAMP
         WHERE email = $3`,
        [hashedPassword, role, email]
      );
      
      console.log('✅ Admin user updated successfully!');
    } else {
      // Create a default company first if it doesn't exist
      let companyId;
      const companyResult = await pool.query(
        'SELECT id FROM companies WHERE name = $1',
        ['Default Company']
      );

      if (companyResult.rows.length > 0) {
        companyId = companyResult.rows[0].id;
      } else {
        const newCompany = await pool.query(
          'INSERT INTO companies (name) VALUES ($1) RETURNING id',
          ['Default Company']
        );
        companyId = newCompany.rows[0].id;
        console.log('✅ Default company created');
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the admin user
      await pool.query(
        `INSERT INTO users (email, password, first_name, last_name, role, company_id, is_verified)
         VALUES ($1, $2, $3, $4, $5, $6, TRUE)`,
        [email, hashedPassword, firstName, lastName, role, companyId]
      );

      console.log('✅ Admin user created successfully!');
    }

    console.log('\n📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 Role:', role);
    console.log('✅ Email Verified: true');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    await pool.end();
    process.exit(1);
  }
}

createAdmin();
