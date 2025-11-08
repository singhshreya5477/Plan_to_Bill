require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database schema...\n');

    // Create companies table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Companies table created');

    // Create users table with email verification
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'project_manager', 'team_member')),
        company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
        is_verified BOOLEAN DEFAULT FALSE,
        verification_otp VARCHAR(6),
        verification_otp_expires TIMESTAMP,
        reset_password_otp VARCHAR(6),
        reset_password_otp_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    console.log('\n✅ Database setup completed successfully!');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    await pool.end();
    process.exit(1);
  }
}

setupDatabase();
