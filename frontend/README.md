# Plan to Bill - Frontend Testing UI

Simple HTML/JS testing interface for the Plan to Bill backend API.

## Features

- **Authentication** - Login/Register
- **Projects** - Create and view projects
- **Tasks** - Create tasks and assign to team members
- **Expenses** - Submit and approve/reject expenses
- **Invoices** - Create invoices and manage status

## How to Use

### 1. Start the Backend Server
```bash
cd backend
node server.js
```

Make sure you see:
```
✅ Database connected successfully
✅ Server running on port 5000
```

### 2. Open the Frontend
Simply open `index.html` in your web browser:
- Double-click `index.html`, OR
- Right-click > Open with > Browser, OR
- Use VS Code Live Server extension

### 3. Test the Features

#### Step 1: Register a User
1. Click "Register New User"
2. Fill in the form:
   - Email: test@example.com
   - Password: password123
   - First Name: John
   - Last Name: Doe
   - Company Name: Test Company
   - Role: project_manager (or admin)
3. Click "Register"
4. Check your email for OTP (or check backend console)
5. Verify your email using the OTP endpoint (you can skip this for testing)

#### Step 2: Login
1. Enter your email and password
2. Click "Login"
3. You should see your name and role displayed

#### Step 3: Create a Project
1. Go to "Projects" tab
2. Fill in project details
3. Click "Create Project"
4. See the response with project ID

#### Step 4: Create Tasks
1. Go to "Tasks" tab
2. Enter task title and project ID (from step 3)
3. Fill in other details
4. Click "Create Task"

#### Step 5: Submit Expenses
1. Go to "Expenses" tab
2. Fill in expense details
3. Click "Submit Expense"

#### Step 6: Approve Expenses (as Project Manager)
1. Get all expenses to see the expense ID
2. Enter the expense ID
3. Select "Approve" or "Reject"
4. Click "Review Expense"

#### Step 7: Create Invoices
1. Go to "Invoices" tab
2. Fill in invoice details
3. Click "Create Invoice"
4. Use invoice actions to send or mark as paid

## API Endpoints Tested

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login

### Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - Get all projects

### Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks` - Get all tasks

### Expenses
- `POST /api/expenses` - Submit expense
- `GET /api/expenses` - Get all expenses
- `PATCH /api/expenses/:id/review` - Approve/reject expense

### Invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices` - Get all invoices
- `PATCH /api/invoices/:id/send` - Send invoice
- `PATCH /api/invoices/:id/mark-paid` - Mark as paid

## Troubleshooting

### CORS Error
If you see CORS errors, make sure:
1. Backend server is running
2. CORS is enabled in backend (already configured)

### 401 Unauthorized
- Make sure you're logged in
- Token expires after 7 days (check JWT_EXPIRE in .env)

### 403 Forbidden
- Check your user role
- Only project_manager and admin can create projects/tasks
- Only project_manager can approve expenses for their projects

### Network Error
- Make sure backend is running on http://localhost:5000
- Check browser console for errors

## Notes

- This is a simple testing UI, not a production frontend
- All data is displayed as JSON in response boxes
- No form validation on frontend (relies on backend validation)
- Token is stored in JavaScript variable (not persistent)
- For production, use a proper frontend framework (React, Vue, Angular)

## Tips

1. **Keep IDs handy** - Copy project IDs, task IDs, etc. from responses
2. **Check responses** - All API responses are shown in the response boxes
3. **Test workflows** - Create project → Add tasks → Submit expense → Approve → Create invoice
4. **Try different roles** - Register multiple users with different roles to test permissions

## Example Workflow

1. Register as **admin** - test-admin@example.com
2. Register as **project_manager** - test-pm@example.com  
3. Register as **team_member** - test-member@example.com
4. Login as project_manager
5. Create a project (note the project ID)
6. Create tasks and assign to team member
7. Login as team member
8. Submit expenses for the project
9. Login as project_manager
10. Approve the expenses
11. Create an invoice for the client
12. Send the invoice
13. Mark it as paid when client pays

Enjoy testing! 🚀
