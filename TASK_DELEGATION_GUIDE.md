# Task Delegation System Guide

## Overview
This system implements a hierarchical task delegation workflow where admins can assign tasks to project managers, who can then redistribute those tasks to team members.

## Features Implemented

### 1. **Database Schema**
New tables and columns added to support delegation tracking:

#### Tasks Table - New Columns:
- `delegated_by` - ID of the user who delegated the task
- `delegation_notes` - Optional notes from the delegator
- `parent_task_id` - Reference to parent task (for task hierarchy)
- `is_delegated` - Boolean flag indicating if task is delegated
- `delegation_date` - Timestamp of delegation

#### New Table: task_delegation_history
Tracks the full delegation chain:
- `task_id` - Reference to the task
- `delegated_from` - User who delegated
- `delegated_to` - User who received the delegation
- `delegation_notes` - Notes from delegator
- `delegated_at` - Timestamp

### 2. **Backend API Endpoints**

#### POST `/api/tasks/:taskId/delegate`
Delegate a task to another user
- **Access:** Admin, Project Manager
- **Body:**
  ```json
  {
    "assignedTo": 123,
    "delegationNotes": "Please complete by Friday"
  }
  ```
- **Validation:**
  - Admins can delegate to project managers or team members
  - Project managers can only delegate to team members (users with no special role)
  - Assigned user must be a member of the project

#### GET `/api/tasks/delegated/to-me`
Get tasks delegated to current user
- **Access:** All authenticated users
- **Returns:** Array of tasks assigned to the current user with delegation info

#### GET `/api/tasks/delegated/by-me`
Get tasks current user delegated to others
- **Access:** Admin, Project Manager
- **Returns:** Array of tasks delegated by the current user

#### GET `/api/tasks/:taskId/delegation-history`
Get complete delegation history for a task
- **Access:** All authenticated users
- **Returns:** Chronological list of all delegations for the task

### 3. **Frontend Components**

#### DelegatedTasks Page (`/tasks/delegated`)
Two-tab interface:
- **Tasks Delegated to Me:** View tasks assigned by admins/managers
- **Tasks I Delegated:** View tasks you delegated to others (admin/PM only)

Features:
- Status and priority badges
- Delegation notes display
- Delegator/assignee information
- Due dates and delegation dates
- Responsive design with theme support

#### TaskDelegationModal Component
Modal for delegating tasks:
- Select team member from project members
- Add optional delegation notes
- Real-time validation
- Error handling

#### Enhanced Tasks Page
- **New "Delegate" option** in task menu (visible to admins and project managers only)
- Dropdown menu now includes: Edit, Delegate, Delete
- Task delegation triggers modal
- Auto-refresh after successful delegation

### 4. **Permission System**

#### User Roles:
1. **Admin** (`role: 'admin'`)
   - Can delegate to project managers and team members
   - Can view all delegated tasks
   - Full system access

2. **Project Manager** (`role: 'project_manager'`)
   - Can delegate to team members only
   - Can view tasks delegated to them
   - Can view tasks they delegated

3. **Team Member** (`role: null` or no role)
   - Can view tasks delegated to them
   - Cannot delegate tasks
   - Can complete assigned tasks

## Usage Workflow

### Scenario 1: Admin → Project Manager → Team Member

1. **Admin creates and delegates task:**
   ```
   Admin creates "Build Login System"
   → Delegates to Project Manager (Sanchi)
   → Adds note: "Please assign to frontend developer"
   ```

2. **Project Manager receives task:**
   ```
   PM sees task in "Tasks Delegated to Me"
   → Clicks "Delegate" in task menu
   → Assigns to Team Member (Sajal)
   → Adds note: "Use React and JWT for authentication"
   ```

3. **Team Member receives task:**
   ```
   Team member sees task in "Tasks Delegated to Me"
   → Starts working on task
   → Updates status: todo → in_progress → done
   ```

### Scenario 2: Direct Admin Assignment

1. **Admin assigns directly to team member:**
   ```
   Admin creates "Fix Bug #123"
   → Delegates directly to team member
   → Task appears in member's "Tasks Delegated to Me"
   ```

## How to Use

### For Admins:

1. **Navigate to Tasks page** (`/tasks`)
2. **Hover over a task card** and click the three dots (⋮)
3. **Click "Delegate"** from the dropdown menu
4. **Select a project manager or team member** from the dropdown
5. **Add optional notes** to provide context
6. **Click "Delegate Task"**

7. **View delegated tasks:**
   - Visit `/tasks/delegated`
   - Switch to "Tasks I Delegated" tab
   - Monitor progress and status

### For Project Managers:

1. **View tasks assigned to you:**
   - Visit `/tasks/delegated`
   - See tasks in "Tasks Delegated to Me" tab

2. **Redistribute tasks to team members:**
   - Click on task
   - Click three dots → "Delegate"
   - Select team member
   - Add instructions
   - Delegate

3. **Track delegations:**
   - Switch to "Tasks I Delegated" tab
   - Monitor team member progress

### For Team Members:

1. **View assigned tasks:**
   - Visit `/tasks/delegated`
   - See all tasks delegated to you
   - View delegation notes and deadlines

2. **Work on tasks:**
   - Update task status (New → In Progress → Done)
   - Use the edit feature to update details
   - Communicate with delegator if needed

## Technical Details

### Database Migration
Run the delegation setup script:
```bash
cd backend
node add-task-delegation.js
```

### API Integration
Frontend uses `taskService.js` methods:
```javascript
// Delegate a task
await taskService.delegateTask(taskId, assignedToUserId, notes);

// Get tasks delegated to me
const response = await taskService.getDelegatedToMe();

// Get tasks I delegated
const response = await taskService.getTasksIDelegated();

// Get delegation history
const response = await taskService.getTaskDelegationHistory(taskId);
```

### Component Props

**TaskDelegationModal:**
```jsx
<TaskDelegationModal
  task={taskObject}          // Task to delegate
  onClose={() => {}}         // Close handler
  onSuccess={() => {}}       // Success callback
/>
```

## Security Considerations

1. **Role-based access control** enforced on backend
2. **Project membership validation** ensures users can only access project tasks
3. **Delegation permissions** strictly enforced (admins → PMs, PMs → members)
4. **Audit trail** maintained in `task_delegation_history` table

## Future Enhancements

1. **Email notifications** when tasks are delegated
2. **Delegation approval workflow** (optional approval before delegation)
3. **Bulk delegation** for multiple tasks
4. **Delegation analytics** (track delegation patterns, bottlenecks)
5. **Sub-task creation** from delegated tasks
6. **Delegation templates** for common workflows

## Troubleshooting

### Task not appearing after delegation:
- Check project membership
- Verify user role permissions
- Check browser console for API errors

### Cannot delegate task:
- Ensure you have admin or project manager role
- Verify target user is project member
- Check if task already has maximum delegation depth

### Delegation modal not showing team members:
- Ensure project has members assigned
- Verify API response in network tab
- Check project_members table in database

## Database Queries

### Check delegation history:
```sql
SELECT * FROM task_delegation_history 
WHERE task_id = YOUR_TASK_ID 
ORDER BY delegated_at DESC;
```

### View all delegated tasks:
```sql
SELECT 
  t.id, 
  t.title, 
  u1.first_name || ' ' || u1.last_name as delegated_by,
  u2.first_name || ' ' || u2.last_name as assigned_to,
  t.delegation_notes
FROM tasks t
LEFT JOIN users u1 ON t.delegated_by = u1.id
LEFT JOIN users u2 ON t.assigned_to = u2.id
WHERE t.is_delegated = TRUE;
```

### Count delegations per user:
```sql
SELECT 
  u.first_name || ' ' || u.last_name as user_name,
  COUNT(*) as tasks_delegated
FROM task_delegation_history tdh
JOIN users u ON tdh.delegated_from = u.id
GROUP BY u.id, user_name
ORDER BY tasks_delegated DESC;
```

## Support
For issues or questions about task delegation:
1. Check this guide
2. Review backend logs (`console.log` in taskController.js)
3. Check browser console for frontend errors
4. Verify database schema matches expected structure
