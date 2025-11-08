require('dotenv').config();
const db = require('./src/config/db');
const fs = require('fs');
const path = require('path');

async function setupProjectsDatabase() {
  try {
    console.log('\n🔧 Setting up Projects & Tasks database...\n');

    // Read SQL file
    const sqlPath = path.join(__dirname, 'src', 'config', 'setup-projects-db.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute SQL
    await db.query(sql);

    console.log('✅ Projects table created');
    console.log('✅ Project members table created');
    console.log('✅ Tasks table created');
    console.log('✅ Task comments table created');
    console.log('✅ Indexes created');
    console.log('✅ Triggers created');

    console.log('\n🎉 Database setup completed successfully!\n');

    // Show table info
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    const result = await db.query(tablesQuery);
    
    console.log('📋 All tables in database:');
    result.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error setting up database:', error.message);
    console.error(error);
    process.exit(1);
  }
}

setupProjectsDatabase();
