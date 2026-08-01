const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const pino = require('pino');
require('dotenv').config();

let logger;
try {
  const loggerOpts = { level: process.env.LOG_LEVEL || 'info' };
  if (process.env.NODE_ENV !== 'production') {
    loggerOpts.transport = {
      target: 'pino-pretty',
      options: { colorize: true }
    };
  }
  logger = pino(loggerOpts);
} catch (err) {
  console.error('Failed to initialize pino logger:', err);
  process.exit(1);
}

// Validate required environment variables
const REQUIRED_ENV_VARS = ['MONGODB_URI', 'JWT_SECRET'];
REQUIRED_ENV_VARS.forEach(key => {
  if (!process.env[key]) {
    logger.fatal(`Missing required environment variable ${key}`);
    process.exit(1);
  }
});

const app = express();
app.set('trust proxy', true);
app.set('logger', logger);
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
  max: process.env.NODE_ENV === 'test' ? 1000 : 100,
  message: 'Too many requests from this IP, please try again later.',
  validate: { trustProxy: false }
});
app.use('/api/', limiter);

// Stricter rate limit for login
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 100 : 5,
  message: 'Demasiados intentos de login, intenta de nuevo en 1 minuto',
  validate: { trustProxy: false }
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection with retry
async function connectDB(retries = 5, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      logger.info('Conectado a MongoDB correctamente');
      return;
    } catch (err) {
      logger.error(err, `Error conectando a MongoDB (intento ${i + 1}/${retries})`);
      if (i < retries - 1) {
        await new Promise(res => setTimeout(res, delay));
      }
    }
  }
  logger.fatal('No se pudo conectar a MongoDB después de múltiples intentos');
  process.exit(1);
}

// Health endpoint
app.get('/api/health', async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  }[dbState] || 'unknown';

  res.json({
    status: dbState === 1 ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
    nodeVersion: process.version
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info({ socketId: socket.id }, 'Cliente conectado');

  socket.on('join-kitchen', () => {
    try {
      socket.join('kitchen');
      logger.info({ socketId: socket.id }, 'Cliente de cocina unido');
    } catch (error) {
      logger.error(error, 'Error al unir cliente a cocina');
    }
  });

  socket.on('join-cashier', () => {
    try {
      socket.join('cashier');
      logger.info({ socketId: socket.id }, 'Cliente de caja unido');
    } catch (error) {
      logger.error(error, 'Error al unir cliente a caja');
    }
  });

  socket.on('error', (error) => {
    logger.error(error, 'Error en socket');
  });

  socket.on('disconnect', (reason) => {
    logger.info({ socketId: socket.id, reason }, 'Cliente desconectado');
  });
});

// Handle server-level socket errors
io.engine.on('connection_error', (err) => {
  logger.error(err, 'Error de conexión Socket.IO');
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
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);

// Make io and logger available in routes
app.set('io', io);

// Export for use in tests
module.exports = { app, io, logger, server, connectDB };

// Solo iniciar el servidor si se ejecuta directamente (no al ser importado por tests)
if (require.main === module) {
  connectDB();

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    logger.info({ port: PORT }, `Servidor corriendo en puerto ${PORT}`);
  });

  // Graceful shutdown
  async function gracefulShutdown(signal) {
    logger.info({ signal }, 'Señal recibida. Cerrando servidor gracefulmente');
    server.close(() => {
      logger.info('Servidor HTTP cerrado');
      mongoose.connection.close(false).then(() => {
        logger.info('Conexión MongoDB cerrada');
        process.exit(0);
      });
    });
    setTimeout(() => {
      logger.error('Forzando cierre después de timeout');
      process.exit(1);
    }, 10000);
  }

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}
