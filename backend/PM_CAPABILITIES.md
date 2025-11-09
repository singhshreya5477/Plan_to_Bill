# PROJECT MANAGER CAPABILITIES

## ✅ Current Implementation Status

### 1. **CREATE/EDIT PROJECTS** ✅

**Routes:**
- `POST /api/projects` - Create new project
- `PUT /api/projects/:projectId` - Update project
- `GET /api/projects` - View all projects
- `GET /api/projects/:projectId` - View project details

**Implementation:**
```javascript
// backend/src/routes/projectRoutes.js
router.post('/', authorize('admin', 'project_manager'), createProject);
router.put('/:projectId', updateProject);
```

**What PMs Can Do:**
- ✅ Create new projects
- ✅ Edit project details (name, description, budget, dates)
- ✅ View all projects in the system
- ✅ Set project status (active, completed, on-hold)

---

### 2. **ASSIGN PEOPLE (Team Members)** ✅

**Routes:**
- `POST /api/projects/:projectId/members` - Add team member
- `DELETE /api/projects/:projectId/members/:memberId` - Remove team member

**Implementation:**
```javascript
// backend/src/routes/projectRoutes.js
router.post('/:projectId/members', addTeamMember);
router.delete('/:projectId/members/:memberId', removeTeamMember);
```

**What PMs Can Do:**
- ✅ Add team members to projects
- ✅ Remove team members from projects
- ✅ Assign roles (owner, manager, member)

---

### 3. **MANAGE TASKS** ✅

**Routes:**
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:taskId` - Update task
- `DELETE /api/tasks/:taskId` - Delete task
- `GET /api/tasks/project/:projectId` - Get project tasks
- `GET /api/tasks/my-tasks` - Get tasks assigned to PM
- `POST /api/tasks/:taskId/delegate` - Delegate task

**Implementation:**
```javascript
// backend/src/routes/taskRoutes.js
router.post('/', createTask);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);
```

**What PMs Can Do:**
- ✅ Create tasks in projects
- ✅ Assign tasks to team members
- ✅ Update task status, priority, deadlines
- ✅ Delete tasks
- ✅ Delegate tasks received from admin to team members
- ✅ View all tasks in their projects
- ✅ Add comments to tasks

---

### 4. **APPROVE EXPENSES** ⚠️ (Needs Enhancement)

**Current Status:** Partial implementation
- Expense tracking exists in time logs
- No dedicated expense approval workflow yet

**Recommended Implementation:**
```sql
-- Add expenses table
CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  user_id INTEGER REFERENCES users(id),
  amount DECIMAL(10,2),
  description TEXT,
  category VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  receipt_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**TODO:**
- [ ] Create expenses table
- [ ] Add expense routes (create, approve, reject)
- [ ] Add PM authorization for approval

---

### 5. **TRIGGER INVOICES** ✅

**Routes:**
- `POST /api/billing/invoices` - Create invoice
- `PUT /api/billing/invoices/:id` - Update invoice
- `GET /api/billing/invoices` - Get all invoices
- `GET /api/billing/invoices/:id` - Get invoice details
- `POST /api/billing/payments` - Record payment

**Implementation:**
```javascript
// backend/src/routes/billingRoutes.js
router.post('/invoices', authorize('admin', 'project_manager'), createInvoice);
router.put('/invoices/:id', authorize('admin', 'project_manager'), updateInvoice);
router.post('/payments', authorize('admin', 'project_manager'), recordPayment);
```

**What PMs Can Do:**
- ✅ Create invoices for projects
- ✅ Set billing rates
- ✅ Update invoice details
- ✅ Record payments
- ✅ View revenue analytics
- ✅ Mark invoices as sent/paid

---

## 📊 CURRENT DATABASE VERIFICATION

Run this to see PM capabilities in action:

```bash
cd "C:\Users\Ravindra Kandpal\Desktop\Plan_to_Bill\backend"
node show-role-dashboards.js
```

**Project Managers in System:**
- Sanchi Sisodia (id: 3)
- Sajal Rathi (id: 7)

---

## 🎯 COMPLETE WORKFLOW

### **Admin → PM Workflow**
1. Admin creates task
2. Admin assigns to PM (Sanchi or Sajal)
3. PM receives task
4. PM creates project (if needed)
5. PM adds team members to project
6. PM creates sub-tasks
7. PM assigns sub-tasks to team members

### **PM → Team Workflow**
1. PM creates task
2. PM selects project
3. PM selects assignee (John, Sarah, Mike, Lisa)
4. Team member receives task
5. Team member updates status
6. PM tracks progress

### **PM Billing Workflow**
1. PM sets billing rates
2. Team logs hours
3. PM reviews time logs
4. PM creates invoice
5. PM sends invoice to client
6. PM records payment

---

## 🔐 PERMISSION COMPARISON

| Action | Admin | PM | Team Member |
|--------|-------|-----|-------------|
| Create Projects | ✅ | ✅ | ❌ |
| Edit Projects | ✅ | ✅ | ❌ |
| Delete Projects | ✅ | ❌ | ❌ |
| Add Team Members | ✅ | ✅ | ❌ |
| Create Tasks | ✅ | ✅ | ❌ |
| Assign Tasks | ✅ | ✅ | ❌ |
| Update Own Tasks | ✅ | ✅ | ✅ |
| Delete Tasks | ✅ | ✅ | ❌ |
| Create Invoices | ✅ | ✅ | ❌ |
| Approve Expenses | ✅ | ⚠️ | ❌ |
| View All Projects | ✅ | ✅ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |
| Delete Invoices | ✅ | ❌ | ❌ |

---

## ✅ VERIFIED FEATURES

All these are **ALREADY WORKING**:

1. ✅ **Sanchi Sisodia** (PM) has:
   - Created 4 tasks
   - Assigned to John, Sarah, Mike, Lisa
   - Can see all 4 projects
   - Can create invoices

2. ✅ **Sajal Rathi** (PM) has:
   - Received 5 tasks from admin
   - Can assign tasks to team
   - Can manage E-commerce Platform project
   - Can create invoices

---

## 🚀 NEXT STEPS (Optional Enhancements)

1. **Expense Approval System**
   - Create expenses table
   - Add approval workflow
   - PM approves/rejects expenses

2. **Advanced Delegation**
   - Visual task hierarchy
   - Delegation tracking
   - Reassignment history

3. **Project Analytics**
   - Team performance metrics
   - Task completion rates
   - Budget vs actual tracking

---

## 📝 TESTING

To test PM capabilities:

1. **Login as PM:**
   - Email: sanchisisodia121@gmail.com
   - Email: sajalrathi457@gmail.com

2. **Create Project:**
   - Go to /projects
   - Click "Create Project"

3. **Assign Team:**
   - Select project
   - Add John, Sarah, Mike, or Lisa

4. **Create Task:**
   - Go to /tasks/create
   - Select project
   - Assign to team member

5. **Create Invoice:**
   - Go to /financial/invoices
   - Click "Create Invoice"
   - Select project

All these features are **LIVE and WORKING**! ✨
