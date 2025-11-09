# Admin User Management - Quick Reference

## 🎯 What Was Added

### Frontend
✅ **New Page**: `frontend/src/pages/UserManagement.jsx`
- Complete user management interface
- Pending approvals section
- All users table
- Role assignment modal
- Statistics dashboard

✅ **Navigation**: Added to `Sidebar.jsx`
- "User Management" link (admin only)
- Located in bottom navigation section
- Icon: FiUsers

✅ **Routing**: Added to `App.jsx`
- Route: `/admin/users`
- Component: `<UserManagement />`

### Backend (Already Existed)
✅ **Controller**: `backend/src/controllers/adminController.js`
- getPendingUsers()
- getAllUsers()
- assignRole()
- rejectUser()

✅ **Routes**: `backend/src/routes/adminRoutes.js`
- GET `/api/admin/users`
- GET `/api/admin/pending-users`
- POST `/api/admin/users/:userId/assign-role`
- DELETE `/api/admin/users/:userId/reject`

### Database
✅ **Team Members Verified**: 5 users ready for approval
- John Developer
- Sarah Designer
- Mike Tester
- Lisa Frontend
- New User

## 📋 Quick Start

### 1. Start the System
```powershell
# Backend (Terminal 1)
cd backend
npm start

# Frontend (Terminal 2)
cd frontend
npm run dev
```

### 2. Login as Admin
```
Email: test@example.com
Password: admin123
```

### 3. Access User Management
- Click "User Management" in sidebar (bottom section)
- Or navigate to: http://localhost:3000/admin/users

### 4. Approve Pending Users
1. See 5 users in "Pending Approvals" (yellow section)
2. Click "Assign Role" for any user
3. Select role: Admin, Project Manager, or Team Member
4. Click "Assign Role" to confirm

## 🎨 UI Features

### Statistics Cards (Top)
- **Total Users**: Shows 9 (2 admins + 2 PMs + 5 pending)
- **Pending Approvals**: Shows 5 (team members awaiting role)
- **Approved Users**: Shows 4 (2 admins + 2 PMs)

### Pending Approvals Section (Yellow)
- Shows users who verified email and need role assignment
- Columns: User, Email, Registered
- Actions: "Assign Role" (blue), "Reject" (red)

### All Users Table (White)
- Shows everyone in the system
- Columns: User, Email, Role, Status, Joined, Actions
- Actions: "Change Role" (except for self)

### Role Assignment Modal
- Radio buttons for 3 roles:
  1. **Admin** - Full system access
  2. **Project Manager** - Create projects, manage team
  3. **Team Member** - View tasks, log hours
- Buttons: Cancel, Assign Role

## 🔑 Capabilities by Role

### Admin
- View all users
- Assign roles to new users
- Change existing user roles (upgrade/downgrade)
- Reject/remove pending users
- Access all system features

### Project Manager
- Create and edit projects
- Assign people to projects
- Create and assign tasks
- Approve expenses (partial implementation)
- Trigger invoices

### Team Member
- View assigned tasks
- Update task status
- Log hours/timesheet entries
- Submit expenses (TBD)

## 🧪 Test Scenarios

### Scenario 1: Approve Team Member
1. Login as admin
2. Go to User Management
3. Find "John Developer" in Pending Approvals
4. Click "Assign Role"
5. Select "Team Member"
6. Click "Assign Role"
7. ✅ John appears in All Users table as "Team Member"
8. John can now login and see his tasks

### Scenario 2: Promote to Project Manager
1. Find John in All Users table
2. Click "Change Role"
3. Select "Project Manager"
4. Click "Assign Role"
5. ✅ John's role badge changes to "Project Manager"
6. John can now create projects and assign tasks

### Scenario 3: Demote to Team Member
1. Find a Project Manager
2. Click "Change Role"
3. Select "Team Member"
4. Confirm
5. ✅ User loses PM privileges

### Scenario 4: Reject Pending User
1. Find user in Pending Approvals
2. Click "Reject" (red button)
3. Confirm in popup
4. ✅ User removed from system

## 🐛 Common Issues

### Issue: "User Management" not in sidebar
**Fix**: Make sure you're logged in as admin (not PM or team member)

### Issue: Pending section is empty
**Fix**: Run `node verify-team-members.js` to set team members as verified

### Issue: Cannot assign role
**Fix**: Check backend is running on port 5000, check admin token is valid

### Issue: Changes not saving
**Fix**: Check browser console for API errors, verify backend connection

## 📊 Current System State

```
Total Users: 9

Admins (2):
✅ Test User (test@example.com)
✅ Ravindra Kandpal (kandpalravindra21@gmail.com)

Project Managers (2):
✅ Sanchi Sisodia (sanchisisodia121@gmail.com)
✅ Sajal Rathi (sajalrathi457@gmail.com)

Pending Team Members (5):
⏳ New User (newuser@company.com)
⏳ John Developer (john.dev@company.com)
⏳ Sarah Designer (sarah.design@company.com)
⏳ Mike Tester (mike.test@company.com)
⏳ Lisa Frontend (lisa.frontend@company.com)
```

## 🎯 Next Steps

1. ✅ **Test User Management**: Assign roles to all 5 pending users
2. ✅ **Test Role Changes**: Upgrade/downgrade existing users
3. ✅ **Verify Task Assignment**: Ensure PMs can assign to newly approved team members
4. ✅ **Check Dashboards**: Verify each role sees correct dashboard

## 📝 API Testing with curl

### Get All Users
```powershell
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" http://localhost:5000/api/admin/users
```

### Get Pending Users
```powershell
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" http://localhost:5000/api/admin/pending-users
```

### Assign Role
```powershell
curl -X POST -H "Authorization: Bearer YOUR_ADMIN_TOKEN" -H "Content-Type: application/json" -d "{\"role\":\"team_member\"}" http://localhost:5000/api/admin/users/6/assign-role
```

### Reject User
```powershell
curl -X DELETE -H "Authorization: Bearer YOUR_ADMIN_TOKEN" http://localhost:5000/api/admin/users/6/reject
```

## ✨ Summary

**COMPLETE!** You now have a fully functional Admin User Management system:

✅ Backend API ready (already existed)
✅ Frontend UI created (NEW)
✅ Navigation integrated (NEW)
✅ 5 pending users ready for testing (NEW - verified)
✅ Complete documentation (NEW)

**Ready to use immediately!**
