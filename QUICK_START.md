# Quick Start Guide - Plan to Bill Testing

## Prerequisites
- PostgreSQL installed and running
- Node.js installed
- Database password set to `RSSS` (or update .env file)

## Step-by-Step Setup

### 1. Setup Database
```bash
cd backend
node setup-db.js
```

You should see:
```
✅ Companies table created
✅ Users table created
✅ Projects table created
✅ Project members table created
✅ Tasks table created
✅ Expenses table created
✅ Invoices table created
✅ Invoice items table created
```

### 2. Start Backend Server
```bash
# From backend directory
node server.js
```

You should see:
```
✅ Database connected successfully
✅ Server running on port 5000
📧 Email configured: ravindrakandpal10@gmail.com
```

**Leave this terminal running!**

### 3. Open Frontend
Open `frontend/index.html` in your web browser:
- Windows: Double-click the file
- Mac: Right-click > Open With > Browser
- VS Code: Install "Live Server" extension, right-click > Open with Live Server

### 4. Test the Application

#### A. Register & Login
1. Click "Register New User"
2. Fill in details:
   ```
   Email: manager@test.com
   Password: password123
   First Name: John
   Last Name: Manager
   Company: Test Corp
   Role: project_manager
   ```
3. Click "Register"
4. For testing, you can skip email verification and login directly
5. Click "Back to Login"
6. Login with the credentials

#### B. Create a Project
1. Go to "Projects" tab
2. Fill in:
   ```
   Name: Website Redesign
   Description: Redesign company website
   Budget: 50000
   Status: active
   Start Date: 2025-01-01
   End Date: 2025-06-30
   ```
3. Click "Create Project"
4. **Note the project ID from the response** (e.g., id: 1)

#### C. Create a Task
1. Go to "Tasks" tab
2. Fill in:
   ```
   Title: Design Homepage
   Description: Create wireframes and mockups
   Project ID: 1 (from step B)
   Priority: high
   Status: pending
   Due Date: 2025-02-01
   ```
3. Click "Create Task"

#### D. Submit an Expense
1. Go to "Expenses" tab
2. Fill in:
   ```
   Title: Design Software License
   Description: Adobe Creative Cloud
   Amount: 52.99
   Category: Software
   Project ID: 1
   ```
3. Click "Submit Expense"
4. **Note the expense ID from response** (e.g., id: 1)

#### E. Approve the Expense
1. Still in "Expenses" tab
2. Scroll to "Approve/Reject Expense"
3. Fill in:
   ```
   Expense ID: 1 (from step D)
   Action: Approve
   ```
4. Click "Review Expense"

#### F. Create an Invoice
1. Go to "Invoices" tab
2. Fill in:
   ```
   Client Name: Acme Corporation
   Client Email: billing@acme.com
   Project ID: 1
   Amount: 15000
   Tax Amount: 1500
   Issue Date: 2025-11-08
   Due Date: 2025-12-08
   Notes: Payment for Phase 1
   ```
3. Click "Create Invoice"
4. **Note the invoice ID** (e.g., id: 1)

#### G. Send & Mark Invoice as Paid
1. In "Invoice Actions" section
2. Enter Invoice ID: 1
3. Click "Send Invoice"
4. Click "Mark as Paid"

## View All Data

At any point, you can click the "Get All" buttons:
- **Get All Projects** - See all projects in your company
- **Get All Tasks** - See all tasks
- **Get All Expenses** - See all expenses with approval status
- **Get All Invoices** - See all invoices

## Testing Different Roles

### Test as Admin
1. Logout
2. Register new user with role: `admin`
3. Login and test - admins have full access

### Test as Team Member
1. Logout  
2. Register new user with role: `team_member`
3. Login and test
4. Team members can:
   - View assigned projects
   - Submit expenses
   - Update task status (own tasks only)
5. Team members cannot:
   - Create projects
   - Create tasks
   - Approve expenses
   - Create invoices

## Expected Behavior

### Project Manager Can:
✅ Create/edit projects
✅ Assign team members
✅ Create and assign tasks
✅ Approve expenses for their projects
✅ Create and manage invoices

### Team Member Can:
✅ View assigned projects
✅ Submit expenses
✅ Update task status (own tasks)
❌ Cannot create projects
❌ Cannot approve expenses
❌ Cannot create invoices

### Admin Can:
✅ Everything (full access)

## Troubleshooting

### Backend Won't Start
- Check PostgreSQL is running
- Verify database password in `.env`
- Run `node setup-db.js` again

### Login Fails
- Check user exists in database
- For testing, you can skip email verification
- Check backend console for errors

### 403 Forbidden Error
- Wrong user role for the operation
- Login as project_manager or admin

### No Response from API
- Check backend server is running
- Check browser console for errors
- Verify URL is http://localhost:5000

## What to Look For

### ✅ Success Indicators
- Green response boxes
- Status code 200 or 201
- Data returned with `success: true`
- IDs returned for created items

### ❌ Error Indicators
- Red response boxes
- Error messages
- `success: false`
- Status codes 400, 401, 403, 404, 500

## Next Steps

After testing:
1. Check `TEAM_MANAGER_API.md` for complete API documentation
2. Review `SUMMARY.md` for implementation details
3. Build proper frontend with React/Vue/Angular
4. Add email notifications
5. Add file upload for receipts
6. Add reporting and analytics

## Demo Data

You can create multiple users and test the workflow:

**Admin User:**
- Email: admin@test.com
- Password: admin123
- Role: admin

**Project Manager:**
- Email: pm@test.com
- Password: pm123
- Role: project_manager

**Team Member:**
- Email: member@test.com
- Password: member123
- Role: team_member

Happy Testing! 🎉
