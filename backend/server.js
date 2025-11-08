require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 UNCAUGHT EXCEPTION:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('💥 UNHANDLED REJECTION:', error);
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📧 Email configured: ${process.env.EMAIL_USER}`);
});

module.exports = app;
