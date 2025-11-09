# Admin User Management System

## Overview
The Admin User Management system provides a comprehensive interface for administrators to manage user roles, approve pending requests, upgrade/downgrade users, and maintain complete control over system access.

## 🎯 Key Features

### 1. **Pending Approvals Queue**
- View all users who have verified their email and are awaiting role assignment
- Shows user details: name, email, registration date
- Quick actions: Assign Role or Reject User

### 2. **All Users Management**
- Complete list of all system users
- View user information:
  * Name and email
  * Current role (Admin, Project Manager, Team Member)
  * Approval status (Approved, Pending, Not Approved)
  * Join date
- Change roles for existing users
- **Note**: Admins cannot change their own role

### 3. **Role Assignment**
Three role types available:
- **Admin**: Full system access, can manage users and settings
- **Project Manager**: Can create projects, assign tasks, manage team, create invoices
- **Team Member**: Can view assigned tasks, log hours, update task status

### 4. **User Statistics Dashboard**
- Total Users count
- Pending Approvals count
- Approved Users count
- Real-time updates

## 🚀 How to Use

### For Admins:

#### 1. **Access User Management**
- Login with admin credentials
- Click "User Management" in the sidebar (bottom section)
- Or navigate to `/admin/users`

#### 2. **Approve New Users**
When a new user signs up and verifies their email:
1. They appear in the "Pending Approvals" section (yellow badge)
2. Click "Assign Role" button
3. Select appropriate role from modal:
   - Admin
   - Project Manager
   - Team Member
4. Click "Assign Role" to confirm
5. User is immediately approved and can login

#### 3. **Change User Roles (Upgrade/Downgrade)**
To change an existing user's role:
1. Find user in "All Users" table
2. Click "Change Role" button in their row
3. Select new role from modal
4. Confirm assignment
5. Role is updated immediately

#### 4. **Reject Pending Users**
To remove a pending user:
1. Find user in "Pending Approvals" section
2. Click "Reject" button (red)
3. Confirm deletion
4. User is permanently removed from system

## 🔧 Backend API Endpoints

### GET /api/admin/users
**Description**: Get all users in the system  
**Auth Required**: Yes (Admin only)  
**Response**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "role": "project_manager",
        "role_approved": true,
        "pending_approval": false,
        "is_verified": true,
        "created_at": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

### GET /api/admin/pending-users
**Description**: Get users awaiting role assignment  
**Auth Required**: Yes (Admin only)  
**Filters**: Only returns users with `pending_approval=true` AND `is_verified=true`  
**Response**:
```json
{
  "success": true,
  "data": {
    "pendingUsers": [
      {
        "id": 5,
        "first_name": "Jane",
        "last_name": "Smith",
        "email": "jane@example.com",
        "created_at": "2024-01-20T10:00:00Z"
      }
    ]
  }
}
```

### POST /api/admin/users/:userId/assign-role
**Description**: Assign or change a user's role  
**Auth Required**: Yes (Admin only)  
**Body**:
```json
{
  "role": "project_manager"
}
```
**Response**:
```json
{
  "success": true,
  "message": "Role assigned successfully",
  "data": {
    "user": {
      "id": 5,
      "role": "project_manager",
      "role_approved": true,
      "pending_approval": false,
      "approved_by": 1,
      "approved_at": "2024-01-20T15:30:00Z"
    }
  }
}
```

### DELETE /api/admin/users/:userId/reject
**Description**: Reject and remove a pending user  
**Auth Required**: Yes (Admin only)  
**Response**:
```json
{
  "success": true,
  "message": "User rejected and removed successfully"
}
```

## 📊 Database Schema

### Users Table Columns (User Management Related):
```sql
- role: VARCHAR (admin, project_manager, team_member, or NULL)
- role_approved: BOOLEAN (default false)
- pending_approval: BOOLEAN (default false)
- is_verified: BOOLEAN (default false)
- approved_by: INTEGER (references users.id)
- approved_at: TIMESTAMP
- created_at: TIMESTAMP
```

### User States:
1. **New Signup** (Admin/PM roles):
   - `is_verified = false`
   - `pending_approval = true`
   - `role_approved = false`

2. **Email Verified**:
   - `is_verified = true`
   - `pending_approval = true`
   - `role_approved = false`
   - **Appears in Pending Approvals section**

3. **Role Assigned**:
   - `is_verified = true`
   - `pending_approval = false`
   - `role_approved = true`
   - `approved_by = admin_user_id`
   - `approved_at = current_timestamp`
   - **User can now login**

## 🎨 UI Components

### UserManagement.jsx
**Location**: `frontend/src/pages/UserManagement.jsx`

**Features**:
- Statistics cards showing user counts
- Pending approvals section (yellow highlight)
- All users table with filterable data
- Role assignment modal
- Real-time updates with refresh button
- Success/error notifications
- Loading states
- Admin-only access control

**Dependencies**:
- react-icons/fi (FiUsers, FiUserCheck, FiUserX, etc.)
- authService.js (API calls)
- authStore.js (current user context)

## 🔐 Security

### Access Control:
- **Route Protection**: Only admin users can access `/admin/users`
- **API Authorization**: All endpoints require `authorize('admin')` middleware
- **Self-Protection**: Admins cannot change their own role
- **Confirmation Dialogs**: Destructive actions (reject user) require confirmation

### Middleware Stack:
```javascript
router.get('/admin/users', authenticate, authorize('admin'), getAllUsers);
```

## 🧪 Testing

### Manual Testing Steps:

#### Test 1: View Pending Approvals
1. Login as admin
2. Navigate to User Management
3. Verify 5 pending users appear (John, Sarah, Mike, Lisa, New User)
4. Check all user details are displayed correctly

#### Test 2: Assign Role to Pending User
1. Click "Assign Role" for John Developer
2. Select "Team Member" role
3. Click "Assign Role"
4. Verify success message appears
5. Check John moves from pending to all users table
6. Verify John's status shows "Approved"

#### Test 3: Change Existing User Role (Upgrade)
1. Find a team member in All Users table
2. Click "Change Role"
3. Select "Project Manager"
4. Confirm assignment
5. Verify role badge updates to "Project Manager"

#### Test 4: Change Existing User Role (Downgrade)
1. Find a Project Manager
2. Click "Change Role"
3. Select "Team Member"
4. Confirm assignment
5. Verify role badge updates

#### Test 5: Reject Pending User
1. Click "Reject" for a pending user
2. Confirm deletion in popup
3. Verify user is removed from list
4. Check database to confirm deletion

#### Test 6: Refresh Data
1. Click Refresh button
2. Verify all data reloads
3. Check statistics update

### Test Users Available:
```
Admins:
- test@example.com / admin123
- kandpalravindra21@gmail.com / (your password)

Project Managers:
- sanchisisodia121@gmail.com / (approved)
- sajalrathi457@gmail.com / (approved)

Pending Team Members (awaiting approval):
- John Developer (john.dev@company.com)
- Sarah Designer (sarah.design@company.com)
- Mike Tester (mike.test@company.com)
- Lisa Frontend (lisa.frontend@company.com)
- New User (newuser@company.com)
```

## 📝 User Flow Examples

### Example 1: New Admin Signs Up
1. User goes to /signup
2. Fills form with role "Admin"
3. Submits form
4. Receives verification email
5. Clicks verification link
6. **Status**: `pending_approval=true`, `is_verified=true`
7. **Cannot login yet** - gets "pending approval" error
8. Existing admin goes to User Management
9. Sees new user in Pending Approvals
10. Assigns "Admin" role
11. **Status**: `role_approved=true`, `pending_approval=false`
12. User can now login

### Example 2: Team Member Promotion
1. Team member has been working well
2. Admin decides to promote to Project Manager
3. Admin navigates to User Management
4. Finds team member in All Users table
5. Clicks "Change Role"
6. Selects "Project Manager"
7. Confirms assignment
8. Team member immediately gains PM permissions:
   - Can create projects
   - Can assign tasks
   - Can manage team
   - Can create invoices

## 🚦 Status Indicators

### Role Badges:
- **Purple**: Admin
- **Blue**: Project Manager
- **Green**: Team Member
- **Gray**: No Role (null)

### Approval Status Badges:
- **Green (Approved)**: ✓ User is approved and can access system
- **Yellow (Pending)**: ⏳ User awaiting admin approval
- **Gray (Not Approved)**: ⚠️ User not yet approved

## 🎯 Best Practices

### For Admins:
1. **Review pending users promptly** - Users cannot login until approved
2. **Assign appropriate roles** - Consider user's responsibilities
3. **Use Team Member as default** - Upgrade as needed
4. **Regular audits** - Review user list periodically
5. **Don't create too many admins** - Limit admin access

### For System Design:
1. **Email verification first** - Only show verified users as pending
2. **Track approvals** - Keep `approved_by` and `approved_at` for audit trail
3. **Prevent self-modification** - Admins can't change their own role
4. **Confirmation for destructive actions** - Always confirm user rejection

## 🔄 Integration Points

### With Task System:
- Role changes affect task assignment permissions
- PMs can assign tasks after upgrade
- Team members see assigned tasks after approval

### With Project System:
- PMs can create projects after role assignment
- Team members added to projects see project data

### With Dashboard:
- Role determines dashboard widgets shown
- Statistics filtered by user permissions

## 📈 Future Enhancements

### Potential Features:
1. **Bulk Actions**: Select multiple users, assign roles in batch
2. **User Search**: Search by name, email, role
3. **Advanced Filters**: Filter by status, role, date range
4. **User Activity Log**: See last login, recent actions
5. **Custom Roles**: Define custom roles with specific permissions
6. **Role Requests**: Allow users to request role upgrades
7. **Temporary Roles**: Assign roles with expiration dates
8. **Email Notifications**: Notify users when role is assigned
9. **Audit Trail**: Complete history of all role changes
10. **Export Users**: Download user list as CSV

## 🐛 Troubleshooting

### Issue: Pending users not showing
**Solution**: Verify users have `is_verified=true` AND `pending_approval=true`

### Issue: Cannot assign role
**Solution**: Check admin authentication token is valid

### Issue: User still can't login after approval
**Solution**: Verify `role_approved=true` and `pending_approval=false` in database

### Issue: Self-role change attempted
**Solution**: UI prevents this, but backend also blocks it

## 📚 Related Documentation
- [PM_CAPABILITIES.md](./PM_CAPABILITIES.md) - Project Manager features
- [TEAM_MEMBER_CAPABILITIES.md](./TEAM_MEMBER_CAPABILITIES.md) - Team member features
- [COMPLETE_SYSTEM_OVERVIEW.md](./COMPLETE_SYSTEM_OVERVIEW.md) - Full system documentation

## ✅ Summary

The Admin User Management system provides complete control over user access and roles in the OneFlow system. Key highlights:

- ✅ **Backend Complete**: All API endpoints implemented and tested
- ✅ **Frontend Complete**: Full UI with tables, modals, and notifications
- ✅ **Sidebar Integration**: User Management link added for admins
- ✅ **Database Ready**: 5 pending team members ready for approval
- ✅ **Security**: Admin-only access, confirmation dialogs
- ✅ **Real-time Updates**: Instant feedback on all actions

**Ready to use!** Login as admin and start managing users.
