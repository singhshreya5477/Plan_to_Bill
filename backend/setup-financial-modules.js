const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'plan_to_bill',
    user: 'postgres',
    password: 'ravindra'
});

async function setupFinancialModules() {
    const client = await pool.connect();
    
    try {
        console.log('🚀 Starting Financial Modules (SO/PO/Bills/Expenses) setup...\n');

        // Read and execute the SQL file
        const sqlPath = path.join(__dirname, 'src', 'config', 'add-financial-modules.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📝 Creating tables for:');
        console.log('   - Sales Orders (SO)');
        console.log('   - Purchase Orders (PO)');
        console.log('   - Vendor Bills');
        console.log('   - Expenses');
        console.log('');

        await client.query(sql);

        console.log('✅ Financial modules database setup complete!');
        console.log('\n📊 Sample data inserted:');
        console.log('   - 1 Sales Order');
        console.log('   - 1 Purchase Order');
        console.log('   - 1 Vendor Bill');
        console.log('   - 2 Expenses');
        console.log('\n🎉 You can now manage all financial documents in Project → Settings!');

    } catch (error) {
        console.error('❌ Error setting up financial modules:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run setup
setupFinancialModules()
    .then(() => {
        console.log('\n✨ Setup completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Setup failed:', error);
        process.exit(1);
    });
