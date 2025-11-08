import { useState } from 'react';
import { FiPlus, FiFilter, FiSearch, FiShoppingCart } from 'react-icons/fi';

const PurchaseOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const mockPurchaseOrders = [
    {
      id: 'PO-001',
      vendor: 'Cloud Hosting Services',
      project: 'Brand Website Redesign',
      amount: 12000,
      status: 'confirmed',
      date: '2025-10-20',
      deliveryDate: '2025-10-25'
    },
    {
      id: 'PO-002',
      vendor: 'Photography Studio',
      project: 'E-commerce Platform',
      amount: 15000,
      status: 'pending',
      date: '2025-11-01',
      deliveryDate: '2025-11-10'
    },
    {
      id: 'PO-003',
      vendor: 'Design Assets Provider',
      project: 'Mobile App Development',
      amount: 8000,
      status: 'confirmed',
      date: '2025-10-15',
      deliveryDate: '2025-10-18'
    }
  ];

  const statusColors = {
    draft: 'badge-planned',
    pending: 'badge-in-progress',
    confirmed: 'badge-completed',
    cancelled: 'badge-on-hold'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-600 mt-2">Manage vendor purchase orders for projects</p>
        </div>
        <button className="btn-primary flex items-center">
          <FiPlus className="mr-2" />
          Create Purchase Order
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">3</p>
            </div>
            <FiShoppingCart className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Total Value</p>
          <p className="text-3xl font-bold text-gray-900">₹35K</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Confirmed</p>
          <p className="text-3xl font-bold text-green-600">2</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">1</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order number, vendor, or project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <button className="btn-outline flex items-center">
          <FiFilter className="mr-2" />
          Filter
        </button>
      </div>

      {/* Purchase Orders List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockPurchaseOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-primary-600">{order.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.vendor}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{order.project}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{order.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{order.deliveryDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      ₹{(order.amount / 1000).toFixed(0)}K
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-primary-600 hover:text-primary-900 mr-3">
                      View
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrders;
