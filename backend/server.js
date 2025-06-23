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
require('dotenv').config();

const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');

// Import routes
const authRoutes = require('./src/routes/auth');
const productRoutes = require('./src/routes/products');
const userRoutes = require('./src/routes/users');
const negotiationRoutes = require('./src/routes/negotiations');

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

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

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
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
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

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
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

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/negotiations', negotiationRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a product negotiation room
  socket.on('join-negotiation', (productId) => {
    socket.join(`product-${productId}`);
    console.log(`User ${socket.id} joined negotiation for product ${productId}`);
  });

  // Leave a product negotiation room
  socket.on('leave-negotiation', (productId) => {
    socket.leave(`product-${productId}`);
    console.log(`User ${socket.id} left negotiation for product ${productId}`);
  });

  // Handle typing indicator
  socket.on('typing-start', (data) => {
    socket.to(`product-${data.productId}`).emit('user-typing', {
      userId: data.userId,
      isTyping: true
    });
  });

  socket.on('typing-stop', (data) => {
    socket.to(`product-${data.productId}`).emit('user-typing', {
      userId: data.userId,
      isTyping: false
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

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
