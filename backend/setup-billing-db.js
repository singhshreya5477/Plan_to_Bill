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

async function setupBillingDatabase() {
    const client = await pool.connect();
    
    try {
        console.log('🚀 Starting Phase 2: Time Tracking & Billing database setup...\n');

        // Read and execute the SQL file
        const sqlPath = path.join(__dirname, 'src', 'config', 'setup-billing-db.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        await client.query(sql);
        
        console.log('\n✅ Database schema created successfully!\n');
        
        // Insert sample billing rates
        console.log('📝 Inserting sample billing rates...');
        await client.query(`
            INSERT INTO billing_rates (project_id, user_id, rate_type, rate, currency, role)
            SELECT 
                p.id, 
                pm.user_id,
                'hourly',
                CASE pm.role
                    WHEN 'owner' THEN 150.00
                    WHEN 'manager' THEN 100.00
                    ELSE 75.00
                END,
                'USD',
                pm.role
            FROM projects p
            JOIN project_members pm ON p.id = pm.project_id
            WHERE p.id IN (SELECT id FROM projects LIMIT 3)
            ON CONFLICT (project_id, user_id, role, effective_from) DO NOTHING;
        `);
        console.log('✅ Billing rates added\n');

        // Insert sample time logs
        console.log('📝 Inserting sample time logs...');
        await client.query(`
            INSERT INTO time_logs (user_id, project_id, task_id, description, hours, log_date, is_billable, hourly_rate)
            SELECT 
                t.assigned_to,
                t.project_id,
                t.id,
                'Working on ' || t.title,
                (RANDOM() * 8 + 1)::DECIMAL(10,2),
                CURRENT_DATE - (RANDOM() * 30)::INTEGER,
                true,
                CASE 
                    WHEN pm.role = 'owner' THEN 150.00
                    WHEN pm.role = 'manager' THEN 100.00
                    ELSE 75.00
                END
            FROM tasks t
            JOIN project_members pm ON t.project_id = pm.project_id AND t.assigned_to = pm.user_id
            WHERE t.assigned_to IS NOT NULL
            LIMIT 20;
        `);
        console.log('✅ Time logs added\n');

        // Create sample invoice
        console.log('📝 Creating sample invoice...');
        const invoiceResult = await client.query(`
            INSERT INTO invoices (
                invoice_number, 
                project_id, 
                client_name, 
                client_email,
                issue_date, 
                due_date, 
                status,
                tax_rate,
                created_by
            )
            SELECT 
                'INV-' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || '-001',
                p.id,
                'Acme Corporation',
                'billing@acmecorp.com',
                CURRENT_DATE,
                CURRENT_DATE + INTERVAL '30 days',
                'draft',
                10.00,
                p.created_by
            FROM projects p
            WHERE p.id = (SELECT id FROM projects LIMIT 1)
            RETURNING id;
        `);
        
        const invoiceId = invoiceResult.rows[0].id;
        console.log(`✅ Invoice created (ID: ${invoiceId})\n`);

        // Add invoice items from time logs
        console.log('📝 Adding invoice items...');
        await client.query(`
            INSERT INTO invoice_items (invoice_id, time_log_id, description, quantity, unit_price)
            SELECT 
                $1,
                tl.id,
                tl.description || ' (' || TO_CHAR(tl.log_date, 'YYYY-MM-DD') || ')',
                tl.hours,
                COALESCE(tl.hourly_rate, 75.00)
            FROM time_logs tl
            WHERE tl.is_billable = true
            AND tl.project_id = (SELECT project_id FROM invoices WHERE id = $1)
            LIMIT 5;
        `, [invoiceId]);
        console.log('✅ Invoice items added\n');

        // Get summary statistics
        console.log('📊 SUMMARY STATISTICS:\n');
        
        const stats = await client.query(`
            SELECT 
                (SELECT COUNT(*) FROM time_logs) as time_logs_count,
                (SELECT COALESCE(SUM(hours), 0) FROM time_logs) as total_hours,
                (SELECT COUNT(*) FROM billing_rates) as billing_rates_count,
                (SELECT COUNT(*) FROM invoices) as invoices_count,
                (SELECT COUNT(*) FROM invoice_items) as invoice_items_count,
                (SELECT COALESCE(SUM(total), 0) FROM invoices) as total_invoiced;
        `);
        
        const summary = stats.rows[0];
        console.log(`   Time Logs: ${summary.time_logs_count}`);
        console.log(`   Total Hours Logged: ${parseFloat(summary.total_hours).toFixed(2)}`);
        console.log(`   Billing Rates Configured: ${summary.billing_rates_count}`);
        console.log(`   Invoices Created: ${summary.invoices_count}`);
        console.log(`   Invoice Items: ${summary.invoice_items_count}`);
        console.log(`   Total Invoiced: $${parseFloat(summary.total_invoiced).toFixed(2)}`);
        
        console.log('\n✨ Phase 2 database setup complete! Ready for Time Tracking & Billing.\n');
        
    } catch (error) {
        console.error('❌ Error setting up database:', error.message);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run the setup
setupBillingDatabase()
    .then(() => {
        console.log('👍 All done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Setup failed:', error);
        process.exit(1);
    });
