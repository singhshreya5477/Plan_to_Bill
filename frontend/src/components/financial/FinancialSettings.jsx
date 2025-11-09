import { useState, useEffect } from 'react';
import { 
  FiFileText, 
  FiShoppingCart, 
  FiCreditCard, 
  FiDollarSign,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiCheck,
  FiX
} from 'react-icons/fi';
import financialService from '../../services/financialService';
import CreateFinancialModal from './CreateFinancialModal';
import ViewFinancialModal from './ViewFinancialModal';

const FinancialSettings = ({ projectId, initialTab = 'sales-orders' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  
  // Update activeTab when initialTab changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  
  // Data states
  const [salesOrders, setSalesOrders] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [vendorBills, setVendorBills] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [invoices, setInvoices] = useState([]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // create | edit | view
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    loadAllFinancialData();
  }, [projectId]);

  const loadAllFinancialData = async () => {
    setLoading(true);
    try {
      const [soRes, poRes, vbRes, expRes, invRes] = await Promise.all([
        financialService.getSalesOrders(projectId),
        financialService.getPurchaseOrders(projectId),
        financialService.getVendorBills(projectId),
        financialService.getExpenses(projectId),
        financialService.getInvoices(projectId)
      ]);

      if (soRes.success) setSalesOrders(soRes.data || []);
      if (poRes.success) setPurchaseOrders(poRes.data || []);
      if (vbRes.success) setVendorBills(vbRes.data || []);
      if (expRes.success) setExpenses(expRes.data || []);
      if (invRes.success) setInvoices(invRes.data?.invoices || []);
    } catch (error) {
      console.error('Failed to load financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'sales-orders', label: 'Sales Orders', icon: FiShoppingCart, count: salesOrders.length },
    { id: 'purchase-orders', label: 'Purchase Orders', icon: FiShoppingCart, count: purchaseOrders.length },
    { id: 'invoices', label: 'Customer Invoices', icon: FiFileText, count: invoices.length },
    { id: 'vendor-bills', label: 'Vendor Bills', icon: FiCreditCard, count: vendorBills.length },
    { id: 'expenses', label: 'Expenses', icon: FiDollarSign, count: expenses.length }
  ];

  const openCreateModal = (type) => {
    setModalMode('create');
    setSelectedItem({ type, project_id: projectId });
    setShowModal(true);
  };

  const handleModalSuccess = () => {
    setShowModal(false);
    loadAllFinancialData(); // Reload all data
  };

  const handleView = (type, item) => {
    setModalMode('view');
    setSelectedItem({ ...item, type });
    setShowModal(true);
  };

  const handleEdit = (type, item) => {
    setModalMode('edit');
    setSelectedItem({ ...item, type });
    setShowModal(true);
  };

  const handleDelete = async (type, id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      let response;
      switch (type) {
        case 'sales-orders':
          response = await financialService.deleteSalesOrder(id);
          break;
        case 'purchase-orders':
          response = await financialService.deletePurchaseOrder(id);
          break;
        case 'vendor-bills':
          response = await financialService.deleteVendorBill(id);
          break;
        case 'expenses':
          response = await financialService.deleteExpense(id);
          break;
      }
      
      if (response.success) {
        loadAllFinancialData();
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete item');
    }
  };

  const renderTable = () => {
    const getStatusColor = (status) => {
      const colors = {
        draft: 'rgb(107 114 128 / 0.1)',
        sent: 'rgb(59 130 246 / 0.1)',
        approved: 'rgb(16 185 129 / 0.1)',
        pending: 'rgb(251 191 36 / 0.1)',
        paid: 'rgb(16 185 129 / 0.1)',
        unpaid: 'rgb(239 68 68 / 0.1)',
        rejected: 'rgb(239 68 68 / 0.1)'
      };
      return colors[status] || 'rgb(107 114 128 / 0.1)';
    };

    const getStatusTextColor = (status) => {
      const colors = {
        draft: '#6b7280',
        sent: '#3b82f6',
        approved: '#10b981',
        pending: '#f59e0b',
        paid: '#10b981',
        unpaid: '#ef4444',
        rejected: '#ef4444'
      };
      return colors[status] || '#6b7280';
    };

    switch (activeTab) {
      case 'sales-orders':
        return (
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgb(var(--border))' }}>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>SO Number</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Customer</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Date</th>
                <th className="text-right py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Total</th>
                <th className="text-center py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Status</th>
                <th className="text-right py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {salesOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8" style={{ color: 'rgb(var(--text-secondary))' }}>
                    No sales orders yet. Click "Create Sales Order" to get started.
                  </td>
                </tr>
              ) : (
                salesOrders.map(so => (
                  <tr key={so.id} className="border-b hover:bg-opacity-50" style={{ borderColor: 'rgb(var(--border))' }}>
                    <td className="py-3 px-4" style={{ color: 'rgb(var(--text-primary))' }}>{so.so_number}</td>
                    <td className="py-3 px-4" style={{ color: 'rgb(var(--text-primary))' }}>{so.customer_name}</td>
                    <td className="py-3 px-4" style={{ color: 'rgb(var(--text-secondary))' }}>
                      {new Date(so.issue_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right font-medium" style={{ color: 'rgb(var(--text-primary))' }}>
                      ₹{parseFloat(so.total).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-3 py-1 rounded-full text-sm capitalize" style={{
                        backgroundColor: getStatusColor(so.status),
                        color: getStatusTextColor(so.status)
                      }}>
                        {so.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleView('sales-orders', so)}
                          className="p-2 hover:bg-opacity-10 rounded" 
                          style={{ color: 'rgb(var(--primary))' }}
                          title="View Details"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit('sales-orders', so)}
                          className="p-2 hover:bg-opacity-10 rounded" 
                          style={{ color: 'rgb(var(--primary))' }}
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete('sales-orders', so.id)}
                          className="p-2 hover:bg-opacity-10 rounded text-red-500"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        );

      case 'purchase-orders':
        return (
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgb(var(--border))' }}>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>PO Number</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Vendor</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Date</th>
                <th className="text-right py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Total</th>
                <th className="text-center py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Status</th>
                <th className="text-right py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8" style={{ color: 'rgb(var(--text-secondary))' }}>
                    No purchase orders yet. Click "Create Purchase Order" to get started.
                  </td>
                </tr>
              ) : (
                purchaseOrders.map(po => (
                  <tr key={po.id} className="border-b hover:bg-opacity-50" style={{ borderColor: 'rgb(var(--border))' }}>
                    <td className="py-3 px-4" style={{ color: 'rgb(var(--text-primary))' }}>{po.po_number}</td>
                    <td className="py-3 px-4" style={{ color: 'rgb(var(--text-primary))' }}>{po.vendor_name}</td>
                    <td className="py-3 px-4" style={{ color: 'rgb(var(--text-secondary))' }}>
                      {new Date(po.order_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right font-medium" style={{ color: 'rgb(var(--text-primary))' }}>
                      ₹{parseFloat(po.total).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-3 py-1 rounded-full text-sm capitalize" style={{
                        backgroundColor: getStatusColor(po.status),
                        color: getStatusTextColor(po.status)
                      }}>
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleView('purchase-orders', po)}
                          className="p-2 hover:bg-opacity-10 rounded" 
                          style={{ color: 'rgb(var(--primary))' }}
                          title="View Details"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit('purchase-orders', po)}
                          className="p-2 hover:bg-opacity-10 rounded" 
                          style={{ color: 'rgb(var(--primary))' }}
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete('purchase-orders', po.id)}
                          className="p-2 hover:bg-opacity-10 rounded text-red-500"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        );

      case 'vendor-bills':
        return (
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgb(var(--border))' }}>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Bill Number</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Vendor</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Due Date</th>
                <th className="text-right py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Total</th>
                <th className="text-center py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Payment Status</th>
                <th className="text-right py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendorBills.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8" style={{ color: 'rgb(var(--text-secondary))' }}>
                    No vendor bills yet. Click "Create Vendor Bill" to get started.
                  </td>
                </tr>
              ) : (
                vendorBills.map(bill => (
                  <tr key={bill.id} className="border-b hover:bg-opacity-50" style={{ borderColor: 'rgb(var(--border))' }}>
                    <td className="py-3 px-4" style={{ color: 'rgb(var(--text-primary))' }}>{bill.bill_number}</td>
                    <td className="py-3 px-4" style={{ color: 'rgb(var(--text-primary))' }}>{bill.vendor_name}</td>
                    <td className="py-3 px-4" style={{ color: 'rgb(var(--text-secondary))' }}>
                      {new Date(bill.due_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right font-medium" style={{ color: 'rgb(var(--text-primary))' }}>
                      ₹{parseFloat(bill.total).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-3 py-1 rounded-full text-sm capitalize" style={{
                        backgroundColor: getStatusColor(bill.payment_status),
                        color: getStatusTextColor(bill.payment_status)
                      }}>
                        {bill.payment_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleView('vendor-bills', bill)}
                          className="p-2 hover:bg-opacity-10 rounded" 
                          style={{ color: 'rgb(var(--primary))' }}
                          title="View Details"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit('vendor-bills', bill)}
                          className="p-2 hover:bg-opacity-10 rounded" 
                          style={{ color: 'rgb(var(--primary))' }}
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete('vendor-bills', bill.id)}
                          className="p-2 hover:bg-opacity-10 rounded text-red-500"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        );

      case 'expenses':
        return (
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgb(var(--border))' }}>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Expense #</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Category</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Description</th>
                <th className="text-right py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Amount</th>
                <th className="text-center py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Status</th>
                <th className="text-right py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8" style={{ color: 'rgb(var(--text-secondary))' }}>
                    No expenses yet. Click "Create Expense" to get started.
                  </td>
                </tr>
              ) : (
                expenses.map(exp => (
                  <tr key={exp.id} className="border-b hover:bg-opacity-50" style={{ borderColor: 'rgb(var(--border))' }}>
                    <td className="py-3 px-4" style={{ color: 'rgb(var(--text-primary))' }}>{exp.expense_number}</td>
                    <td className="py-3 px-4" style={{ color: 'rgb(var(--text-primary))' }}>{exp.category}</td>
                    <td className="py-3 px-4" style={{ color: 'rgb(var(--text-secondary))' }}>{exp.description}</td>
                    <td className="py-3 px-4 text-right font-medium" style={{ color: 'rgb(var(--text-primary))' }}>
                      ₹{parseFloat(exp.amount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-3 py-1 rounded-full text-sm capitalize" style={{
                        backgroundColor: getStatusColor(exp.status),
                        color: getStatusTextColor(exp.status)
                      }}>
                        {exp.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {exp.status === 'pending' && (
                          <>
                            <button 
                              className="p-2 hover:bg-opacity-10 rounded text-green-500"
                              title="Approve"
                            >
                              <FiCheck className="w-4 h-4" />
                            </button>
                            <button 
                              className="p-2 hover:bg-opacity-10 rounded text-red-500"
                              title="Reject"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleView('expenses', exp)}
                          className="p-2 hover:bg-opacity-10 rounded" 
                          style={{ color: 'rgb(var(--primary))' }}
                          title="View Details"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete('expenses', exp.id)}
                          className="p-2 hover:bg-opacity-10 rounded text-red-500"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        );

      case 'invoices':
        return (
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgb(var(--border))' }}>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Invoice #</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Customer</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Due Date</th>
                <th className="text-right py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Total</th>
                <th className="text-center py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Status</th>
                <th className="text-right py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8" style={{ color: 'rgb(var(--text-secondary))' }}>
                    No invoices yet. Create one from Financial → Invoices page.
                  </td>
                </tr>
              ) : (
                invoices.map(inv => (
                  <tr key={inv.id} className="border-b hover:bg-opacity-50" style={{ borderColor: 'rgb(var(--border))' }}>
                    <td className="py-3 px-4" style={{ color: 'rgb(var(--text-primary))' }}>{inv.invoice_number}</td>
                    <td className="py-3 px-4" style={{ color: 'rgb(var(--text-primary))' }}>{inv.customer_name}</td>
                    <td className="py-3 px-4" style={{ color: 'rgb(var(--text-secondary))' }}>
                      {new Date(inv.due_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right font-medium" style={{ color: 'rgb(var(--text-primary))' }}>
                      ₹{parseFloat(inv.total_amount).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-3 py-1 rounded-full text-sm capitalize" style={{
                        backgroundColor: getStatusColor(inv.status),
                        color: getStatusTextColor(inv.status)
                      }}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-opacity-10 rounded" style={{ color: 'rgb(var(--primary))' }}>
                          <FiEye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        );

      default:
        return null;
    }
  };

  const getCreateButtonLabel = () => {
    const labels = {
      'sales-orders': 'Create Sales Order',
      'purchase-orders': 'Create Purchase Order',
      'invoices': 'Create Invoice',
      'vendor-bills': 'Create Vendor Bill',
      'expenses': 'Create Expense'
    };
    return labels[activeTab] || 'Create';
  };

  if (loading) {
    return <div className="text-center py-8" style={{ color: 'rgb(var(--text-secondary))' }}>Loading financial data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Financial Tabs */}
      <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'rgb(var(--border))' }}>
        <div className="flex gap-2 flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id ? 'shadow-sm' : ''
              }`}
              style={activeTab === tab.id ? {
                backgroundColor: 'rgb(var(--primary))',
                color: 'white'
              } : {
                backgroundColor: 'rgb(var(--bg-secondary))',
                color: 'rgb(var(--text-secondary))'
              }}
            >
              <tab.icon className="w-4 h-4" />
              <span className="font-medium text-sm">{tab.label}</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{
                backgroundColor: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'rgb(var(--bg-tertiary))'
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        
        <button 
          onClick={() => openCreateModal(activeTab)}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          {getCreateButtonLabel()}
        </button>
      </div>

      {/* Financial Data Table */}
      <div className="overflow-x-auto rounded-lg border" style={{ borderColor: 'rgb(var(--border))' }}>
        {renderTable()}
      </div>

      {/* Create Modal */}
      {showModal && modalMode === 'create' && (
        <CreateFinancialModal
          type={activeTab}
          projectId={projectId}
          onClose={() => setShowModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* View Modal */}
      {showModal && modalMode === 'view' && selectedItem && (
        <ViewFinancialModal
          item={selectedItem}
          onClose={() => setShowModal(false)}
          onEdit={() => {
            setModalMode('edit');
          }}
        />
      )}

      {/* Edit Modal */}
      {showModal && modalMode === 'edit' && selectedItem && (
        <CreateFinancialModal
          type={selectedItem.type}
          projectId={projectId}
          initialData={selectedItem}
          onClose={() => setShowModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default FinancialSettings;
