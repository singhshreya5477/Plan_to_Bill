# Team Manager Complete Features API Documentation

## Overview
Complete API documentation for Team Manager (project_manager role) features including:
- ✅ **Project Management** - Create/edit projects
- ✅ **Team Assignment** - Assign people to projects
- ✅ **Task Management** - Create and manage tasks
- ✅ **Expense Approval** - Review and approve expenses
- ✅ **Invoice Triggering** - Generate and manage invoices

---

## Database Schema

### Projects Table
- Project information with status, dates, and budget

### Project Members Table
- Team member assignments to projects

### Tasks Table
- Task assignments with status, priority, and due dates
- Links to projects and assigned users

### Expenses Table
- Expense submissions with approval workflow
- Links to projects and submitters

### Invoices Table
- Invoice generation with client details
- Status tracking (draft, sent, paid, overdue)

### Invoice Items Table
- Line items for invoices

---

## API Endpoints

## 1. PROJECT MANAGEMENT

### Create Project
**POST** `/api/projects`
**Auth**: project_manager or admin

```json
{
  "name": "E-Commerce Platform",
  "description": "Build modern e-commerce site",
  "status": "active",
  "start_date": "2025-01-15",
  "end_date": "2025-06-30",
  "budget": 75000.00
}
```

### Assign Team Member
**POST** `/api/projects/:id/members`

```json
{
  "user_id": 3,
  "role": "member"
}
```

---

## 2. TASK MANAGEMENT

### Create Task (Assign People)
**POST** `/api/tasks`
**Auth**: project_manager or admin

```json
{
  "title": "Design Homepage",
  "description": "Create wireframes and mockups",
  "status": "pending",
  "priority": "high",
  "project_id": 1,
  "assigned_to": 5,
  "due_date": "2025-02-01"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Task created successfully",
  "task": {
    "id": 1,
    "title": "Design Homepage",
    "status": "pending",
    "priority": "high",
    "assigned_to": 5,
    "due_date": "2025-02-01"
  }
}
```

### Get All Tasks
**GET** `/api/tasks?project_id=1&status=pending&priority=high&assigned_to=5`

**Query Parameters**:
- `project_id` - Filter by project
- `status` - pending | in_progress | completed | cancelled
- `priority` - low | medium | high | urgent
- `assigned_to` - Filter by assigned user ID

### Update Task Status
**PUT** `/api/tasks/:id`

```json
{
  "status": "in_progress"
}
```

**Team members** can only update status of tasks assigned to them.
**Project managers** can update all fields.

### Delete Task
**DELETE** `/api/tasks/:id`
**Auth**: project_manager or admin

---

## 3. EXPENSE APPROVAL

### Submit Expense
**POST** `/api/expenses`
**Auth**: Any project member

```json
{
  "title": "Cloud Hosting",
  "description": "AWS hosting for January",
  "amount": 500.00,
  "category": "Infrastructure",
  "project_id": 1,
  "receipt_url": "https://example.com/receipt.pdf"
}
```

### Get All Expenses
**GET** `/api/expenses?project_id=1&status=pending&category=Infrastructure`

**Response**:
```json
{
  "success": true,
  "expenses": [
    {
      "id": 1,
      "title": "Cloud Hosting",
      "amount": 500.00,
      "status": "pending",
      "project_name": "E-Commerce Platform",
      "submitted_by_name": "John Doe",
      "created_at": "2025-11-08T10:00:00Z"
    }
  ]
}
```

### Approve/Reject Expense
**PATCH** `/api/expenses/:id/review`
**Auth**: project_manager or admin

```json
{
  "status": "approved"
}
```

**Status options**: `approved` | `rejected`

**Response**:
```json
{
  "success": true,
  "message": "Expense approved successfully",
  "expense": {
    "id": 1,
    "status": "approved",
    "approved_by": 2,
    "approved_at": "2025-11-08T11:00:00Z"
  }
}
```

**Authorization**:
- Only project managers of the project can approve
- Only admins can approve any expense
- Can only review expenses with status "pending"

### Get Single Expense
**GET** `/api/expenses/:id`

### Update Expense (Before Review)
**PUT** `/api/expenses/:id`
**Auth**: Expense submitter (only if status is pending)

### Delete Expense
**DELETE** `/api/expenses/:id`
**Auth**: Admin or submitter (only if pending)

---

## 4. INVOICE TRIGGERING

### Create Invoice (Trigger)
**POST** `/api/invoices`
**Auth**: project_manager or admin

```json
{
  "project_id": 1,
  "client_name": "Acme Corporation",
  "client_email": "billing@acme.com",
  "amount": 10000.00,
  "tax_amount": 1000.00,
  "issue_date": "2025-11-08",
  "due_date": "2025-12-08",
  "notes": "Payment for Phase 1 completion",
  "items": [
    {
      "description": "Frontend Development",
      "quantity": 1,
      "unit_price": 5000.00
    },
    {
      "description": "Backend API Development",
      "quantity": 1,
      "unit_price": 5000.00
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Invoice created successfully",
  "invoice": {
    "id": 1,
    "invoice_number": "INV-202511-0001",
    "project_id": 1,
    "project_name": "E-Commerce Platform",
    "client_name": "Acme Corporation",
    "amount": 10000.00,
    "tax_amount": 1000.00,
    "total_amount": 11000.00,
    "status": "draft",
    "items": [...]
  }
}
```

**Features**:
- Auto-generates unique invoice number (INV-YYYYMM-XXXX)
- Calculates total amount (amount + tax)
- Supports multiple line items
- Initial status is "draft"

### Get All Invoices
**GET** `/api/invoices?project_id=1&status=sent`

**Query Parameters**:
- `project_id` - Filter by project
- `status` - draft | sent | paid | overdue | cancelled

### Get Single Invoice
**GET** `/api/invoices/:id`

**Response includes**:
- Complete invoice details
- All line items
- Project information
- Creator information

### Update Invoice
**PUT** `/api/invoices/:id`
**Auth**: project_manager or admin

```json
{
  "status": "sent",
  "amount": 12000.00,
  "notes": "Updated amount"
}
```

### Send Invoice
**PATCH** `/api/invoices/:id/send`
**Auth**: project_manager or admin

Changes status from "draft" to "sent".

**Response**:
```json
{
  "success": true,
  "message": "Invoice sent successfully",
  "invoice": {
    "id": 1,
    "status": "sent"
  }
}
```

### Mark Invoice as Paid
**PATCH** `/api/invoices/:id/mark-paid`
**Auth**: project_manager or admin

```json
{
  "paid_date": "2025-11-10"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Invoice marked as paid",
  "invoice": {
    "id": 1,
    "status": "paid",
    "paid_date": "2025-11-10"
  }
}
```

### Delete Invoice
**DELETE** `/api/invoices/:id`
**Auth**: project_manager or admin

**Note**: Cannot delete paid invoices.

---

## Authorization Matrix

| Feature | Admin | Project Manager | Team Member |
|---------|-------|-----------------|-------------|
| **Projects** |
| Create project | ✅ | ✅ | ❌ |
| View all projects | ✅ | ✅ | Own projects only |
| Update project | ✅ | Own projects | ❌ |
| Delete project | ✅ | Own projects | ❌ |
| Assign members | ✅ | ✅ | ❌ |
| **Tasks** |
| Create task | ✅ | ✅ | ❌ |
| View tasks | ✅ | ✅ | Own tasks/projects |
| Update task | ✅ | ✅ | Status only (own tasks) |
| Delete task | ✅ | ✅ | ❌ |
| **Expenses** |
| Submit expense | ✅ | ✅ | ✅ |
| View expenses | ✅ | ✅ | Own/project expenses |
| Approve/Reject | ✅ | Own projects | ❌ |
| Update expense | Owner (if pending) | Owner (if pending) | Owner (if pending) |
| **Invoices** |
| Create invoice | ✅ | Own projects | ❌ |
| View invoices | ✅ | ✅ | Project invoices |
| Send invoice | ✅ | Own projects | ❌ |
| Mark as paid | ✅ | Own projects | ❌ |
| Delete invoice | ✅ | Own projects | ❌ |

---

## Complete Workflow Example

### 1. Project Manager Creates Project
```bash
POST /api/projects
{
  "name": "Mobile App Development",
  "budget": 50000
}
```

### 2. Assign Team Members
```bash
POST /api/projects/1/members
{ "user_id": 3, "role": "member" }
```

### 3. Create Tasks and Assign People
```bash
POST /api/tasks
{
  "title": "Setup Development Environment",
  "project_id": 1,
  "assigned_to": 3,
  "priority": "high"
}
```

### 4. Team Member Submits Expense
```bash
POST /api/expenses
{
  "title": "Development Tools License",
  "amount": 299.00,
  "project_id": 1
}
```

### 5. Project Manager Approves Expense
```bash
PATCH /api/expenses/1/review
{ "status": "approved" }
```

### 6. Project Manager Triggers Invoice
```bash
POST /api/invoices
{
  "project_id": 1,
  "client_name": "Client Corp",
  "amount": 15000,
  "issue_date": "2025-11-08",
  "due_date": "2025-12-08",
  "items": [
    { "description": "Phase 1 - Setup", "quantity": 1, "unit_price": 15000 }
  ]
}
```

### 7. Send Invoice to Client
```bash
PATCH /api/invoices/1/send
```

### 8. Mark Invoice as Paid
```bash
PATCH /api/invoices/1/mark-paid
{ "paid_date": "2025-11-15" }
```

---

## Setup Instructions

1. **Run Database Setup**:
   ```bash
   cd backend
   node setup-db.js
   ```

2. **Start Server**:
   ```bash
   npm start
   ```

3. **Verify Setup**:
   ```
   ✅ Database connected successfully
   ✅ Server running on port 5000
   ```

---

## Error Responses

All endpoints return consistent error formats:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific error"
    }
  ]
}
```

**HTTP Status Codes**:
- `200` - Success
- `201` - Created
- `400` - Validation Error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## Task Status Flow
```
pending → in_progress → completed
                     → cancelled
```

## Expense Status Flow
```
pending → approved
       → rejected
```

## Invoice Status Flow
```
draft → sent → paid
            → overdue
     → cancelled
```

---

## Notes

- All dates should be in ISO 8601 format (YYYY-MM-DD)
- All amounts are decimal with 2 decimal places
- Authentication token required in header: `Authorization: Bearer YOUR_TOKEN`
- All timestamps are in UTC
- Invoice numbers are auto-generated and unique
- Project managers can only manage projects they're assigned to
- Admins have full access to all features
