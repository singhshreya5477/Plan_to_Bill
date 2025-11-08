# Project Management API - Team Manager Features

## Overview
This API provides full project management capabilities for team managers (project_manager role) to create, edit, and manage projects.

## Database Schema

### Projects Table
- `id`: Auto-increment primary key
- `name`: Project name (required)
- `description`: Project description
- `status`: active | completed | on_hold | cancelled (default: active)
- `start_date`: Project start date
- `end_date`: Project end date
- `budget`: Project budget (decimal)
- `company_id`: Reference to company
- `created_by`: Reference to user who created the project
- `created_at`: Timestamp
- `updated_at`: Timestamp

### Project Members Table
- `id`: Auto-increment primary key
- `project_id`: Reference to project
- `user_id`: Reference to user
- `role`: manager | member (default: member)
- `assigned_at`: Timestamp
- Unique constraint on (project_id, user_id)

## API Endpoints

### 1. Create Project
**POST** `/api/projects`

**Authentication Required**: Yes (project_manager or admin)

**Request Body**:
```json
{
  "name": "Project Name",
  "description": "Project description",
  "status": "active",
  "start_date": "2025-01-01",
  "end_date": "2025-12-31",
  "budget": 50000.00
}
```

**Response**:
```json
{
  "success": true,
  "message": "Project created successfully",
  "project": {
    "id": 1,
    "name": "Project Name",
    "description": "Project description",
    "status": "active",
    "start_date": "2025-01-01",
    "end_date": "2025-12-31",
    "budget": 50000.00,
    "company_id": 1,
    "created_by": 1,
    "created_at": "2025-11-08T12:00:00Z",
    "updated_at": "2025-11-08T12:00:00Z"
  }
}
```

### 2. Get All Projects
**GET** `/api/projects?status=active&search=keyword`

**Authentication Required**: Yes

**Query Parameters**:
- `status` (optional): Filter by project status
- `search` (optional): Search in name or description

**Response**:
```json
{
  "success": true,
  "projects": [
    {
      "id": 1,
      "name": "Project Name",
      "description": "Project description",
      "status": "active",
      "creator_name": "John Doe",
      "team_size": 5,
      "start_date": "2025-01-01",
      "end_date": "2025-12-31",
      "budget": 50000.00,
      "created_at": "2025-11-08T12:00:00Z"
    }
  ]
}
```

**Notes**:
- Admins and project_managers see all company projects
- Team members only see projects they're assigned to

### 3. Get Single Project
**GET** `/api/projects/:id`

**Authentication Required**: Yes

**Response**:
```json
{
  "success": true,
  "project": {
    "id": 1,
    "name": "Project Name",
    "description": "Project description",
    "status": "active",
    "creator_name": "John Doe",
    "start_date": "2025-01-01",
    "end_date": "2025-12-31",
    "budget": 50000.00,
    "team_members": [
      {
        "user_id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "manager",
        "assigned_at": "2025-11-08T12:00:00Z"
      },
      {
        "user_id": 2,
        "name": "Jane Smith",
        "email": "jane@example.com",
        "role": "member",
        "assigned_at": "2025-11-08T13:00:00Z"
      }
    ]
  }
}
```

### 4. Update Project
**PUT** `/api/projects/:id`

**Authentication Required**: Yes (project_manager or admin)

**Request Body** (all fields optional):
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "status": "on_hold",
  "start_date": "2025-02-01",
  "end_date": "2025-11-30",
  "budget": 60000.00
}
```

**Response**:
```json
{
  "success": true,
  "message": "Project updated successfully",
  "project": {
    "id": 1,
    "name": "Updated Project Name",
    "description": "Updated description",
    "status": "on_hold",
    "start_date": "2025-02-01",
    "end_date": "2025-11-30",
    "budget": 60000.00,
    "updated_at": "2025-11-08T14:00:00Z"
  }
}
```

**Notes**:
- Project managers can only update projects they're assigned to as manager
- Admins can update any project in their company

### 5. Delete Project
**DELETE** `/api/projects/:id`

**Authentication Required**: Yes (project_manager or admin)

**Response**:
```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

**Notes**:
- Project managers can only delete projects they're assigned to as manager
- Admins can delete any project in their company
- Deleting a project also removes all team member assignments (cascade)

### 6. Assign Team Member to Project
**POST** `/api/projects/:id/members`

**Authentication Required**: Yes (project_manager or admin)

**Request Body**:
```json
{
  "user_id": 2,
  "role": "member"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Team member assigned successfully",
  "assignment": {
    "id": 1,
    "project_id": 1,
    "user_id": 2,
    "role": "member",
    "assigned_at": "2025-11-08T15:00:00Z"
  }
}
```

**Notes**:
- If user is already assigned, their role will be updated
- User must belong to the same company

### 7. Remove Team Member from Project
**DELETE** `/api/projects/:id/members/:userId`

**Authentication Required**: Yes (project_manager or admin)

**Response**:
```json
{
  "success": true,
  "message": "Team member removed successfully"
}
```

## Authorization Rules

### Admin Role
- ✅ Create projects
- ✅ View all company projects
- ✅ Update any project in company
- ✅ Delete any project in company
- ✅ Assign/remove team members

### Project Manager Role
- ✅ Create projects
- ✅ View all company projects
- ✅ Update projects they manage
- ✅ Delete projects they manage
- ✅ Assign/remove team members to their projects

### Team Member Role
- ❌ Cannot create projects
- ✅ View only assigned projects
- ❌ Cannot update projects
- ❌ Cannot delete projects
- ❌ Cannot assign/remove team members

## Setup Instructions

1. **Update Database Schema**:
   ```bash
   node setup-db.js
   ```
   This will create the `projects` and `project_members` tables.

2. **Start Server**:
   ```bash
   npm start
   ```
   or
   ```bash
   node server.js
   ```

3. **Test Database Connection**:
   You should see:
   ```
   ✅ Database connected successfully
   ✅ Server running on port 5000
   📧 Email configured: your-email@example.com
   ```

## Example Usage Flow

### Create a Project (as Project Manager)
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "E-Commerce Platform",
    "description": "Build a modern e-commerce platform",
    "status": "active",
    "start_date": "2025-01-15",
    "end_date": "2025-06-30",
    "budget": 75000.00
  }'
```

### Assign Team Members
```bash
curl -X POST http://localhost:5000/api/projects/1/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "user_id": 3,
    "role": "member"
  }'
```

### Update Project Status
```bash
curl -X PUT http://localhost:5000/api/projects/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "completed"
  }'
```

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Validation error
- `401`: Unauthorized (no token or invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not found
- `500`: Server error

Error response format:
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Error description"
    }
  ]
}
```
