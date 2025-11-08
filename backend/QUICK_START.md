# Quick Start Guide - Projects & Tasks API

## 🚀 Getting Started in 5 Minutes

### 1. Start the Server
```powershell
cd backend
npm start
```

### 2. Login & Get Token
```powershell
$body = @{ email = "kandpalravindra21@gmail.com"; password = "Kandpal@345" } | ConvertTo-Json
$login = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
$token = $login.data.token
$headers = @{ Authorization = "Bearer $token" }
```

### 3. Create a Project
```powershell
$project = @{
  name = "My First Project"
  description = "Getting started with Plan to Bill"
  budget = 10000.00
} | ConvertTo-Json

$newProject = Invoke-RestMethod -Uri "http://localhost:5000/api/projects" -Method Post -Headers $headers -Body $project -ContentType "application/json"
$projectId = $newProject.data.project.id
```

### 4. Create a Task
```powershell
$task = @{
  project_id = $projectId
  title = "My First Task"
  description = "This is a test task"
  priority = "high"
  due_date = "2025-01-31"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/tasks" -Method Post -Headers $headers -Body $task -ContentType "application/json"
```

### 5. View Your Projects
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/projects" -Headers $headers
```

---

## 📚 Common Operations

### Get My Tasks
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/tasks/my-tasks" -Headers $headers
```

### Update Task Status
```powershell
$update = @{ status = "in_progress" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/tasks/TASK_ID" -Method Put -Headers $headers -Body $update -ContentType "application/json"
```

### Add Comment
```powershell
$comment = @{ comment = "Working on this now!" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/tasks/TASK_ID/comments" -Method Post -Headers $headers -Body $comment -ContentType "application/json"
```

### Get Project Details
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/projects/PROJECT_ID" -Headers $headers
```

---

## 🎯 Task Status Workflow

```
📋 TODO (new task)
    ↓
⚙️ IN_PROGRESS (actively working)
    ↓
👀 REVIEW (waiting for approval)
    ↓
✅ DONE (completed)
```

## 🏷️ Priority Levels

- 🔴 **URGENT** - Needs immediate attention
- 🟠 **HIGH** - Important, do soon
- 🟡 **MEDIUM** - Normal priority
- 🟢 **LOW** - Can wait

---

## 👥 Team Roles

### Project Roles:
- **Owner** - Full control, created the project
- **Manager** - Can manage tasks and team
- **Member** - Can work on assigned tasks

### System Roles:
- **Admin** - Full system access
- **Project Manager** - Can create projects
- **Team Member** - Can be assigned to projects

---

## 🔒 Who Can Do What?

| Action | Admin | PM (Owner) | PM (Manager) | Member |
|--------|-------|------------|--------------|--------|
| Create Project | ✅ | ✅ | ✅ | ❌ |
| Delete Project | ✅ | ✅ | ❌ | ❌ |
| Add Team Members | ✅ | ✅ | ✅ | ❌ |
| Create Tasks | ✅ | ✅ | ✅ | ❌ |
| Update Own Tasks | ✅ | ✅ | ✅ | ✅ |
| Update Any Task | ✅ | ✅ | ✅ | ❌ |
| Delete Tasks | ✅ | ✅ | ✅ | ❌ |
| Add Comments | ✅ | ✅ | ✅ | ✅ |
| View All Projects | ✅ | ❌ | ❌ | ❌ |

---

## 📊 Useful Queries

### High Priority TODO Tasks
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/tasks/my-tasks?status=todo&priority=high" -Headers $headers
```

### Completed Tasks
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/tasks/my-tasks?status=done" -Headers $headers
```

### Project Statistics
```powershell
$stats = Invoke-RestMethod -Uri "http://localhost:5000/api/projects/PROJECT_ID" -Headers $headers
$stats.data.statistics
```

---

## 🛠️ Test Scripts

Run comprehensive tests:
```powershell
cd backend
node test-projects-api.js          # Basic functionality
node test-comprehensive.js         # Advanced features
node test-user-perspectives.js     # User workflows
```

---

## 📖 Full Documentation

- **API Docs**: `PROJECTS_API_DOCS.md`
- **Phase 1 Summary**: `PHASE1_SUMMARY.md`
- **Test Results**: `TEST_RESULTS.md`

---

## 🎓 Example Workflow

### Creating a Complete Project

```powershell
# 1. Login
$login = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body (@{email="your@email.com"; password="YourPass"} | ConvertTo-Json) -ContentType "application/json"
$token = $login.data.token
$headers = @{ Authorization = "Bearer $token" }

# 2. Create Project
$project = Invoke-RestMethod -Uri "http://localhost:5000/api/projects" -Method Post -Headers $headers -Body (@{name="Website Redesign"; budget=25000} | ConvertTo-Json) -ContentType "application/json"
$pid = $project.data.project.id

# 3. Create Tasks
Invoke-RestMethod -Uri "http://localhost:5000/api/tasks" -Method Post -Headers $headers -Body (@{project_id=$pid; title="Design mockups"; priority="high"} | ConvertTo-Json) -ContentType "application/json"
Invoke-RestMethod -Uri "http://localhost:5000/api/tasks" -Method Post -Headers $headers -Body (@{project_id=$pid; title="Frontend development"; priority="medium"} | ConvertTo-Json) -ContentType "application/json"
Invoke-RestMethod -Uri "http://localhost:5000/api/tasks" -Method Post -Headers $headers -Body (@{project_id=$pid; title="Backend API"; priority="high"} | ConvertTo-Json) -ContentType "application/json"

# 4. View Project
Invoke-RestMethod -Uri "http://localhost:5000/api/projects/$pid" -Headers $headers
```

---

## 🚨 Troubleshooting

### "No token provided"
- Make sure you're logged in and using the `$headers` with Authorization

### "Access denied"
- Check your user role - you might not have permission for that action

### "Assigned user is not a member of this project"
- Add the user to the project first using the team member endpoint

### "Project not found"
- Verify the project ID is correct
- Check if you have access to that project (non-admins only see their projects)

---

## 💡 Tips

1. **Always check statistics** - Use project details to see progress
2. **Filter your tasks** - Use status and priority filters in My Tasks
3. **Add comments** - Keep team updated with task comments
4. **Track time** - Log actual_hours to measure efficiency
5. **Use priorities** - Helps with automatic task sorting

---

## 🌟 Happy Project Managing!

For questions or issues, refer to the full documentation or test scripts for examples.
