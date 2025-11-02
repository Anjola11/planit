require('dotenv').config();
const app = require('./src/app');
const { initializeFirebase } = require('./src/config/firebase');

// Initialize Firebase
initializeFirebase();

// Get port from environment or use default
const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🎉 Event Management API Server                     ║
║                                                       ║
║   🚀 Server running on port ${PORT}                     ║
║   📝 Environment: ${process.env.NODE_ENV || 'development'}                  ║
║   ✅ Health Check: http://localhost:${PORT}/health      ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing server gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});