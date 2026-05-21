const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// View engine setup (EJS for table booking)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'view'));

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from view/assets for EJS pages
app.use('/assets', express.static(path.join(__dirname, 'view', 'assets')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make io accessible in routes
app.set('io', io);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/group-orders', require('./routes/groupOrders'));
app.use('/api/payments', require('./routes/payment'));
app.use('/api/coupons', require('./routes/Coupans'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/dineout', require('./routes/dineout'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'riviggy API is running' }));

// Error handling middleware
app.use(require('./middleware/errorHandler'));

// Socket.IO real-time events
require('./utils/socketHandler')(io);

// Auto-seed database on first startup
const autoSeed = async () => {
  try {
    const User = require('./models/User');
    const defaultUsers = [
      { name: 'Admin User', email: 'admin@riviggy.com', password: 'admin123', role: 'admin' },
      { name: 'Test User', email: 'user@riviggy.com', password: 'user123', role: 'user' }
    ];
    const userCount = await User.countDocuments();

    if (userCount === 0) {
      console.log('No users found. Running auto-seed...');
      require('./utils/seed');
      return;
    }

    // Keep demo credentials available without resetting existing data.
    for (const defaultUser of defaultUsers) {
      const exists = await User.exists({ email: defaultUser.email });
      if (!exists) {
        await User.create(defaultUser);
        console.log(`Created missing default ${defaultUser.role} account: ${defaultUser.email}`);
      }
    }
  } catch (err) {
    console.error('Auto-seed check failed:', err.message);
  }
};

// MongoDB connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/riviggy';
global.__DEV_AUTH_STORE__ = false;

// PostgreSQL initialization
const { initializeDatabase } = require('./config/postgresql');

const connectDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000
    });
    console.log('MongoDB connected');
    
    // Initialize PostgreSQL database
    await initializeDatabase();
  } catch (err) {
    const allowMemoryFallback = process.env.ENABLE_IN_MEMORY_DB !== 'false';
    if (!allowMemoryFallback) {
      throw err;
    }

    console.warn('MongoDB connection failed. Falling back to dev auth store for login/signup only.');
    global.__DEV_AUTH_STORE__ = true;
  }
};

connectDatabase()
  .then(async () => {
    if (!global.__DEV_AUTH_STORE__) {
      await autoSeed();
    }
    server.listen(PORT, () => {
      console.log(`riviggy server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });

const gracefulShutdown = async () => {
  try {
    await mongoose.disconnect();
  } catch (err) {
    // ignore
  }

  try {
    server.close(() => {
      process.exit(0);
    });
    // Force exit if close hangs
    setTimeout(() => process.exit(0), 5000);
  } catch (err) {
    process.exit(0);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

module.exports = { app, io };
