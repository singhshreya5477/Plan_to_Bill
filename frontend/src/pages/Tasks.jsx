import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiFilter, FiSearch, FiGrid, FiList, FiPlus, FiCalendar, FiUser, FiMoreVertical, FiAlertCircle, FiX, FiEdit2, FiTrash2 } from 'react-icons/fi';
import ViewsDropdown from '../components/navigation/ViewsDropdown';
import TaskCard from '../components/tasks/TaskCard';
import KanbanColumn from '../components/tasks/KanbanColumn';
import taskService from '../services/taskService';

const Tasks = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null); // Track which task menu is open
  const [editingTask, setEditingTask] = useState(null); // Track task being edited
  const [editFormData, setEditFormData] = useState({ title: '', description: '' });

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openMenuId) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openMenuId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await taskService.getMyTasks();
      
      console.log('Fetch tasks response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', response ? Object.keys(response) : 'null');
      
      if (response && response.success && response.data && response.data.tasks) {
        console.log('Raw tasks from API:', response.data.tasks);
        console.log('Number of tasks:', response.data.tasks.length);
        
        // Map backend data to frontend format
        const mappedTasks = response.data.tasks.map(t => {
          const mapped = {
            id: t.id,
            title: t.title,
            project: t.project_name || 'Unknown Project',
            projectColor: getProjectColor(t.project_id),
            status: mapStatus(t.status),
            priority: t.priority || 'medium',
            assignee: t.assigned_to_name || 'Unassigned',
            dueDate: t.due_date || '',
            description: t.description || '',
            images: 0
          };
          console.log('Mapped task:', t.title, '- Backend status:', t.status, '→ Frontend status:', mapped.status);
          return mapped;
        });
        
        console.log('Mapped tasks:', mappedTasks);
        console.log('Setting tasks state with', mappedTasks.length, 'tasks');
        setTasks(mappedTasks);
      } else {
        console.error('Invalid response format:', response);
        setError('Invalid response format from server');
      }
    } catch (err) {
      console.error('Fetch tasks error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Map backend status to frontend status
  const mapStatus = (status) => {
    const statusMap = {
      'todo': 'new',
      'in_progress': 'in_progress',
      'review': 'in_progress',
      'done': 'done'
    };
    return statusMap[status] || 'new';
  };

  // Map backend status back for API
  const mapStatusToBackend = (status) => {
    const statusMap = {
      'new': 'todo',
      'in_progress': 'in_progress',
      'done': 'done'
    };
    return statusMap[status] || 'todo';
  };

  // Get project color (you can enhance this with real project data)
  const getProjectColor = (projectId) => {
    const colors = ['#9333ea', '#ec4899', '#3b82f6', '#f59e0b', '#10b981', '#06b6d4'];
    return colors[projectId % colors.length] || '#6D28D9';
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('taskId'));
    
    // Optimistic update
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));

    try {
      // Update task status via API
      const backendStatus = mapStatusToBackend(newStatus);
      await taskService.updateTask(taskId, { status: backendStatus });
    } catch (err) {
      console.error('Update task status error:', err);
      // Revert on error
      fetchTasks();
      setError('Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId, taskTitle) => {
    if (!confirm(`Are you sure you want to delete "${taskTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // Optimistically remove from UI
      setTasks(tasks.filter(task => task.id !== taskId));
      setOpenMenuId(null);
      
      await taskService.deleteTask(taskId);
    } catch (err) {
      console.error('Delete task error:', err);
      setError('Failed to delete task');
      // Revert on error
      fetchTasks();
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setEditFormData({
      title: task.title,
      description: task.description
    });
    setOpenMenuId(null);
  };

  const handleSaveEdit = async () => {
    if (!editFormData.title.trim()) {
      alert('Task title is required');
      return;
    }

    try {
      await taskService.updateTask(editingTask.id, editFormData);
      
      // Update local state
      setTasks(tasks.map(task => 
        task.id === editingTask.id 
          ? { ...task, ...editFormData }
          : task
      ));
      
      setEditingTask(null);
      setEditFormData({ title: '', description: '' });
    } catch (err) {
      console.error('Update task error:', err);
      setError('Failed to update task');
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setEditFormData({ title: '', description: '' });
  };

  const toggleMenu = (taskId) => {
    setOpenMenuId(openMenuId === taskId ? null : taskId);
  };

  const getTasksByStatus = (status) => {
    const filtered = tasks.filter(task => task.status === status);
    console.log(`getTasksByStatus('${status}'):`, {
      totalTasks: tasks.length,
      allTasksStatuses: tasks.map(t => ({ id: t.id, title: t.title, status: t.status })),
      filtered: filtered.length,
      filteredTasks: filtered.map(t => ({ id: t.id, title: t.title, status: t.status }))
    });
    return filtered;
  };

  const priorityColors = {
    low: '#3b82f6',
    medium: '#f59e0b',
    high: '#ef4444'
  };

  return (
    <div className="space-y-6">
      {/* Tasks View Section */}
      <div className="rounded-xl shadow-sm transition-all" 
        style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}>
        
        {/* Header with Tabs */}
        <div className="border-b" style={{ borderColor: 'rgb(var(--border))' }}>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-6">
              <Link
                to="/projects"
                className={`pb-4 px-2 text-sm font-medium transition-colors relative`}
                style={{ color: 'rgb(var(--text-secondary))' }}
              >
                Project
              </Link>
              <button
                className={`pb-4 px-2 text-sm font-medium transition-colors relative border-b-2`}
                style={{
                  color: 'rgb(var(--primary))',
                  borderColor: 'rgb(var(--primary))'
                }}
              >
                Tasks
              </button>
              <Link
                to="/settings"
                className={`pb-4 px-2 text-sm font-medium transition-colors relative`}
                style={{ color: 'rgb(var(--text-secondary))' }}
              >
                Settings
              </Link>
            </div>

            <div className="flex items-center space-x-3">
              {/* Views Dropdown */}
              <ViewsDropdown 
                viewMode={viewMode} 
                onChange={setViewMode}
              />

              {/* New Task Button */}
              <Link to="/tasks/create" className="btn-primary flex items-center px-4 py-2">
                <FiPlus className="mr-2" />
                New
              </Link>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
              <FiAlertCircle className="text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <FiX />
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin h-8 w-8" style={{ color: '#6D28D9' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : viewMode === 'kanban' ? (
            /* Kanban Board View */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* New Column */}
              <div 
                className="rounded-xl p-4 min-h-[600px]"
                style={{ backgroundColor: 'rgb(var(--bg-tertiary))' }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'new')}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg" style={{ color: 'rgb(var(--text-primary))' }}>
                    New
                  </h3>
                  <span className="text-sm px-2 py-1 rounded-full" 
                    style={{ 
                      backgroundColor: 'rgb(var(--bg-secondary))',
                      color: 'rgb(var(--text-secondary))'
                    }}>
                    {getTasksByStatus('new').length}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {getTasksByStatus('new').map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="rounded-lg p-4 cursor-move hover:shadow-lg transition-all relative group"
                      style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}
                    >
                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(task.id, task.title);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                        title="Delete task"
                      >
                        <FiX className="w-4 h-4" />
                      </button>

                      {/* Task Card Header */}
                      <div 
                        className="h-24 rounded-lg mb-3 p-3"
                        style={{ backgroundColor: task.projectColor }}
                      >
                        <div className="text-white text-sm font-medium mb-2">
                          {task.project}
                        </div>
                        <div className="flex space-x-2">
                          {[...Array(task.images)].map((_, idx) => (
                            <div 
                              key={idx}
                              className="w-8 h-8 rounded bg-white/20 backdrop-blur-sm"
                            />
                          ))}
                        </div>
                      </div>

                      {/* Task Info */}
                      <h4 className="font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                        {task.title}
                      </h4>
                      <p className="text-sm mb-3" style={{ color: 'rgb(var(--text-secondary))' }}>
                        {task.description}
                      </p>

                      {/* Task Meta */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2" 
                          style={{ color: 'rgb(var(--text-secondary))' }}>
                          <FiUser className="w-4 h-4" />
                          <span>{task.assignee}</span>
                        </div>
                        <div className="flex items-center space-x-2" 
                          style={{ color: 'rgb(var(--text-secondary))' }}>
                          <FiCalendar className="w-4 h-4" />
                          <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>

                      {/* Priority Indicator */}
                      <div className="mt-3 pt-3 border-t flex items-center justify-between" 
                        style={{ borderColor: 'rgb(var(--border))' }}>
                        <div className="flex items-center space-x-1">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: priorityColors[task.priority] }}
                          />
                          <span className="text-xs capitalize" style={{ color: 'rgb(var(--text-tertiary))' }}>
                            {task.priority} priority
                          </span>
                        </div>
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMenu(task.id);
                            }}
                            className="p-1 hover:opacity-70" 
                            style={{ color: 'rgb(var(--text-tertiary))' }}
                          >
                            <FiMoreVertical className="w-4 h-4" />
                          </button>
                          
                          {/* Dropdown Menu */}
                          {openMenuId === task.id && (
                            <div 
                              className="absolute right-0 bottom-full mb-2 w-32 rounded-lg shadow-lg border overflow-hidden z-20"
                              style={{ 
                                backgroundColor: 'rgb(var(--bg-secondary))',
                                borderColor: 'rgb(var(--border))'
                              }}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditTask(task);
                                }}
                                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:opacity-70 transition-colors"
                                style={{ color: 'rgb(var(--text-primary))' }}
                              >
                                <FiEdit2 className="w-4 h-4" />
                                Edit
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTask(task.id, task.title);
                                }}
                                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-red-500 hover:text-white transition-colors"
                                style={{ color: '#ef4444' }}
                              >
                                <FiTrash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* In Progress Column */}
              <div 
                className="rounded-xl p-4 min-h-[600px]"
                style={{ backgroundColor: 'rgb(var(--bg-tertiary))' }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'in_progress')}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg" style={{ color: 'rgb(var(--text-primary))' }}>
                    In Progress
                  </h3>
                  <span className="text-sm px-2 py-1 rounded-full" 
                    style={{ 
                      backgroundColor: 'rgb(var(--bg-secondary))',
                      color: 'rgb(var(--text-secondary))'
                    }}>
                    {getTasksByStatus('in_progress').length}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {getTasksByStatus('in_progress').map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="rounded-lg p-4 cursor-move hover:shadow-lg transition-all relative group"
                      style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}
                    >
                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(task.id, task.title);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                        title="Delete task"
                      >
                        <FiX className="w-4 h-4" />
                      </button>

                      <div 
                        className="h-24 rounded-lg mb-3 p-3"
                        style={{ backgroundColor: task.projectColor }}
                      >
                        <div className="text-white text-sm font-medium mb-2">
                          {task.project}
                        </div>
                        <div className="flex space-x-2">
                          {[...Array(task.images)].map((_, idx) => (
                            <div 
                              key={idx}
                              className="w-8 h-8 rounded bg-white/20 backdrop-blur-sm"
                            />
                          ))}
                        </div>
                      </div>

                      <h4 className="font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                        {task.title}
                      </h4>
                      <p className="text-sm mb-3" style={{ color: 'rgb(var(--text-secondary))' }}>
                        {task.description}
                      </p>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2" 
                          style={{ color: 'rgb(var(--text-secondary))' }}>
                          <FiUser className="w-4 h-4" />
                          <span>{task.assignee}</span>
                        </div>
                        <div className="flex items-center space-x-2" 
                          style={{ color: 'rgb(var(--text-secondary))' }}>
                          <FiCalendar className="w-4 h-4" />
                          <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t flex items-center justify-between" 
                        style={{ borderColor: 'rgb(var(--border))' }}>
                        <div className="flex items-center space-x-1">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: priorityColors[task.priority] }}
                          />
                          <span className="text-xs capitalize" style={{ color: 'rgb(var(--text-tertiary))' }}>
                            {task.priority} priority
                          </span>
                        </div>
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMenu(task.id);
                            }}
                            className="p-1 hover:opacity-70" 
                            style={{ color: 'rgb(var(--text-tertiary))' }}
                          >
                            <FiMoreVertical className="w-4 h-4" />
                          </button>
                          
                          {/* Dropdown Menu */}
                          {openMenuId === task.id && (
                            <div 
                              className="absolute right-0 bottom-full mb-2 w-32 rounded-lg shadow-lg border overflow-hidden z-20"
                              style={{ 
                                backgroundColor: 'rgb(var(--bg-secondary))',
                                borderColor: 'rgb(var(--border))'
                              }}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditTask(task);
                                }}
                                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:opacity-70 transition-colors"
                                style={{ color: 'rgb(var(--text-primary))' }}
                              >
                                <FiEdit2 className="w-4 h-4" />
                                Edit
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTask(task.id, task.title);
                                }}
                                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-red-500 hover:text-white transition-colors"
                                style={{ color: '#ef4444' }}
                              >
                                <FiTrash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Done Column */}
              <div 
                className="rounded-xl p-4 min-h-[600px]"
                style={{ backgroundColor: 'rgb(var(--bg-tertiary))' }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'done')}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg" style={{ color: 'rgb(var(--text-primary))' }}>
                    Done
                  </h3>
                  <span className="text-sm px-2 py-1 rounded-full" 
                    style={{ 
                      backgroundColor: 'rgb(var(--bg-secondary))',
                      color: 'rgb(var(--text-secondary))'
                    }}>
                    {getTasksByStatus('done').length}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {getTasksByStatus('done').map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task.id)}
                      className="rounded-lg p-4 cursor-move hover:shadow-lg transition-all relative group"
                      style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}
                    >
                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(task.id, task.title);
                        }}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                        title="Delete task"
                      >
                        <FiX className="w-4 h-4" />
                      </button>

                      <div 
                        className="h-24 rounded-lg mb-3 p-3"
                        style={{ backgroundColor: task.projectColor }}
                      >
                        <div className="text-white text-sm font-medium mb-2">
                          {task.project}
                        </div>
                        <div className="flex space-x-2">
                          {[...Array(task.images)].map((_, idx) => (
                            <div 
                              key={idx}
                              className="w-8 h-8 rounded bg-white/20 backdrop-blur-sm"
                            />
                          ))}
                        </div>
                      </div>

                      <h4 className="font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                        {task.title}
                      </h4>
                      <p className="text-sm mb-3" style={{ color: 'rgb(var(--text-secondary))' }}>
                        {task.description}
                      </p>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2" 
                          style={{ color: 'rgb(var(--text-secondary))' }}>
                          <FiUser className="w-4 h-4" />
                          <span>{task.assignee}</span>
                        </div>
                        <div className="flex items-center space-x-2" 
                          style={{ color: 'rgb(var(--text-secondary))' }}>
                          <FiCalendar className="w-4 h-4" />
                          <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t flex items-center justify-between" 
                        style={{ borderColor: 'rgb(var(--border))' }}>
                        <div className="flex items-center space-x-1">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: priorityColors[task.priority] }}
                          />
                          <span className="text-xs capitalize" style={{ color: 'rgb(var(--text-tertiary))' }}>
                            {task.priority} priority
                          </span>
                        </div>
                        <div className="relative">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMenu(task.id);
                            }}
                            className="p-1 hover:opacity-70" 
                            style={{ color: 'rgb(var(--text-tertiary))' }}
                          >
                            <FiMoreVertical className="w-4 h-4" />
                          </button>
                          
                          {/* Dropdown Menu */}
                          {openMenuId === task.id && (
                            <div 
                              className="absolute right-0 bottom-full mb-2 w-32 rounded-lg shadow-lg border overflow-hidden z-20"
                              style={{ 
                                backgroundColor: 'rgb(var(--bg-secondary))',
                                borderColor: 'rgb(var(--border))'
                              }}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditTask(task);
                                }}
                                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:opacity-70 transition-colors"
                                style={{ color: 'rgb(var(--text-primary))' }}
                              >
                                <FiEdit2 className="w-4 h-4" />
                                Edit
                              </button>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTask(task.id, task.title);
                                }}
                                className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-red-500 hover:text-white transition-colors"
                                style={{ color: '#ef4444' }}
                              >
                                <FiTrash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* List View */
            <div className="space-y-2">
              {tasks.length === 0 ? (
                <div className="text-center py-12">
                  <FiAlertCircle className="mx-auto h-12 w-12 mb-4" 
                    style={{ color: 'rgb(var(--text-tertiary))' }} />
                  <h3 className="text-lg font-medium mb-2" 
                    style={{ color: 'rgb(var(--text-primary))' }}>
                    No tasks assigned
                  </h3>
                  <p className="mb-6" style={{ color: 'rgb(var(--text-secondary))' }}>
                    You don't have any tasks assigned to you yet.
                  </p>
                  <Link to="/tasks/create" className="btn-primary inline-flex items-center">
                    <FiPlus className="mr-2" />
                    Create Task
                  </Link>
                </div>
              ) : (
                tasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center p-4 rounded-xl transition-all hover:shadow-md"
                    style={{ backgroundColor: 'rgb(var(--bg-tertiary))' }}
                  >
                    <div 
                      className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: task.projectColor }}
                    >
                      {task.project.charAt(0)}
                    </div>
                    <div className="flex-1 ml-4">
                      <h3 className="font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>
                        {task.title}
                      </h3>
                      <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                        {task.project} • {task.assignee}
                      </p>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center space-x-1">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: priorityColors[task.priority] }}
                        />
                        <span className="capitalize" style={{ color: 'rgb(var(--text-secondary))' }}>
                          {task.priority}
                        </span>
                      </div>
                      <div style={{ color: 'rgb(var(--text-secondary))' }}>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No deadline'}
                      </div>
                      <div className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: task.status === 'done' ? 'rgb(16 185 129 / 0.1)' :
                                         task.status === 'in_progress' ? 'rgb(59 130 246 / 0.1)' :
                                         'rgb(107 114 128 / 0.1)',
                          color: task.status === 'done' ? '#10b981' :
                                 task.status === 'in_progress' ? '#3b82f6' :
                                 'rgb(var(--text-secondary))'
                        }}
                      >
                        {task.status.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="rounded-xl p-6 max-w-md w-full mx-4"
            style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}
          >
            <h2 className="text-2xl font-bold mb-6" style={{ color: 'rgb(var(--text-primary))' }}>
              Edit Task
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-secondary))' }}>
                  Title
                </label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: 'rgb(var(--bg-tertiary))',
                    borderColor: 'rgb(var(--border))',
                    color: 'rgb(var(--text-primary))'
                  }}
                  placeholder="Task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-secondary))' }}>
                  Description
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border resize-none"
                  rows="4"
                  style={{
                    backgroundColor: 'rgb(var(--bg-tertiary))',
                    borderColor: 'rgb(var(--border))',
                    color: 'rgb(var(--text-primary))'
                  }}
                  placeholder="Task description"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 rounded-lg hover:opacity-70 transition-opacity"
                style={{
                  backgroundColor: 'rgb(var(--bg-tertiary))',
                  color: 'rgb(var(--text-secondary))'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="btn-primary px-4 py-2 rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
