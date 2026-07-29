const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();

// Validate required environment variables
const REQUIRED_ENV_VARS = ['MONGODB_URI', 'JWT_SECRET'];
REQUIRED_ENV_VARS.forEach(key => {
  if (!process.env[key]) {
    console.error(`FATAL: Missing required environment variable ${key}`);
    process.exit(1);
  }
});

const app = express();
app.set('trust proxy', true);
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"]
  }
});

// Compression middleware
app.use(compression());

// Set charset and encoding
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Stricter rate limit for login
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Demasiados intentos de login, intenta de nuevo en 1 minuto'
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection with retry
async function connectDB(retries = 5, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Conectado a MongoDB correctamente');
      return;
    } catch (err) {
      console.error(`Error conectando a MongoDB (intento ${i + 1}/${retries}):`, err.message);
      if (i < retries - 1) {
        await new Promise(res => setTimeout(res, delay));
      }
    }
  }
  console.error('FATAL: No se pudo conectar a MongoDB después de múltiples intentos');
  process.exit(1);
}

connectDB();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('join-kitchen', () => {
    try {
      socket.join('kitchen');
      console.log('Cliente de cocina unido:', socket.id);
    } catch (error) {
      console.error('Error al unir cliente a cocina:', error);
    }
  });

  socket.on('join-cashier', () => {
    try {
      socket.join('cashier');
      console.log('Cliente de caja unido:', socket.id);
    } catch (error) {
      console.error('Error al unir cliente a caja:', error);
    }
  });

  socket.on('error', (error) => {
    console.error('Error en socket:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log('Cliente desconectado:', socket.id, 'Razón:', reason);
  });
});

// Handle server-level socket errors
io.engine.on('connection_error', (err) => {
  console.error('Error de conexión Socket.IO:', err);
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Café Bosque API - Backend funcionando correctamente' });
});

// Routes
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');

app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', loginLimiter, authRoutes);

// Make io available in routes
app.set('io', io);

// Export io for use in routes
module.exports = { app, io };

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

// Graceful shutdown
async function gracefulShutdown(signal) {
  console.log(`\n${signal} recibido. Cerrando servidor gracefully...`);
  server.close(() => {
    console.log('Servidor HTTP cerrado');
    mongoose.connection.close(false).then(() => {
      console.log('Conexión MongoDB cerrada');
      process.exit(0);
    });
  });
  setTimeout(() => {
    console.error('Forzando cierre después de timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
