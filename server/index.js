const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Set charset and encoding
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cafe-menu');

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
app.use('/api/auth', authRoutes);

// Make io available in routes
app.set('io', io);

// Export io for use in routes
module.exports = { app, io };

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
