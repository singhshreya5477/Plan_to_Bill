import { useState } from 'react';
import { FiPlus, FiFilter, FiSearch, FiCreditCard } from 'react-icons/fi';

const VendorBills = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const mockVendorBills = [
    {
      id: 'BILL-001',
      vendor: 'Cloud Hosting Services',
      project: 'Brand Website Redesign',
      purchaseOrder: 'PO-001',
      amount: 12000,
      status: 'paid',
      date: '2025-10-26',
      dueDate: '2025-11-10'
    },
    {
      id: 'BILL-002',
      vendor: 'Photography Studio',
      project: 'E-commerce Platform',
      purchaseOrder: 'PO-002',
      amount: 15000,
      status: 'pending',
      date: '2025-11-05',
      dueDate: '2025-11-20'
    },
    {
      id: 'BILL-003',
      vendor: 'Design Assets Provider',
      project: 'Mobile App Development',
      purchaseOrder: 'PO-003',
      amount: 8000,
      status: 'paid',
      date: '2025-10-19',
      dueDate: '2025-10-30'
    }
  ];

  const statusColors = {
    draft: 'badge-planned',
    pending: 'badge-in-progress',
    paid: 'badge-completed',
    overdue: 'badge-on-hold'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Bills</h1>
          <p className="text-gray-600 mt-2">Track costs and vendor payments</p>
        </div>
        <button className="btn-primary flex items-center">
          <FiPlus className="mr-2" />
          Record Bill
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Bills</p>
              <p className="text-3xl font-bold text-gray-900">3</p>
            </div>
            <FiCreditCard className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Total Value</p>
          <p className="text-3xl font-bold text-gray-900">₹35K</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Paid</p>
          <p className="text-3xl font-bold text-green-600">₹20K</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-3xl font-bold text-yellow-600">₹15K</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by bill number, vendor, or project..."
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

      {/* Vendor Bills List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bill #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purchase Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
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
              {mockVendorBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-primary-600">{bill.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{bill.vendor}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{bill.project}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-primary-600">{bill.purchaseOrder}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{bill.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{bill.dueDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      ₹{(bill.amount / 1000).toFixed(0)}K
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${statusColors[bill.status]}`}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-primary-600 hover:text-primary-900 mr-3">
                      View
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      Pay
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

export default VendorBills;
