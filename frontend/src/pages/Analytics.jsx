import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Analytics = () => {
  // Mock data for charts
  const projectProgressData = [
    { name: 'Brand Website', progress: 65 },
    { name: 'Mobile App', progress: 15 },
    { name: 'E-commerce', progress: 40 },
    { name: 'Marketing', progress: 100 }
  ];

  const resourceUtilization = [
    { name: 'Alice', hours: 160, capacity: 160 },
    { name: 'Bob', hours: 140, capacity: 160 },
    { name: 'Charlie', hours: 120, capacity: 160 },
    { name: 'David', hours: 155, capacity: 160 },
    { name: 'Emma', hours: 90, capacity: 160 }
  ];

  const costRevenueData = [
    { name: 'Brand Website', cost: 45000, revenue: 40000, profit: -5000 },
    { name: 'Mobile App', cost: 12000, revenue: 0, profit: -12000 },
    { name: 'E-commerce', cost: 72000, revenue: 60000, profit: -12000 },
    { name: 'Marketing', cost: 48000, revenue: 50000, profit: 2000 }
  ];

  const billableData = [
    { name: 'Billable', value: 780, color: '#0ea5e9' },
    { name: 'Non-billable', value: 460, color: '#64748b' }
  ];

  const COLORS = ['#0ea5e9', '#64748b'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">Insights into project progress, utilization, and profitability</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Total Projects</p>
          <p className="text-3xl font-bold text-gray-900">4</p>
          <p className="text-sm text-green-600 mt-2">+1 this month</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Tasks Completed</p>
          <p className="text-3xl font-bold text-gray-900">127</p>
          <p className="text-sm text-green-600 mt-2">+15% vs last month</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Hours Logged</p>
          <p className="text-3xl font-bold text-gray-900">1,240</p>
          <p className="text-sm text-blue-600 mt-2">780 billable</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
          <p className="text-3xl font-bold text-gray-900">₹150K</p>
          <p className="text-sm text-red-600 mt-2">₹27K profit</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Progress */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectProgressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="progress" fill="#0ea5e9" name="Progress %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Resource Utilization */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Utilization</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resourceUtilization}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="hours" fill="#0ea5e9" name="Hours Worked" />
              <Bar dataKey="capacity" fill="#e2e8f0" name="Capacity" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost vs Revenue */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Cost vs Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cost" fill="#ef4444" name="Cost" />
              <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
              <Bar dataKey="profit" fill="#0ea5e9" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Billable vs Non-billable */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Billable vs Non-billable Hours</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={billableData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {billableData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
