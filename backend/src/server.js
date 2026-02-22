// ==================================================
// SportVerse AI - Main Server Entry Point
// ==================================================
// This is the main Express server that handles:
// - REST API routes for all modules
// - Google OAuth authentication
// - Socket.io for real-time chat
// - File uploads for video analysis
// - Proxy calls to the Python AI microservice
// ==================================================

require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
const passport = require('passport');

// Import configurations
const { connectDatabase, disconnectDatabase } = require('./config/database');
const { initPassport } = require('./config/passport');
const { initSocketIO } = require('./config/socket');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const videoRoutes = require('./routes/video');
const trainerRoutes = require('./routes/trainer');
const communityRoutes = require('./routes/community');
const coachRoutes = require('./routes/coach');
const chatRoutes = require('./routes/chat');
const dmRoutes = require('./routes/dm');
const gameRequestRoutes = require('./routes/gameRequests');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// ==== Middleware Setup ====

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  crossOriginEmbedderPolicy: false
}));

// CORS - Allow frontend to communicate with backend
const allowedOrigins = [
  'http://localhost:5173',                  // local dev
  'https://sportverse-ai.vercel.app',       // Vercel frontend
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting - prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Logging
app.use(morgan('dev'));

// Passport initialization
app.use(passport.initialize());
initPassport();

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ==== API Routes ====
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/video', videoRoutes);
app.use('/api/trainer', trainerRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/dm', dmRoutes);
app.use('/api/game-requests', gameRequestRoutes);

// Root health check (Render hits / by default)
app.get('/', (req, res) => {
  res.status(200).send('SportVerse AI Backend is running');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'SportVerse AI Backend',
    timestamp: new Date().toISOString() 
  });
});

// ==== Error Handling ====

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Internal server error'
  });
});

// ==== Start Server ====
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect to MongoDB Atlas
    await connectDatabase();
    console.log('✅ MongoDB Atlas connected');

    // Initialize Socket.io
    initSocketIO(server);
    console.log('✅ Socket.io initialized');

    // Start listening
    server.listen(PORT, () => {
      console.log(`\n🚀 SportVerse AI Backend running on http://localhost:${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});

startServer();

module.exports = { app, server };
