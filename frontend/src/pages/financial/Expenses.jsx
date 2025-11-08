import { useState } from 'react';
import { FiPlus, FiFilter, FiSearch, FiDollarSign } from 'react-icons/fi';

const Expenses = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const mockExpenses = [
    {
      id: 'EXP-001',
      employee: 'Alice Johnson',
      project: 'Brand Website Redesign',
      description: 'Client meeting travel',
      amount: 1500,
      billable: true,
      status: 'approved',
      date: '2025-11-01',
      receipt: true
    },
    {
      id: 'EXP-002',
      employee: 'Bob Smith',
      project: 'Mobile App Development',
      description: 'Software licenses',
      amount: 3500,
      billable: false,
      status: 'pending',
      date: '2025-11-05',
      receipt: true
    },
    {
      id: 'EXP-003',
      employee: 'Charlie Brown',
      project: 'E-commerce Platform',
      description: 'Stock photos and assets',
      amount: 800,
      billable: true,
      status: 'approved',
      date: '2025-10-28',
      receipt: true
    }
  ];

  const statusColors = {
    draft: 'badge-planned',
    pending: 'badge-in-progress',
    approved: 'badge-completed',
    rejected: 'badge-on-hold'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600 mt-2">Track and manage team expenses</p>
        </div>
        <button className="btn-primary flex items-center">
          <FiPlus className="mr-2" />
          Submit Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
              <p className="text-3xl font-bold text-gray-900">3</p>
            </div>
            <FiDollarSign className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Total Amount</p>
          <p className="text-3xl font-bold text-gray-900">₹5.8K</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Billable</p>
          <p className="text-3xl font-bold text-green-600">₹2.3K</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Pending Approval</p>
          <p className="text-3xl font-bold text-yellow-600">1</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by expense ID, employee, or project..."
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

      {/* Expenses List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expense #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
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
              {mockExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-primary-600">{expense.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{expense.employee}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{expense.project}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600">{expense.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{expense.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      ₹{expense.amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${expense.billable ? 'badge-completed' : 'badge-on-hold'}`}>
                      {expense.billable ? 'Billable' : 'Non-billable'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge ${statusColors[expense.status]}`}>
                      {expense.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-primary-600 hover:text-primary-900 mr-3">
                      View
                    </button>
                    {expense.status === 'pending' && (
                      <button className="text-green-600 hover:text-green-900">
                        Approve
                      </button>
                    )}
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

export default Expenses;
