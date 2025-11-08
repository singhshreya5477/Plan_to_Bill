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
    <div className="w-64 flex flex-col transition-all" style={{ 
      backgroundColor: 'rgb(var(--sidebar-bg))', 
      color: 'rgb(var(--sidebar-text))' 
    }}>
      {/* Logo */}
      <div className="p-6 border-b transition-colors" style={{ borderColor: 'rgb(var(--border-color))' }}>
        <h1 className="text-2xl font-bold" style={{ color: 'rgb(var(--primary))' }}>OneFlow</h1>
        <p className="text-xs mt-1" style={{ color: 'rgb(var(--text-tertiary))' }}>Plan to Bill in One Place</p>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-1">
          {navigation.filter(item => hasAccess(item.roles)).map((item) => (
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
