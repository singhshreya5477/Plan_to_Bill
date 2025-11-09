import { useState, useEffect } from 'react';
import { FiFileText, FiShoppingCart, FiCreditCard, FiDollarSign } from 'react-icons/fi';
import financialService from '../../services/financialService';

const FinancialLinksBar = ({ projectId, onTabChange }) => {
  const [counts, setCounts] = useState({
    salesOrders: 0,
    purchaseOrders: 0,
    invoices: 0,
    vendorBills: 0,
    expenses: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCounts();
  }, [projectId]);

  const loadCounts = async () => {
    try {
      const [soRes, poRes, invRes, vbRes, expRes] = await Promise.all([
        financialService.getSalesOrders(projectId),
        financialService.getPurchaseOrders(projectId),
        financialService.getInvoices(projectId),
        financialService.getVendorBills(projectId),
        financialService.getExpenses(projectId)
      ]);

      setCounts({
        salesOrders: soRes.data?.length || 0,
        purchaseOrders: poRes.data?.length || 0,
        invoices: invRes.data?.invoices?.length || 0,
        vendorBills: vbRes.data?.length || 0,
        expenses: expRes.data?.length || 0
      });
    } catch (error) {
      console.error('Failed to load financial counts:', error);
    } finally {
      setLoading(false);
    }
  };

  const links = [
    { 
      id: 'sales-orders', 
      label: 'Sales Orders', 
      icon: FiShoppingCart, 
      count: counts.salesOrders,
      color: '#3b82f6'
    },
    { 
      id: 'purchase-orders', 
      label: 'Purchase Orders', 
      icon: FiShoppingCart, 
      count: counts.purchaseOrders,
      color: '#8b5cf6'
    },
    { 
      id: 'invoices', 
      label: 'Invoices', 
      icon: FiFileText, 
      count: counts.invoices,
      color: '#10b981'
    },
    { 
      id: 'vendor-bills', 
      label: 'Vendor Bills', 
      icon: FiCreditCard, 
      count: counts.vendorBills,
      color: '#f59e0b'
    },
    { 
      id: 'expenses', 
      label: 'Expenses', 
      icon: FiDollarSign, 
      count: counts.expenses,
      color: '#ef4444'
    }
  ];

  const handleClick = (linkId) => {
    // Switch to settings tab and then to the specific financial tab
    if (onTabChange) {
      onTabChange('settings', linkId);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="animate-pulse h-16 bg-gray-200 rounded flex-1"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: 'rgb(var(--text-secondary))' }}>
          Financial Documents
        </h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {links.map(link => (
          <button
            key={link.id}
            onClick={() => handleClick(link.id)}
            className="p-3 rounded-lg border transition-all hover:shadow-md"
            style={{ 
              borderColor: 'rgb(var(--border))',
              backgroundColor: 'rgb(var(--bg-primary))'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <link.icon className="w-5 h-5" style={{ color: link.color }} />
              <span className="text-lg font-bold px-2 py-1 rounded" style={{
                backgroundColor: `${link.color}15`,
                color: link.color
              }}>
                {link.count}
              </span>
            </div>
            <p className="text-xs font-medium text-left" style={{ color: 'rgb(var(--text-secondary))' }}>
              {link.label}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FinancialLinksBar;
