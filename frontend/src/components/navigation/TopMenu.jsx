import { Link, useLocation } from 'react-router-dom';
import { 
  FiCheckSquare, 
  FiShoppingCart, 
  FiFileText, 
  FiShoppingBag,
  FiDollarSign,
  FiPackage,
  FiTrendingDown
} from 'react-icons/fi';

/**
 * TopMenu Component
 * Main navigation menu with 8 items as specified:
 * - My Tasks, All Tasks, Sales order, Invoice, 
 *   Purchase order, Vendor bills, Products, Expenses
 */
const TopMenu = () => {
  const location = useLocation();

  const menuItems = [
    { 
      id: 'my-tasks', 
      label: 'My Tasks', 
      path: '/my-tasks',
      icon: FiCheckSquare
    },
    { 
      id: 'all-tasks', 
      label: 'All Tasks', 
      path: '/tasks',
      icon: FiCheckSquare
    },
    { 
      id: 'sales-orders', 
      label: 'Sales Order', 
      path: '/sales-orders',
      icon: FiShoppingCart
    },
    { 
      id: 'invoices', 
      label: 'Invoice', 
      path: '/customer-invoices',
      icon: FiFileText
    },
    { 
      id: 'purchase-orders', 
      label: 'Purchase Order', 
      path: '/purchase-orders',
      icon: FiShoppingBag
    },
    { 
      id: 'vendor-bills', 
      label: 'Vendor Bills', 
      path: '/vendor-bills',
      icon: FiDollarSign
    },
    { 
      id: 'products', 
      label: 'Products', 
      path: '/products',
      icon: FiPackage
    },
    { 
      id: 'expenses', 
      label: 'Expenses', 
      path: '/expenses',
      icon: FiTrendingDown
    }
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="flex items-center space-x-1 overflow-x-auto">
      {menuItems.map((item, index) => {
        const Icon = item.icon;
        const active = isActive(item.path);

        return (
          <Link
            key={item.id}
            to={item.path}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all hover:opacity-90 hover-scale group animate-fade-in shadow-sm ${
              active ? 'gradient-bg-primary text-white' : ''
            }`}
            style={{
              ...(!active ? { 
                backgroundColor: 'rgb(var(--bg-tertiary))',
                color: 'rgb(var(--text-secondary))'
              } : {}),
              animationDelay: `${index * 0.05}s`
            }}
          >
            <Icon className="w-4 h-4 transition-transform group-hover:rotate-12 group-hover:scale-110" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default TopMenu;
