import { NavLink, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiFolder, 
  FiCheckSquare, 
  FiBarChart2, 
  FiClock,
  FiSettings,
  FiUser,
  FiDollarSign,
  FiShoppingCart,
  FiFileText,
  FiCreditCard,
  FiTrendingUp,
  FiUsers
} from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';

const Sidebar = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', icon: FiHome, path: '/dashboard', roles: ['all'] },
    { name: 'Projects', icon: FiFolder, path: '/projects', roles: ['all'] },
    { name: 'Tasks', icon: FiCheckSquare, path: '/tasks', roles: ['all'] },
    { name: 'Analytics', icon: FiBarChart2, path: '/analytics', roles: ['all'] },
    { name: 'Timesheets', icon: FiClock, path: '/timesheets', roles: ['all'] },
  ];

  const settingsNavigation = [
    { name: 'Sales Orders', icon: FiTrendingUp, path: '/sales-orders', roles: ['admin', 'project_manager', 'sales'] },
    { name: 'Purchase Orders', icon: FiShoppingCart, path: '/purchase-orders', roles: ['admin', 'project_manager', 'sales'] },
    { name: 'Customer Invoices', icon: FiFileText, path: '/customer-invoices', roles: ['admin', 'project_manager', 'finance'] },
    { name: 'Vendor Bills', icon: FiCreditCard, path: '/vendor-bills', roles: ['admin', 'project_manager', 'finance'] },
    { name: 'Expenses', icon: FiDollarSign, path: '/expenses', roles: ['all'] },
  ];

  const bottomNavigation = [
    { name: 'User Management', icon: FiUsers, path: '/admin/users', roles: ['admin'] },
    { name: 'Profile', icon: FiUser, path: '/profile', roles: ['all'] },
    { name: 'Settings', icon: FiSettings, path: '/settings', roles: ['admin'] },
  ];

  const hasAccess = (roles) => {
    if (roles.includes('all')) return true;
    return roles.includes(user?.role?.toLowerCase());
  };

  return (
    <div className="w-64 flex flex-col transition-all relative overflow-hidden" style={{ 
      backgroundColor: 'rgb(var(--sidebar-bg))', 
      color: 'rgb(var(--sidebar-text))' 
    }}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-purple-500 to-transparent blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-full h-64 bg-gradient-to-t from-blue-500 to-transparent blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      {/* Cyber grid background */}
      <div className="absolute inset-0 cyber-grid opacity-5 pointer-events-none"></div>
      
      {/* Logo */}
      <div className="p-6 border-b transition-colors relative z-10 group" style={{ borderColor: 'rgb(var(--border-color))' }}>
        <div className="relative">
          {/* Glowing background on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-10 blur-xl transition-opacity rounded-lg"></div>
          
          <h1 className="text-2xl font-black relative inline-block holographic group-hover:scale-105 transition-transform">
            OneFlow
          </h1>
          
          {/* Animated underline */}
          <div className="h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-gradient-to-r from-purple-500 to-blue-500 mt-1"></div>
        </div>
        <p className="text-xs mt-2 transition-all group-hover:translate-x-1" style={{ color: 'rgb(var(--text-tertiary))' }}>
          Plan to Bill in One Place
        </p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 relative z-10">
        <div className="px-3 space-y-1">
          {navigation.filter(item => hasAccess(item.roles)).map((item, idx) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all group relative overflow-hidden animate-slide-in-right ${
                  isActive ? 'text-white shadow-lg' : 'hover:translate-x-1'
                }`
              }
              style={({ isActive }) => ({
                backgroundColor: isActive ? 'rgb(var(--primary))' : 'transparent',
                color: isActive ? 'white' : 'rgb(var(--sidebar-text))',
                animationDelay: `${idx * 100}ms`,
                boxShadow: isActive ? '0 4px 15px rgba(var(--primary), 0.4)' : 'none'
              })}
            >
              {/* Hover gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              {/* Active indicator bar */}
              {location.pathname === item.path && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-white/0 via-white to-white/0 animate-pulse"></div>
              )}
              
              <item.icon className="mr-3 h-5 w-5 group-hover:scale-110 group-hover:rotate-6 transition-all relative z-10" />
              <span className="relative z-10 group-hover:font-semibold transition-all">{item.name}</span>
              
              {/* Shimmer on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </div>
            </NavLink>
          ))}
        </div>

        {/* Settings Section */}
        <div className="mt-8 px-3">
          <h3 className="px-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgb(var(--text-tertiary))' }}>
            Financial
          </h3>
          <div className="mt-2 space-y-1">
            {settingsNavigation.filter(item => hasAccess(item.roles)).map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActive ? 'text-white' : ''
                  }`
                }
                style={({ isActive }) => ({
                  backgroundColor: isActive ? 'rgb(var(--primary))' : 'transparent',
                  color: isActive ? 'white' : 'rgb(var(--sidebar-text))'
                })}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="p-3 border-t transition-colors" style={{ borderColor: 'rgb(var(--border-color))' }}>
        {bottomNavigation.filter(item => hasAccess(item.roles)).map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                isActive ? 'text-white' : ''
              }`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? 'rgb(var(--primary))' : 'transparent',
              color: isActive ? 'white' : 'rgb(var(--sidebar-text))'
            })}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </div>

      {/* User Info */}
      <div className="p-4 transition-all" style={{ backgroundColor: 'rgb(var(--sidebar-hover))' }}>
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold" 
            style={{ backgroundColor: 'rgb(var(--primary))' }}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium" style={{ color: 'rgb(var(--sidebar-text))' }}>
              {user?.name || 'User'}
            </p>
            <p className="text-xs capitalize" style={{ color: 'rgb(var(--text-tertiary))' }}>
              {user?.role || 'Team Member'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
