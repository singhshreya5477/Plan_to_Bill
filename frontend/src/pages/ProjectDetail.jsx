import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { 
  FiFileText, 
  FiShoppingCart, 
  FiDollarSign, 
  FiCreditCard,
  FiTrendingUp 
} from 'react-icons/fi';

const ProjectDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock project data
  const project = {
    id: id,
    name: 'Brand Website Redesign',
    client: 'Acme Corp',
    status: 'in_progress',
    progress: 65,
    budget: 100000,
    spent: 45000,
    revenue: 40000,
    deadline: '2025-12-15',
    manager: 'John Doe',
    team: ['Alice', 'Bob', 'Charlie'],
    description: 'Complete redesign of corporate website with modern UI/UX'
  };

  const links = [
    { type: 'Sales Orders', icon: FiTrendingUp, count: 2, amount: 100000 },
    { type: 'Purchase Orders', icon: FiShoppingCart, count: 3, amount: 25000 },
    { type: 'Customer Invoices', icon: FiFileText, count: 1, amount: 40000 },
    { type: 'Vendor Bills', icon: FiCreditCard, count: 2, amount: 15000 },
    { type: 'Expenses', icon: FiDollarSign, count: 5, amount: 5000 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-gray-600 mt-1">{project.client}</p>
        </div>
        <button className="btn-primary">Edit Project</button>
      </div>

      {/* Links Panel - Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {links.map((link) => (
          <button
            key={link.type}
            className="card hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <link.icon className="h-5 w-5 text-primary-600" />
              <span className="badge badge-planned">{link.count}</span>
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">{link.type}</p>
            <p className="text-lg font-bold text-primary-600">
              ₹{(link.amount / 1000).toFixed(0)}K
            </p>
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'tasks', 'team', 'financials', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 capitalize">{activeTab}</h3>
        <p className="text-gray-600">
          {activeTab} content for {project.name} - detailed view coming soon
        </p>
      </div>
    </div>
  );
};

export default ProjectDetail;
