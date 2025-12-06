import express from 'express';
import cors from 'cors';
import session from 'express-session';
import mysqlSession from 'express-mysql-session';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
import db from './db.js';

// Create MySQL session store
const MySQLStore = mysqlSession(session);
const sessionStoreOptions = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3307,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'library_db_1',
  clearExpired: true,
  checkExpirationInterval: 900000, // 15 minutes
  expiration: 86400000, // 24 hours
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
};
const sessionStore = new MySQLStore(sessionStoreOptions);

// Import all route modules
import authRoutes from './Backend/authRoutes.js';
import booksRoutes from './Backend/booksRoutes.js';
import authorsRoutes from './Backend/authorsRoutes.js';
import genresRoutes from './Backend/genresRoutes.js';
import publishersRoutes from './Backend/publishersRoutes.js';
import membersRoutes from './Backend/membersRoutes.js';
import adminsRoutes from './Backend/adminsRoutes.js';
import borrowingsRoutes from './Backend/borrowingsRoutes.js';
import profileRoutes from './Backend/profileRoutes.js';

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration with MySQL store
app.use(session({
  key: 'saib_session_cookie',
  secret: process.env.SESSION_SECRET || 'default-dev-secret-change-in-production',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Auto-enable in production
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, 'frontend')));

// Test database connection
async function testDatabaseConnection() {
  try {
    const connection = await db.getConnection();
    console.log('✅ Database connected successfully!');
    console.log(`   Host: localhost`);
    console.log(`   Database: library_db_1`);
    console.log(`   Port: 3307`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// API Routes
// Authentication routes
app.use('/api/auth', authRoutes);

// Resource routes (all data from database)
app.use('/api/books', booksRoutes);
app.use('/api/authors', authorsRoutes);
app.use('/api/genres', genresRoutes);
app.use('/api/publishers', publishersRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/admins', adminsRoutes);
app.use('/api/borrowings', borrowingsRoutes);
app.use('/api/profile', profileRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', message: error.message });
  }
});

// Debug endpoint - DISABLED for security (was exposing admin data without auth)
// To re-enable for development, uncomment and add authentication middleware
// app.get('/api/debug/admins', isAuthenticated, isSuperAdmin, async (req, res) => { ... });

// Serve the main frontend page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start server
async function startServer() {
  console.log('\n🚀 Starting SAIB Library System...\n');
  
  // Test database connection first
  const dbConnected = await testDatabaseConnection();
  
  if (!dbConnected) {
    console.log('\n⚠️  Server will start but database features may not work.');
    console.log('   Please check your MySQL server is running on port 3307.\n');
  }
  
  app.listen(PORT, () => {
    console.log(`\n📚 SAIB Library System is running!`);
    console.log(`   Server: http://localhost:${PORT}`);
    console.log(`   Health Check: http://localhost:${PORT}/api/health\n`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${PORT} is already in use!`);
      console.error(`   Another process is using port ${PORT}.`);
      console.error(`   Please either:`);
      console.error(`   1. Stop the other process using port ${PORT}`);
      console.error(`   2. Change the PORT in your .env file or environment variables\n`);
      process.exit(1);
    } else {
      console.error('\n❌ Server error:', err.message);
      process.exit(1);
    }
  });
}

startServer();

