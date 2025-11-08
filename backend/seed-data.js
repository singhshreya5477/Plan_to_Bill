require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedData() {
  try {
    console.log('🌱 Seeding sample data...\n');

    // Get the admin user
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', ['sajalrathi457@gmail.com']);
    if (userResult.rows.length === 0) {
      console.log('❌ Admin user not found. Please run create-admin.js first.');
      process.exit(1);
    }

    const user = userResult.rows[0];
    const companyId = user.company_id;
    const userId = user.id;

    console.log(`📧 Using admin: ${user.email}`);
    console.log(`🏢 Company ID: ${companyId}\n`);

    // Create sample projects
    const projects = [
      {
        name: 'Website Redesign',
        client: 'Tech Corp',
        description: 'Complete overhaul of corporate website',
        status: 'active',
        progress: 65,
        budget: 50000,
        spent: 32500,
        revenue: 45000,
        deadline: '2025-12-31',
        color: 'blue',
        priority: 'high',
        tags: ['Web', 'Design', 'Development']
      },
      {
        name: 'Mobile App Development',
        client: 'StartupXYZ',
        description: 'iOS and Android app for e-commerce',
        status: 'active',
        progress: 45,
        budget: 80000,
        spent: 36000,
        revenue: 72000,
        deadline: '2026-03-15',
        color: 'purple',
        priority: 'urgent',
        tags: ['Mobile', 'iOS', 'Android']
      },
      {
        name: 'Marketing Campaign',
        client: 'Fashion Brand',
        description: 'Q1 2026 digital marketing campaign',
        status: 'active',
        progress: 30,
        budget: 25000,
        spent: 7500,
        revenue: 22500,
        deadline: '2026-02-28',
        color: 'pink',
        priority: 'medium',
        tags: ['Marketing', 'Social Media']
      },
      {
        name: 'API Integration',
        client: 'FinTech Solutions',
        description: 'Payment gateway API integration',
        status: 'active',
        progress: 85,
        budget: 35000,
        spent: 29750,
        revenue: 31500,
        deadline: '2025-11-30',
        color: 'green',
        priority: 'high',
        tags: ['Backend', 'API', 'FinTech']
      },
      {
        name: 'Data Analytics Dashboard',
        client: 'Analytics Inc',
        description: 'Real-time analytics dashboard',
        status: 'on-hold',
        progress: 20,
        budget: 45000,
        spent: 9000,
        revenue: 40500,
        deadline: '2026-04-30',
        color: 'orange',
        priority: 'medium',
        tags: ['Analytics', 'Dashboard', 'Data']
      }
    ];

    console.log('Creating projects...');
    for (const project of projects) {
      const projectResult = await pool.query(
        `INSERT INTO projects 
         (name, client, description, status, progress, budget, spent, revenue, deadline, color, priority, manager_id, company_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING id`,
        [
          project.name,
          project.client,
          project.description,
          project.status,
          project.progress,
          project.budget,
          project.spent,
          project.revenue,
          project.deadline,
          project.color,
          project.priority,
          userId,
          companyId
        ]
      );

      const projectId = projectResult.rows[0].id;
      console.log(`  ✅ Created: ${project.name} (ID: ${projectId})`);

      // Add tags
      for (const tag of project.tags) {
        await pool.query(
          'INSERT INTO project_tags (project_id, tag) VALUES ($1, $2)',
          [projectId, tag]
        );
      }

      // Add project member (admin)
      await pool.query(
        'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
        [projectId, userId, 'manager']
      );
    }

    // Create sample tasks
    console.log('\nCreating tasks...');
    const projectIds = await pool.query('SELECT id FROM projects WHERE company_id = $1', [companyId]);
    
    const taskTemplates = [
      { title: 'Design mockups', status: 'completed', priority: 'high', estimated: 8 },
      { title: 'Develop frontend', status: 'in-progress', priority: 'high', estimated: 40 },
      { title: 'Backend API', status: 'in-progress', priority: 'urgent', estimated: 32 },
      { title: 'Testing & QA', status: 'todo', priority: 'medium', estimated: 16 },
      { title: 'Client review', status: 'todo', priority: 'medium', estimated: 4 },
      { title: 'Deploy to production', status: 'todo', priority: 'high', estimated: 8 }
    ];

    for (const project of projectIds.rows) {
      const numTasks = Math.floor(Math.random() * 4) + 3; // 3-6 tasks per project
      for (let i = 0; i < numTasks; i++) {
        const template = taskTemplates[i % taskTemplates.length];
        await pool.query(
          `INSERT INTO tasks 
           (title, description, project_id, assignee_id, status, priority, due_date, estimated_hours, actual_hours, company_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            template.title,
            `Working on ${template.title.toLowerCase()}`,
            project.id,
            userId,
            template.status,
            template.priority,
            new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within 30 days
            template.estimated,
            template.status === 'completed' ? template.estimated : Math.floor(template.estimated * Math.random()),
            companyId
          ]
        );
      }
    }
    console.log('  ✅ Created sample tasks');

    // Create sample time logs
    console.log('\nCreating time logs...');
    const tasks = await pool.query('SELECT id, project_id FROM tasks WHERE company_id = $1 LIMIT 10', [companyId]);
    
    for (const task of tasks.rows) {
      const hours = Math.floor(Math.random() * 8) + 1; // 1-8 hours
      await pool.query(
        `INSERT INTO time_logs (user_id, project_id, task_id, hours, description, date)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          task.project_id,
          task.id,
          hours,
          'Working on task',
          new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random date within last 7 days
        ]
      );
    }
    console.log('  ✅ Created sample time logs');

    console.log('\n✅ Sample data seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - ${projects.length} projects created`);
    console.log(`  - ${taskTemplates.length * projectIds.rows.length} tasks created`);
    console.log(`  - ${tasks.rows.length} time logs created`);
    console.log('\n🚀 Your dashboard is now populated with sample data!');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    await pool.end();
    process.exit(1);
  }
}

seedData();
