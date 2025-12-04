import express from 'express';
import cors from 'cors';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './db.js';

// Import all route modules
import authRoutes from './Backend/authRoutes.js';
import booksRoutes from './Backend/booksRoutes.js';
import authorsRoutes from './Backend/authorsRoutes.js';
import genresRoutes from './Backend/genresRoutes.js';
import publishersRoutes from './Backend/publishersRoutes.js';
import membersRoutes from './Backend/membersRoutes.js';
import adminsRoutes from './Backend/adminsRoutes.js';
import borrowingsRoutes from './Backend/borrowingsRoutes.js';

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

// Session configuration
app.use(session({
  secret: 'saib-library-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
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

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', message: error.message });
  }
});

// Debug endpoint to check database data (remove in production)
app.get('/api/debug/admins', async (req, res) => {
  try {
    const [superAdmins] = await db.query('SELECT super_admin_id, first_name, last_name, email FROM super_admins');
    const [admins] = await db.query('SELECT admin_id, first_name, last_name, email FROM admins');
    res.json({
      success: true,
      superAdminsCount: superAdmins.length,
      adminsCount: admins.length,
      superAdmins: superAdmins,
      admins: admins,
      session: {
        userId: req.session?.userId,
        userType: req.session?.userType,
        email: req.session?.email
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

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
  });
}

startServer();

