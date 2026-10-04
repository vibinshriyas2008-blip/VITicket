const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');
const { getLastSentEmail } = require('./services/emailService');

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'VITicket Campus Event Ticketing & QR Check-In System',
    timestamp: new Date().toISOString(),
  });
});

// Dev Helper: Inspect last sent email link
app.get('/api/dev/last-email', (req, res) => {
  const lastEmail = getLastSentEmail();
  res.status(200).json({
    success: true,
    lastEmail: lastEmail || 'No emails dispatched yet in this runtime session.',
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api', require('./routes/registrationRoutes'));
app.use('/api/checkin', require('./routes/checkinRoutes'));

// 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
  });
});

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server;

// Start Server function for export & CLI
const startServer = async () => {
  await connectDB();
  server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 VITicket Backend Server running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
  return server;
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
