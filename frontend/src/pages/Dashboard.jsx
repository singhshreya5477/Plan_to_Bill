import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiFolder, 
  FiClock, 
  FiAlertCircle, 
  FiDollarSign,
  FiPlus,
  FiTrendingUp,
  FiGrid,
  FiList,
  FiCalendar,
  FiUsers,
  FiTarget
} from 'react-icons/fi';
import KPICard from '../components/dashboard/KPICard';
import ProjectCard from '../components/dashboard/ProjectCard';
import TopMenu from '../components/navigation/TopMenu';
import UserAvatars from '../components/navigation/UserAvatars';
import dashboardService from '../services/dashboardService';
import { useAuthStore } from '../store/authStore';

const Dashboard = () => {
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'list'
  const [activeTab, setActiveTab] = useState('project'); // 'project', 'tasks', 'settings'
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    activeProjects: 0,
    hoursTracked: 0,
    overdueItems: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useAuthStore((state) => state.user);

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch stats and projects in parallel
        const [statsResponse, projectsResponse] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getProjects()
        ]);

        if (statsResponse.success) {
          setStats(statsResponse.data);
        }

        if (projectsResponse.success) {
          setProjects(projectsResponse.data);
        }
      } catch (err) {
        console.error('Dashboard error:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Keep mock data as fallback
  useEffect(() => {
    if (projects.length === 0 && !loading) {
      const mockProjects = [
      {
        id: 1,
        name: 'RD Services',
        client: 'Digital Solutions',
        status: 'in_progress',
        progress: 65,
        budget: 100000,
        spent: 45000,
        revenue: 40000,
        deadline: '21/03/22',
        manager: 'drashti pateliya',
        team: ['Alice', 'Bob', 'Charlie'],
        description: 'Customer service and support platform',
        color: '#a855f7',
        coverImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400&h=200&fit=crop',
        tags: ['Service', 'Customer Care'],
        priority: 2,
        images: 3,
        tasks: 10,
        metrics: { range: '0-10' },
        assignee: { name: 'mr', avatar: 'MR' }
      },
      {
        id: 2,
        name: 'RD Sales',
        client: 'Creative Agency',
        status: 'in_progress',
        progress: 42,
        budget: 85000,
        spent: 38000,
        revenue: 35000,
        deadline: '21/03/22',
        manager: 'drashti pateliya',
        team: ['David', 'Emma'],
        description: 'Sales automation and CRM system',
        color: '#f43f5e',
        coverImage: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=200&fit=crop',
        tags: ['Help', 'Payments', 'UI'],
        priority: 3,
        images: 3,
        tasks: 300,
        metrics: { range: '0-10' },
        assignee: { name: 'as', avatar: 'AS' }
      },
      {
        id: 3,
        name: 'RD Upgrade',
        client: 'Tech Innovations',
        status: 'in_progress',
        progress: 15,
        budget: 150000,
        spent: 120000,
        revenue: 110000,
        deadline: '21/03/22',
        manager: 'rizz_lord',
        team: ['Frank', 'Grace', 'Henry'],
        description: 'Platform migration and upgrade project',
        color: '#06b6d4',
        coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop',
        tags: ['Upgrade', 'Migration'],
        priority: 1,
        images: 3,
        tasks: 0,
        metrics: { range: '0-10' },
        assignee: { name: 'jd', avatar: 'JD' }
      },
      {
        id: 4,
        name: 'RD Marketing',
        client: 'Acme Corp',
        status: 'planned',
        progress: 88,
        budget: 100000,
        spent: 15000,
        revenue: 0,
        deadline: '15/04/22',
        manager: 'John Doe',
        team: ['Alice', 'Bob', 'Charlie'],
        description: 'Digital marketing and campaigns',
        color: '#fb923c',
        coverImage: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=400&h=200&fit=crop',
        tags: ['Marketing', 'Campaign'],
        priority: 2,
        images: 2,
        tasks: 25,
        metrics: { range: '0-10' },
        assignee: { name: 'sk', avatar: 'SK' }
      },
      {
        id: 5,
        name: 'RD Analytics',
        client: 'TechStart Inc',
        status: 'planned',
        progress: 55,
        budget: 250000,
        spent: 25000,
        revenue: 0,
        deadline: '10/06/22',
        manager: 'Jane Smith',
        team: ['David', 'Emma'],
        description: 'Business intelligence and reporting',
        color: '#14b8a6',
        coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop',
        tags: ['Analytics', 'BI'],
        priority: 2,
        images: 4,
        tasks: 35,
        metrics: { range: '0-10' },
        assignee: { name: 'lm', avatar: 'LM' }
      },
      {
        id: 6,
        name: 'RD Mobile',
        client: 'ShopNow',
        status: 'on_hold',
        progress: 30,
        budget: 180000,
        spent: 72000,
        revenue: 60000,
        deadline: '20/07/22',
        manager: 'Mike Johnson',
        team: ['Frank', 'Grace', 'Henry', 'Ivy'],
        description: 'Mobile app development',
        color: '#6366f1',
        coverImage: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=200&fit=crop',
        tags: ['Mobile', 'App Dev'],
        priority: 3,
        images: 3,
        tasks: 50,
        metrics: { range: '0-10' },
        assignee: { name: 'tm', avatar: 'TM' }
      }
    ];
      setProjects(mockProjects);
    }
  }, [projects.length, loading]);

  const filteredProjects = filter === 'all' 
    ? projects 
    : projects.filter(p => p.status === filter);

  const kpiData = {
    activeProjects: stats.activeProjects || projects.filter(p => p.status === 'active' || p.status === 'in_progress').length,
    delayedTasks: stats.overdueItems || 12,
    hoursLogged: stats.hoursTracked || 1240,
    revenueEarned: stats.totalRevenue || projects.reduce((sum, p) => sum + (p.revenue || 0), 0)
  };

  // Mock user avatars for header with vibrant colors
  const userAvatars = [
    { id: 1, name: 'Alice', initial: 'A', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 2, name: 'Bob', initial: 'B', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { id: 3, name: 'Alex', initial: 'A', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { id: 4, name: 'Rachel', initial: 'R', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { id: 5, name: 'Mike', initial: 'M', color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
    { id: 6, name: 'Beth', initial: 'B', color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
    { id: 7, name: 'Sam', initial: 'S', color: 'linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)' }
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 mx-auto mb-4" style={{ color: '#6D28D9' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg font-medium" style={{ color: '#2b2540' }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <FiAlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2" style={{ color: '#2b2540' }}>Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 rounded-lg text-white font-medium"
            style={{ background: 'linear-gradient(90deg,#6D28D9,#8B5CF6)' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 shadow-xl animate-slide-up">
        <div className="absolute inset-0 gradient-bg-primary opacity-90"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.name || user?.firstName || 'User'}! 👋
            </h1>
            <p className="text-white/80 text-sm">
              Here's what's happening with your projects today
            </p>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-white/90 text-sm font-medium">All Systems Operational</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between p-4 rounded-xl animate-slide-up hover-lift relative overflow-hidden shadow-lg" 
        style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}>
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0 gradient-bg-primary"></div>
        </div>
        
        <div className="relative z-10 flex items-center flex-1">
          {/* Navigation Menu */}
          <TopMenu />
        </div>

        {/* User Avatars */}
        <div className="ml-4 relative z-10">
          <UserAvatars users={userAvatars} maxVisible={7} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="animate-slide-up delay-100">
          <KPICard
            title="Active Projects"
            value={kpiData.activeProjects}
            icon={FiFolder}
            color="blue"
            trend="+12%"
          />
        </div>
        <div className="animate-slide-up delay-200">
          <KPICard
            title="Delayed Tasks"
            value={kpiData.delayedTasks}
            icon={FiAlertCircle}
            color="red"
            trend="-5%"
          />
        </div>
        <div className="animate-slide-up delay-300">
          <KPICard
            title="Hours Logged"
            value={kpiData.hoursLogged}
            icon={FiClock}
            color="green"
            trend="+8%"
          />
        </div>
        <div className="animate-slide-up delay-400">
          <KPICard
            title="Revenue Earned"
            value={`₹${(kpiData.revenueEarned / 1000).toFixed(0)}K`}
            icon={FiDollarSign}
            color="purple"
            trend="+15%"
          />
        </div>
      </div>

      {/* Project View Section */}
      <div className="rounded-xl shadow-sm transition-all" 
        style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}>
        
        {/* Header with Tabs */}
        <div className="border-b" style={{ borderColor: 'rgb(var(--border))' }}>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setActiveTab('project')}
                className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
                  activeTab === 'project'
                    ? 'border-b-2'
                    : ''
                }`}
                style={activeTab === 'project' ? {
                  color: 'rgb(var(--primary))',
                  borderColor: 'rgb(var(--primary))'
                } : {
                  color: 'rgb(var(--text-secondary))'
                }}
              >
                Project
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
                  activeTab === 'tasks'
                    ? 'border-b-2'
                    : ''
                }`}
                style={activeTab === 'tasks' ? {
                  color: 'rgb(var(--primary))',
                  borderColor: 'rgb(var(--primary))'
                } : {
                  color: 'rgb(var(--text-secondary))'
                }}
              >
                Tasks
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`pb-4 px-2 text-sm font-medium transition-colors relative ${
                  activeTab === 'settings'
                    ? 'border-b-2'
                    : ''
                }`}
                style={activeTab === 'settings' ? {
                  color: 'rgb(var(--primary))',
                  borderColor: 'rgb(var(--primary))'
                } : {
                  color: 'rgb(var(--text-secondary))'
                }}
              >
                Settings
              </button>
            </div>

            <div className="flex items-center space-x-3">
              {/* View Toggle */}
              <div className="flex items-center space-x-1 rounded-lg p-1 shadow-inner" 
                style={{ backgroundColor: 'rgb(var(--bg-tertiary))' }}>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-2 rounded-md transition-all hover-scale ${
                    viewMode === 'cards' ? 'gradient-bg-blue shadow-md' : ''
                  }`}
                  style={viewMode === 'cards' ? {
                    color: 'white'
                  } : {
                    color: 'rgb(var(--text-tertiary))'
                  }}
                  title="Cards View"
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all hover-scale ${
                    viewMode === 'list' ? 'gradient-bg-blue shadow-md' : ''
                  }`}
                  style={viewMode === 'list' ? {
                    color: 'white'
                  } : {
                    color: 'rgb(var(--text-tertiary))'
                  }}
                  title="List View"
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>

              {/* New Project Button */}
              <button className="btn-primary flex items-center px-4 py-2 hover-lift group animate-pulse-glow">
                <FiPlus className="mr-2 transition-transform group-hover:rotate-90" />
                <span>New</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {activeTab === 'project' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-2 animate-slide-in-right">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap hover-scale shadow-sm ${
                    filter === 'all' ? 'gradient-bg-primary text-white shadow-md' : ''
                  }`}
                  style={filter === 'all' ? {} : {
                    backgroundColor: 'rgb(var(--bg-tertiary))',
                    color: 'rgb(var(--text-secondary))'
                  }}
                >
                  All Projects
                </button>
                <button
                  onClick={() => setFilter('in_progress')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    filter === 'in_progress' ? 'shadow-sm' : ''
                  }`}
                  style={filter === 'in_progress' ? {
                    backgroundColor: 'rgb(var(--primary))',
                    color: 'white'
                  } : {
                    backgroundColor: 'rgb(var(--bg-tertiary))',
                    color: 'rgb(var(--text-secondary))'
                  }}
                >
                  In Progress
                </button>
                <button
                  onClick={() => setFilter('planned')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    filter === 'planned' ? 'shadow-sm' : ''
                  }`}
                  style={filter === 'planned' ? {
                    backgroundColor: 'rgb(var(--primary))',
                    color: 'white'
                  } : {
                    backgroundColor: 'rgb(var(--bg-tertiary))',
                    color: 'rgb(var(--text-secondary))'
                  }}
                >
                  Planned
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    filter === 'completed' ? 'shadow-sm' : ''
                  }`}
                  style={filter === 'completed' ? {
                    backgroundColor: 'rgb(var(--primary))',
                    color: 'white'
                  } : {
                    backgroundColor: 'rgb(var(--bg-tertiary))',
                    color: 'rgb(var(--text-secondary))'
                  }}
                >
                  Completed
                </button>
                <button
                  onClick={() => setFilter('on_hold')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    filter === 'on_hold' ? 'shadow-sm' : ''
                  }`}
                  style={filter === 'on_hold' ? {
                    backgroundColor: 'rgb(var(--primary))',
                    color: 'white'
                  } : {
                    backgroundColor: 'rgb(var(--bg-tertiary))',
                    color: 'rgb(var(--text-secondary))'
                  }}
                >
                  On Hold
                </button>
              </div>

              {/* Projects Display */}
              {filteredProjects.length === 0 ? (
                <div className="text-center py-12">
                  <FiFolder className="mx-auto h-12 w-12 mb-4" 
                    style={{ color: 'rgb(var(--text-tertiary))' }} />
                  <h3 className="text-lg font-medium mb-2" 
                    style={{ color: 'rgb(var(--text-primary))' }}>
                    No projects found
                  </h3>
                  <p className="mb-6" style={{ color: 'rgb(var(--text-secondary))' }}>
                    {filter === 'all' 
                      ? "Get started by creating your first project"
                      : `No projects with status "${filter.replace('_', ' ')}"`
                    }
                  </p>
                  <button className="btn-primary inline-flex items-center">
                    <FiPlus className="mr-2" />
                    Create Project
                  </button>
                </div>
              ) : viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProjects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                /* List View */
                <div className="space-y-3">
                  {filteredProjects.map(project => (
                    <Link
                      key={project.id}
                      to={`/projects/${project.id}`}
                      className="flex items-center p-4 rounded-xl transition-all hover:shadow-md"
                      style={{ backgroundColor: 'rgb(var(--bg-tertiary))' }}
                    >
                      <div 
                        className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: project.color }}
                      >
                        {project.name.charAt(0)}
                      </div>
                      <div className="flex-1 ml-4">
                        <h3 className="font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>
                          {project.name}
                        </h3>
                        <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                          {project.description} • {project.manager}
                        </p>
                      </div>
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="text-center">
                          <div className="text-xs" style={{ color: 'rgb(var(--text-tertiary))' }}>
                            Progress
                          </div>
                          <div className="font-medium" style={{ color: 'rgb(var(--text-primary))' }}>
                            {project.progress}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs" style={{ color: 'rgb(var(--text-tertiary))' }}>
                            Budget
                          </div>
                          <div className="font-medium" style={{ color: 'rgb(var(--text-primary))' }}>
                            ₹{(project.budget / 1000).toFixed(0)}K
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs" style={{ color: 'rgb(var(--text-tertiary))' }}>
                            Deadline
                          </div>
                          <div className="font-medium" style={{ color: 'rgb(var(--text-primary))' }}>
                            {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="text-center py-12">
              <FiAlertCircle className="mx-auto h-12 w-12 mb-4" 
                style={{ color: 'rgb(var(--text-tertiary))' }} />
              <h3 className="text-lg font-medium mb-2" 
                style={{ color: 'rgb(var(--text-primary))' }}>
                Task Management
              </h3>
              <p className="mb-6" style={{ color: 'rgb(var(--text-secondary))' }}>
                View and manage tasks across all projects
              </p>
              <Link to="/tasks" className="btn-primary inline-flex items-center">
                View All Tasks
              </Link>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="text-center py-12">
              <FiFolder className="mx-auto h-12 w-12 mb-4" 
                style={{ color: 'rgb(var(--text-tertiary))' }} />
              <h3 className="text-lg font-medium mb-2" 
                style={{ color: 'rgb(var(--text-primary))' }}>
                Project Settings
              </h3>
              <p className="mb-6" style={{ color: 'rgb(var(--text-secondary))' }}>
                Configure default project settings and preferences
              </p>
              <Link to="/settings" className="btn-primary inline-flex items-center">
                Go to Settings
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
