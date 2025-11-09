import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FiTrendingUp, FiCheckCircle, FiClock, FiDollarSign, FiBarChart2, FiUsers, FiActivity, FiPieChart } from 'react-icons/fi';

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
      {/* Header with animated background */}
      <div className="relative">
        {/* Floating gradient blobs */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-10 gradient-bg-purple blob-animate pointer-events-none" style={{ filter: 'blur(60px)' }}></div>
        <div className="absolute -top-10 right-0 w-48 h-48 rounded-full opacity-10 gradient-bg-blue blob-animate pointer-events-none" style={{ filter: 'blur(50px)', animationDelay: '2s' }}></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold holographic animate-slide-in-right" style={{ color: 'rgb(var(--text-primary))' }}>
            Analytics
          </h1>
          <p className="mt-2 animate-slide-in-right delay-100" style={{ color: 'rgb(var(--text-secondary))' }}>
            Insights into project progress, utilization, and profitability
          </p>
        </div>
      </div>

      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Projects Card */}
        <div className="card group hover-lift cursor-pointer relative overflow-hidden animate-fade-in transition-all hover:shadow-2xl">
          {/* Rotating gradient border */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: 'linear-gradient(135deg, #6366f140, transparent)', filter: 'blur(10px)' }}
          ></div>
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>Total Projects</p>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-12"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <FiBarChart2 className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-2 transition-all group-hover:scale-105" style={{ color: 'rgb(var(--text-primary))' }}>4</p>
            <div className="flex items-center gap-1 text-sm" style={{ color: 'rgb(var(--success))' }}>
              <FiTrendingUp className="w-4 h-4" />
              <span>+1 this month</span>
            </div>
          </div>
        </div>

        {/* Tasks Completed Card */}
        <div className="card group hover-lift cursor-pointer relative overflow-hidden animate-fade-in transition-all hover:shadow-2xl" style={{ animationDelay: '100ms' }}>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: 'linear-gradient(135deg, #10b98140, transparent)', filter: 'blur(10px)' }}
          ></div>
          
          <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>Tasks Completed</p>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-12"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                <FiCheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-2 transition-all group-hover:scale-105" style={{ color: 'rgb(var(--text-primary))' }}>127</p>
            <div className="flex items-center gap-1 text-sm" style={{ color: 'rgb(var(--success))' }}>
              <FiTrendingUp className="w-4 h-4" />
              <span>+15% vs last month</span>
            </div>
          </div>
        </div>

        {/* Hours Logged Card */}
        <div className="card group hover-lift cursor-pointer relative overflow-hidden animate-fade-in transition-all hover:shadow-2xl" style={{ animationDelay: '200ms' }}>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: 'linear-gradient(135deg, #06b6d440, transparent)', filter: 'blur(10px)' }}
          ></div>
          
          <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>Hours Logged</p>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-12"
                style={{ background: 'linear-gradient(135deg, #06b6d4, #0284c7)' }}>
                <FiClock className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-2 transition-all group-hover:scale-105" style={{ color: 'rgb(var(--text-primary))' }}>1,240</p>
            <div className="flex items-center gap-1 text-sm" style={{ color: 'rgb(var(--accent))' }}>
              <FiActivity className="w-4 h-4" />
              <span>780 billable</span>
            </div>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="card group hover-lift cursor-pointer relative overflow-hidden animate-fade-in transition-all hover:shadow-2xl" style={{ animationDelay: '300ms' }}>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: 'linear-gradient(135deg, #f59e0b40, transparent)', filter: 'blur(10px)' }}
          ></div>
          
          <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>Total Revenue</p>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-12"
                style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                <FiDollarSign className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-2 transition-all group-hover:scale-105" style={{ color: 'rgb(var(--text-primary))' }}>₹150K</p>
            <div className="flex items-center gap-1 text-sm" style={{ color: 'rgb(var(--error))' }}>
              <FiTrendingUp className="w-4 h-4" />
              <span>₹27K profit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Progress */}
        <div className="card group hover-lift transition-all hover:shadow-2xl relative overflow-hidden animate-fade-in" style={{ animationDelay: '400ms' }}>
          {/* Gradient glow on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: 'radial-gradient(circle at top right, #8b5cf640, transparent)', filter: 'blur(40px)' }}
          ></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold transition-all group-hover:translate-x-1" style={{ color: 'rgb(var(--text-primary))' }}>
                Project Progress
              </h3>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-12"
                style={{ backgroundColor: 'rgb(var(--accent) / 0.1)' }}>
                <FiBarChart2 className="w-4 h-4" style={{ color: 'rgb(var(--accent))' }} />
              </div>
            </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectProgressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-color))" />
              <XAxis dataKey="name" stroke="rgb(var(--text-secondary))" />
              <YAxis stroke="rgb(var(--text-secondary))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgb(var(--bg-secondary))',
                  border: '1px solid rgb(var(--border-color))',
                  color: 'rgb(var(--text-primary))'
                }}
              />
              <Legend wrapperStyle={{ color: 'rgb(var(--text-primary))' }} />
              <Bar dataKey="progress" fill="rgb(var(--accent))" name="Progress %" />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>

        {/* Resource Utilization */}
        <div className="card group hover-lift transition-all hover:shadow-2xl relative overflow-hidden animate-fade-in" style={{ animationDelay: '500ms' }}>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: 'radial-gradient(circle at top left, #06b6d440, transparent)', filter: 'blur(40px)' }}
          ></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold transition-all group-hover:translate-x-1" style={{ color: 'rgb(var(--text-primary))' }}>
                Resource Utilization
              </h3>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-12"
                style={{ backgroundColor: 'rgb(var(--accent) / 0.1)' }}>
                <FiUsers className="w-4 h-4" style={{ color: 'rgb(var(--accent))' }} />
              </div>
            </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resourceUtilization}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-color))" />
              <XAxis dataKey="name" stroke="rgb(var(--text-secondary))" />
              <YAxis stroke="rgb(var(--text-secondary))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgb(var(--bg-secondary))',
                  border: '1px solid rgb(var(--border-color))',
                  color: 'rgb(var(--text-primary))'
                }}
              />
              <Legend wrapperStyle={{ color: 'rgb(var(--text-primary))' }} />
              <Bar dataKey="hours" fill="rgb(var(--accent))" name="Hours Worked" />
              <Bar dataKey="capacity" fill="rgb(var(--text-tertiary))" name="Capacity" />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost vs Revenue */}
        <div className="card group hover-lift transition-all hover:shadow-2xl relative overflow-hidden animate-fade-in" style={{ animationDelay: '600ms' }}>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: 'radial-gradient(circle at bottom right, #10b98140, transparent)', filter: 'blur(40px)' }}
          ></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold transition-all group-hover:translate-x-1" style={{ color: 'rgb(var(--text-primary))' }}>
                Project Cost vs Revenue
              </h3>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-12"
                style={{ backgroundColor: 'rgb(var(--success) / 0.1)' }}>
                <FiDollarSign className="w-4 h-4" style={{ color: 'rgb(var(--success))' }} />
              </div>
            </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={costRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border-color))" />
              <XAxis dataKey="name" stroke="rgb(var(--text-secondary))" />
              <YAxis stroke="rgb(var(--text-secondary))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgb(var(--bg-secondary))',
                  border: '1px solid rgb(var(--border-color))',
                  color: 'rgb(var(--text-primary))'
                }}
              />
              <Legend wrapperStyle={{ color: 'rgb(var(--text-primary))' }} />
              <Bar dataKey="cost" fill="rgb(var(--error))" name="Cost" />
              <Bar dataKey="revenue" fill="rgb(var(--success))" name="Revenue" />
              <Bar dataKey="profit" fill="rgb(var(--accent))" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>

        {/* Billable vs Non-billable */}
        <div className="card group hover-lift transition-all hover:shadow-2xl relative overflow-hidden animate-fade-in" style={{ animationDelay: '700ms' }}>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: 'radial-gradient(circle at bottom left, #6366f140, transparent)', filter: 'blur(40px)' }}
          ></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold transition-all group-hover:translate-x-1" style={{ color: 'rgb(var(--text-primary))' }}>
                Billable vs Non-billable Hours
              </h3>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-12"
                style={{ backgroundColor: 'rgb(var(--accent) / 0.1)' }}>
                <FiPieChart className="w-4 h-4" style={{ color: 'rgb(var(--accent))' }} />
              </div>
            </div>
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
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgb(var(--bg-secondary))',
                  border: '1px solid rgb(var(--border-color))',
                  color: 'rgb(var(--text-primary))'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
