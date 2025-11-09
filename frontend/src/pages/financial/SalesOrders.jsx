import { useState, useEffect } from 'react';
import { FiPlus, FiFilter, FiSearch, FiTrendingUp, FiEye, FiEdit2, FiTrash2 } from 'react-icons/fi';
import financialService from '../../services/financialService';
import CreateFinancialModal from '../../components/financial/CreateFinancialModal';
import ViewFinancialModal from '../../components/financial/ViewFinancialModal';

const SalesOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'view', 'edit'

  useEffect(() => {
    loadSalesOrders();
  }, []);

  const loadSalesOrders = async () => {
    setLoading(true);
    try {
      const response = await financialService.getSalesOrders();
      if (response.success) {
        setSalesOrders(response.data.salesOrders || []);
      }
    } catch (error) {
      console.error('Failed to load sales orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (order) => {
    setSelectedOrder({ ...order, type: 'sales_order' });
    setShowViewModal(true);
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setModalMode('edit');
    setShowCreateModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this sales order?')) return;
    
    try {
      await financialService.deleteSalesOrder(id);
      loadSalesOrders();
    } catch (error) {
      console.error('Failed to delete sales order:', error);
      alert('Failed to delete sales order');
    }
  };

  const handleCreateNew = () => {
    setSelectedOrder(null);
    setModalMode('create');
    setShowCreateModal(true);
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setShowViewModal(false);
    setSelectedOrder(null);
    setModalMode('create');
    loadSalesOrders();
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      confirmed: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getSummary = () => {
    const total = salesOrders.length;
    const totalValue = salesOrders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
    const confirmed = salesOrders.filter(o => o.status === 'confirmed').length;
    const draft = salesOrders.filter(o => o.status === 'draft').length;
    return { total, totalValue, confirmed, draft };
  };

  const summary = getSummary();

  const filteredOrders = salesOrders.filter(order =>
    order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>Sales Orders</h1>
          <p style={{ color: 'rgb(var(--text-secondary))' }} className="mt-2">Manage customer sales orders</p>
        </div>
        <button onClick={handleCreateNew} className="btn-primary flex items-center gap-2">
          <FiPlus className="w-4 h-4" />
          Create Sales Order
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Total Orders</p>
              <p className="text-3xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>{summary.total}</p>
            </div>
            <FiTrendingUp className="h-8 w-8" style={{ color: 'rgb(var(--primary))' }} />
          </div>
        </div>
        <div className="card">
          <p className="text-sm mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Total Value</p>
          <p className="text-3xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
            ₹{summary.totalValue.toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-sm mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Confirmed</p>
          <p className="text-3xl font-bold text-blue-600">{summary.confirmed}</p>
        </div>
        <div className="card">
          <p className="text-sm mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Draft</p>
          <p className="text-3xl font-bold text-yellow-600">{summary.draft}</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex-1 relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'rgb(var(--text-secondary))' }} />
        <input
          type="text"
          placeholder="Search by order number or customer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10 w-full"
        />
      </div>

      {/* Sales Orders Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}>
              <tr>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Order #</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Customer</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Date</th>
                <th className="text-right py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Amount</th>
                <th className="text-center py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Status</th>
                <th className="text-right py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-8" style={{ color: 'rgb(var(--text-secondary))' }}>
                    Loading...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8" style={{ color: 'rgb(var(--text-secondary))' }}>
                    No sales orders found. Click "Create Sales Order" to add one.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="border-t" style={{ borderColor: 'rgb(var(--border))' }}>
                    <td className="py-3 px-4">
                      <span className="font-medium" style={{ color: 'rgb(var(--primary))' }}>
                        {order.order_number}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium" style={{ color: 'rgb(var(--text-primary))' }}>
                        {order.customer_name}
                      </div>
                      {order.customer_email && (
                        <div className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                          {order.customer_email}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4" style={{ color: 'rgb(var(--text-secondary))' }}>
                      {new Date(order.order_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right font-medium" style={{ color: 'rgb(var(--text-primary))' }}>
                      ₹{parseFloat(order.total).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(order)}
                          className="p-2 hover:bg-opacity-10 rounded"
                          style={{ color: 'rgb(var(--primary))' }}
                          title="View"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(order)}
                          className="p-2 hover:bg-opacity-10 rounded"
                          style={{ color: 'rgb(var(--primary))' }}
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
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
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <CreateFinancialModal
          isOpen={showCreateModal}
          onClose={handleModalClose}
          type="sales_order"
          initialData={modalMode === 'edit' ? selectedOrder : null}
          isEditing={modalMode === 'edit'}
        />
      )}

      {/* View Modal */}
      {showViewModal && selectedOrder && (
        <ViewFinancialModal
          isOpen={showViewModal}
          onClose={handleModalClose}
          item={selectedOrder}
          onEdit={() => {
            setShowViewModal(false);
            handleEdit(selectedOrder);
          }}
        />
      )}
    </div>
  );
};

export default SalesOrders;
