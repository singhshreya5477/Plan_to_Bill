import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiFilter, FiSearch, FiGrid, FiList, FiPlus, FiCalendar, FiUser, FiMoreVertical } from 'react-icons/fi';
import ViewsDropdown from '../components/navigation/ViewsDropdown';
import TaskCard from '../components/tasks/TaskCard';
import KanbanColumn from '../components/tasks/KanbanColumn';

const Tasks = () => {
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Design homepage mockup',
      project: 'Super Rabbit',
      projectColor: '#9333ea',
      status: 'new',
      priority: 'high',
      assignee: 'drashti pateliya',
      dueDate: '2025-11-15',
      description: 'Create wireframes and high-fidelity mockups',
      images: 3
    },
    {
      id: 2,
      title: 'API Integration',
      project: 'Neon',
      projectColor: '#ec4899',
      status: 'new',
      priority: 'medium',
      assignee: 'drashti pateliya',
      dueDate: '2025-11-18',
      description: 'Integrate third-party APIs',
      images: 3
    },
    {
      id: 3,
      title: 'Database Schema',
      project: 'Super Rabbit',
      projectColor: '#9333ea',
      status: 'new',
      priority: 'high',
      assignee: 'rizz_lord',
      dueDate: '2025-11-20',
      description: 'Design and implement database structure',
      images: 3
    },
    {
      id: 4,
      title: 'User Authentication',
      project: 'Uncommon Hippopotamus',
      projectColor: '#3b82f6',
      status: 'in_progress',
      priority: 'high',
      assignee: 'drashti pateliya',
      dueDate: '2025-11-25',
      description: 'Implement JWT-based auth system',
      images: 3
    },
    {
      id: 5,
      title: 'Payment Gateway',
      project: 'Neon',
      projectColor: '#ec4899',
      status: 'in_progress',
      priority: 'medium',
      assignee: 'rizz_lord',
      dueDate: '2025-11-22',
      description: 'Integrate Stripe payment processing',
      images: 3
    },
    {
      id: 6,
      title: 'Mobile Responsive',
      project: 'Super Rabbit',
      projectColor: '#9333ea',
      status: 'done',
      priority: 'medium',
      assignee: 'drashti pateliya',
      dueDate: '2025-11-10',
      description: 'Make all pages mobile-friendly',
      images: 3
    },
    {
      id: 7,
      title: 'Performance Optimization',
      project: 'Uncommon Hippopotamus',
      projectColor: '#3b82f6',
      status: 'done',
      priority: 'low',
      assignee: 'rizz_lord',
      dueDate: '2025-11-12',
      description: 'Optimize loading times and bundle size',
      images: 3
    }
  ]);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('taskId'));
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
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
              <button
                onClick={() => setActiveTab('project')}
                className={`pb-4 px-2 text-sm font-medium transition-colors relative`}
                style={{ color: 'rgb(var(--text-secondary))' }}
              >
                Project
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`pb-4 px-2 text-sm font-medium transition-colors relative border-b-2`}
                style={{
                  color: 'rgb(var(--primary))',
                  borderColor: 'rgb(var(--primary))'
                }}
              >
                Tasks
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`pb-4 px-2 text-sm font-medium transition-colors relative`}
                style={{ color: 'rgb(var(--text-secondary))' }}
              >
                Settings
              </button>
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
          {viewMode === 'kanban' ? (
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
                      className="rounded-lg p-4 cursor-move hover:shadow-lg transition-all"
                      style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}
                    >
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
                        <button className="p-1 hover:opacity-70" style={{ color: 'rgb(var(--text-tertiary))' }}>
                          <FiMoreVertical className="w-4 h-4" />
                        </button>
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
                      className="rounded-lg p-4 cursor-move hover:shadow-lg transition-all"
                      style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}
                    >
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
                        <button className="p-1 hover:opacity-70" style={{ color: 'rgb(var(--text-tertiary))' }}>
                          <FiMoreVertical className="w-4 h-4" />
                        </button>
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
                      className="rounded-lg p-4 cursor-move hover:shadow-lg transition-all"
                      style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}
                    >
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
                        <button className="p-1 hover:opacity-70" style={{ color: 'rgb(var(--text-tertiary))' }}>
                          <FiMoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* List View */
            <div className="space-y-2">
              {tasks.map(task => (
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
                      {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;
