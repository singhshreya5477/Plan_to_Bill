# TEAM MEMBER CAPABILITIES - COMPLETE GUIDE

## ✅ VERIFIED CAPABILITIES

### **1. VIEW ASSIGNED TASKS** ✅ WORKING

**Routes:**
- `GET /api/tasks/my-tasks` - Get tasks assigned to logged-in user
- `GET /api/tasks/:taskId` - View specific task details

**What Team Members Can See:**
- ✅ Tasks assigned to them
- ✅ Task title, description, priority, status
- ✅ Project name
- ✅ Who assigned the task (PM or Admin)
- ✅ Due date and estimated hours
- ✅ Task comments

**Example:**
```
John Developer's Tasks:
- "Frontend Development" (E-commerce Platform)
  Assigned by: Sanchi Sisodia (PM)
  Status: todo
  Priority: medium
```

**Restrictions:**
- ❌ Cannot see tasks assigned to other team members
- ❌ Cannot see all tasks in a project
- ❌ Limited to their own assigned tasks only

---

### **2. UPDATE TASK STATUS** ✅ WORKING

**Routes:**
- `PUT /api/tasks/:taskId` - Update task (limited fields)
- `POST /api/tasks/:taskId/comments` - Add comments

**What Team Members Can Update:**
- ✅ Task status (todo → in_progress → done)
- ✅ Add comments to tasks
- ✅ Update actual hours spent
- ✅ Mark task as completed

**Implementation:**
```javascript
// backend/src/controllers/taskController.js
// Team members can only update their own tasks
if (memberRole === 'member' && task.assigned_to !== userId) {
  return res.status(403).json({ 
    message: 'You can only update tasks assigned to you' 
  });
}
```

**Workflow:**
```
1. Team member logs in
2. Views "My Tasks"
3. Clicks on task
4. Updates status: todo → in_progress
5. Adds comment: "Started working on this"
6. Later: in_progress → done
7. PM/Admin sees updated status
```

---

### **3. LOG HOURS** ✅ WORKING

**Routes:**
- `POST /api/time-tracking/log` - Log time entry
- `GET /api/time-tracking/my-logs` - View own time logs
- `PUT /api/time-tracking/:id` - Update time entry
- `DELETE /api/time-tracking/:id` - Delete time entry

**What Team Members Can Log:**
- ✅ Hours worked on specific tasks
- ✅ Hours worked on projects (general)
- ✅ Description of work done
- ✅ Date of work
- ✅ Whether hours are billable

**Database Schema:**
```sql
CREATE TABLE time_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  project_id INTEGER REFERENCES projects(id),
  task_id INTEGER REFERENCES tasks(id),
  description TEXT,
  hours DECIMAL(5,2),
  log_date DATE,
  is_billable BOOLEAN DEFAULT true,
  hourly_rate DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Example Usage:**
```javascript
// POST /api/time-tracking/log
{
  "task_id": 18,
  "project_id": 2,
  "hours": 3.5,
  "description": "Implemented login form UI",
  "log_date": "2025-11-09",
  "is_billable": true
}
```

**UI Pages:**
- `/timesheets` - View and manage time logs
- Can see total hours logged
- Can filter by project/task
- Can edit/delete own entries

---

### **4. SUBMIT EXPENSES** ⚠️ TO BE IMPLEMENTED

**Current Status:** NOT YET IMPLEMENTED

**Recommended Implementation:**

**Database Schema:**
```sql
CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  project_id INTEGER REFERENCES projects(id),
  task_id INTEGER REFERENCES tasks(id),
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(50), -- travel, meals, supplies, etc.
  description TEXT NOT NULL,
  receipt_url TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  rejection_reason TEXT,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Proposed Routes:**
```javascript
POST /api/expenses              // Submit expense
GET /api/expenses/my-expenses   // View own expenses
PUT /api/expenses/:id           // Update expense (if pending)
DELETE /api/expenses/:id        // Delete expense (if pending)
```

**Workflow:**
```
1. Team member incurs expense (e.g., $50 for materials)
2. Goes to /expenses page
3. Fills form:
   - Amount: $50
   - Category: Supplies
   - Description: "Materials for prototype"
   - Upload receipt image
4. Submits → Status: "pending"
5. PM/Admin receives notification
6. PM approves → Status: "approved"
7. Finance team processes reimbursement
```

**Workaround (Current):**
- Team members can add expense notes in time log descriptions
- Can track as "0 hours" time entry with cost description

---

## 🚫 RESTRICTIONS

### **What Team Members CANNOT Do:**

| Action | Allowed | Reason |
|--------|---------|--------|
| Create Projects | ❌ No | Only Admin/PM |
| Create Tasks | ❌ No | Only Admin/PM |
| Assign Tasks to Others | ❌ No | Only Admin/PM |
| Delete Tasks | ❌ No | Only Admin/PM |
| View All Projects | ❌ No | Only assigned projects |
| View Other's Tasks | ❌ No | Only own tasks |
| Create Invoices | ❌ No | Only Admin/PM |
| Manage Team Members | ❌ No | Only Admin/PM |
| Approve Expenses | ❌ No | Only Admin/PM |
| Delete Projects | ❌ No | Only Admin |
| Manage Users | ❌ No | Only Admin |

---

## 📊 CURRENT TEAM MEMBERS

**Active Team Members:**
1. **John Developer** (john.dev@company.com)
   - Assigned to: E-commerce Platform
   - Tasks: 1 (Frontend Development)
   - Status: Active

2. **Sarah Designer** (sarah.design@company.com)
   - Assigned to: E-commerce Platform, test2
   - Tasks: 1 (Backend API Integration)
   - Status: Active

3. **Mike Tester** (mike.test@company.com)
   - Assigned to: E-commerce Platform
   - Tasks: 1 (Testing & QA)
   - Status: Active

4. **Lisa Frontend** (lisa.frontend@company.com)
   - Assigned to: E-commerce Platform
   - Tasks: 1 (Documentation)
   - Status: Active

5. **New User** (newuser@company.com)
   - Not assigned to any projects yet
   - Tasks: 0
   - Status: Inactive

---

## 🎯 TYPICAL TEAM MEMBER WORKFLOW

### **Daily Routine:**

**Morning:**
```
1. Login to system
2. Go to Dashboard → See "My Tasks"
3. Review task priorities and deadlines
4. Select task to work on
5. Update status to "in_progress"
```

**During Work:**
```
6. Work on assigned task
7. Track time spent
8. Add updates/comments if needed
9. Upload any relevant files
```

**End of Day:**
```
10. Log hours worked
    - Select task
    - Enter hours (e.g., 6.5)
    - Add description of work done
11. Update task status if completed
12. Submit any expenses incurred
13. Review tomorrow's tasks
```

---

## 🔐 PERMISSION MATRIX

| Feature | Admin | PM | Team Member |
|---------|-------|-----|-------------|
| **PROJECTS** |
| Create Projects | ✅ | ✅ | ❌ |
| View All Projects | ✅ | ✅ | ❌ |
| View Assigned Projects | ✅ | ✅ | ✅ |
| Edit Projects | ✅ | ✅ | ❌ |
| **TASKS** |
| Create Tasks | ✅ | ✅ | ❌ |
| View All Tasks | ✅ | ✅ | ❌ |
| View Assigned Tasks | ✅ | ✅ | ✅ |
| Update Own Tasks | ✅ | ✅ | ✅ |
| Update Any Task | ✅ | ✅ | ❌ |
| Delete Tasks | ✅ | ✅ | ❌ |
| Assign Tasks | ✅ | ✅ | ❌ |
| **TIME TRACKING** |
| Log Own Hours | ✅ | ✅ | ✅ |
| View Own Hours | ✅ | ✅ | ✅ |
| View All Hours | ✅ | ✅ | ❌ |
| Edit Own Hours | ✅ | ✅ | ✅ |
| Delete Own Hours | ✅ | ✅ | ✅ |
| **EXPENSES** |
| Submit Expenses | ⚠️ | ⚠️ | ⚠️ |
| Approve Expenses | ⚠️ | ⚠️ | ❌ |
| **BILLING** |
| Create Invoices | ✅ | ✅ | ❌ |
| View Invoices | ✅ | ✅ | ❌ |

---

## 📝 TESTING INSTRUCTIONS

### **Test as John Developer:**

1. **Login:**
   ```
   Email: john.dev@company.com
   Password: (use password reset if needed)
   ```

2. **View Tasks:**
   ```
   Go to: http://localhost:3000/tasks
   Should see: "Frontend Development" task
   ```

3. **Update Task:**
   ```
   Click task → Change status to "in_progress"
   Add comment: "Started working on UI components"
   ```

4. **Log Hours:**
   ```
   Go to: http://localhost:3000/timesheets
   Add entry:
     Task: Frontend Development
     Hours: 4
     Description: "Built login and signup forms"
     Date: Today
   ```

5. **Check Restrictions:**
   ```
   Try to create task → Should be blocked
   Try to view other projects → Should only see E-commerce Platform
   Try to create invoice → Should not have access
   ```

---

## ✅ VERIFICATION RESULTS

**Run this to verify:**
```bash
cd "C:\Users\Ravindra Kandpal\Desktop\Plan_to_Bill\backend"
node check-john-tasks.js
```

**Output:**
```
👤 John Developer - TEAM MEMBER
📧 john.dev@company.com 

📋 ASSIGNED TASKS: 1
┌─────────┬────────────────────────┬────────┬──────────┬───────────────────────┬─────────────────┐
│ (index) │ title                  │ status │ priority │ project               │ assigned_by     │
├─────────┼────────────────────────┼────────┼──────────┼───────────────────────┼─────────────────┤
│ 0       │ 'Frontend Development' │ 'todo' │ 'medium' │ 'E-commerce Platform' │ 'Sanchi Sisodia'│
└─────────┴────────────────────────┴────────┴──────────┴───────────────────────┴─────────────────┘

✅ John can:
  • View this task
  • Update status (todo → in_progress → done)
  • Add comments
  • Log hours worked
```

---

## 📚 API ENDPOINTS FOR TEAM MEMBERS

### **Allowed Endpoints:**
```
GET  /api/tasks/my-tasks              ✅ View assigned tasks
GET  /api/tasks/:taskId               ✅ View task details
PUT  /api/tasks/:taskId               ✅ Update own task
POST /api/tasks/:taskId/comments      ✅ Add comment

POST /api/time-tracking/log           ✅ Log hours
GET  /api/time-tracking/my-logs       ✅ View own logs
PUT  /api/time-tracking/:id           ✅ Update own log
DELETE /api/time-tracking/:id         ✅ Delete own log

GET  /api/projects/:id                ✅ View assigned project
GET  /api/dashboard/stats             ✅ View own stats
```

### **Blocked Endpoints:**
```
POST /api/projects                    ❌ Create project
POST /api/tasks                       ❌ Create task
POST /api/billing/invoices            ❌ Create invoice
POST /api/admin/*                     ❌ Admin functions
DELETE /api/tasks/:id                 ❌ Delete task
```

---

## 🚀 NEXT STEPS

1. **Implement Expense System:**
   - Create expenses table
   - Add submit/view endpoints
   - Add approval workflow
   - Add receipt upload

2. **Enhance Team Member Dashboard:**
   - Show task progress
   - Show hours logged this week
   - Show pending approvals
   - Show earnings (if applicable)

3. **Add Notifications:**
   - Task assigned notification
   - Task status change
   - Expense approved/rejected
   - New comment on task

---

**All core features are WORKING! ✨**
Team members can view tasks, update status, and log hours successfully.
