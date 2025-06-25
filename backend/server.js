const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');
const SecurityMiddleware = require('./src/middleware/securityMiddleware');
const { swaggerSpec, swaggerUi, swaggerUiOptions } = require('./src/config/swagger');
const SocketHandler = require('./src/utils/socketHandler');

// Import routes
const authRoutes = require('./src/routes/auth');
const profileRoutes = require('./src/routes/profile');
const productRoutes = require('./src/routes/products');
const userRoutes = require('./src/routes/users-simple');
const negotiationRoutes = require('./src/routes/negotiations');
const conversationRoutes = require('./src/routes/conversations');
const { router: systemRoutes } = require('./src/routes/system');

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Enhanced Security middleware
app.use(SecurityMiddleware.securityHeaders());
app.use(SecurityMiddleware.securityLogger());
app.use(SecurityMiddleware.suspiciousActivityDetection());
app.use(SecurityMiddleware.apiVersioning());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://localhost:3001",  // Add port 3001 for development
    "http://localhost:3000"   // Keep original port for compatibility
  ],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(hpp()); // Prevent HTTP Parameter Pollution
app.use(compression()); // Compress responses

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  req.socketHandler = socketHandler;
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Smart Marketplace API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Documentation with Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// Swagger JSON endpoint
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API routes with specific rate limiting and session timeout
app.use('/api/auth', authRoutes);
app.use('/api/profile', SecurityMiddleware.sessionTimeout(30), profileRoutes);
app.use('/api/products', SecurityMiddleware.sessionTimeout(30), productRoutes);
app.use('/api/users', SecurityMiddleware.sessionTimeout(30), userRoutes);
app.use('/api/ai', SecurityMiddleware.sessionTimeout(15), require('./src/routes/ai')); // Shorter timeout for AI routes
app.use('/api/negotiations', SecurityMiddleware.sessionTimeout(30), negotiationRoutes);
app.use('/api/conversations', SecurityMiddleware.sessionTimeout(30), conversationRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/profile', SecurityMiddleware.sessionTimeout(30), profileRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use(errorHandler);

// Socket.IO connection handling with enhanced features
const socketHandler = new SocketHandler(io);
socketHandler.initialize();

console.log('🚀 Enhanced WebSocket handler initialized');

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
🚀 Smart Marketplace Server is running!
📡 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📊 MongoDB: ${process.env.MONGODB_URI ? 'Connected' : 'Connection string required'}
🎯 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = { app, server, io };
