import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useThemeStore } from './store/themeStore';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Tasks from './pages/Tasks';
import TaskCreate from './pages/TaskCreate';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import SalesOrders from './pages/financial/SalesOrders';
import PurchaseOrders from './pages/financial/PurchaseOrders';
import CustomerInvoices from './pages/financial/CustomerInvoices';
import VendorBills from './pages/financial/VendorBills';
import Expenses from './pages/financial/Expenses';
import Timesheets from './pages/Timesheets';
import UserManagement from './pages/UserManagement';

// Layout
import MainLayout from './components/layout/MainLayout';

function App() {
  const { user } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  // Initialize theme on app load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme-storage');
    if (savedTheme) {
      try {
        const parsed = JSON.parse(savedTheme);
        if (parsed.state?.theme) {
          setTheme(parsed.state.theme);
        }
      } catch (e) {
        setTheme('light');
      }
    } else {
      setTheme('light');
    }
  }, [setTheme]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/landing" element={!user ? <Landing /> : <Navigate to="/dashboard" />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
        <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" />} />
        <Route path="/reset-password" element={!user ? <ResetPassword /> : <Navigate to="/dashboard" />} />

        {/* Protected Routes */}
        <Route path="/" element={user ? <MainLayout /> : <Navigate to="/landing" />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="tasks/create" element={<TaskCreate />} />
          <Route path="tasks/:id/edit" element={<TaskCreate />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="timesheets" element={<Timesheets />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          
          {/* Admin Routes */}
          <Route path="admin/users" element={<UserManagement />} />
          
          {/* Financial Routes */}
          <Route path="sales-orders" element={<SalesOrders />} />
          <Route path="purchase-orders" element={<PurchaseOrders />} />
          <Route path="customer-invoices" element={<CustomerInvoices />} />
          <Route path="vendor-bills" element={<VendorBills />} />
          <Route path="expenses" element={<Expenses />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
