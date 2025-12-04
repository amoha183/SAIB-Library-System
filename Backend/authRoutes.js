import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and create session
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // Determine user type and query appropriate table
    let user = null;
    let userType = null;
    let userId = null;

    // Check super_admins table
    const [superAdmins] = await db.query(
      'SELECT super_admin_id as id, first_name, last_name, email, password FROM super_admins WHERE email = ?',
      [email]
    );

    if (superAdmins.length > 0) {
      user = superAdmins[0];
      userType = 'superadmin';
      userId = user.id;
    }

    // If not super admin, check admins table
    if (!user) {
      const [admins] = await db.query(
        'SELECT admin_id as id, first_name, last_name, email, password FROM admins WHERE email = ? AND is_active = TRUE',
        [email]
      );

      if (admins.length > 0) {
        user = admins[0];
        userType = 'admin';
        userId = user.id;
      }
    }

    // If not admin, check members table
    if (!user) {
      const [members] = await db.query(
        'SELECT member_id as id, first_name, last_name, email, password FROM members WHERE email = ? AND is_active = TRUE',
        [email]
      );

      if (members.length > 0) {
        user = members[0];
        userType = 'customer';
        userId = user.id;
      }
    }

    // If user not found in any table
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Create session
    req.session.userId = userId;
    req.session.userType = userType;
    req.session.email = email;
    req.session.name = `${user.first_name} ${user.last_name}`;

    // Return success response
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: userId,
        name: `${user.first_name} ${user.last_name}`,
        email: email,
        type: userType
      },
      redirectTo: userType === 'superadmin' ? '/superadmin.html' : 
                  userType === 'admin' ? '/admin.html' : '/customer.html'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Destroy user session
 * @access  Private
 */
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: 'Error logging out' 
      });
    }
    res.clearCookie('connect.sid');
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  });
});

/**
 * @route   GET /api/auth/verify
 * @desc    Verify if user is authenticated
 * @access  Private
 */
router.get('/verify', (req, res) => {
  if (req.session.userId) {
    res.json({
      success: true,
      authenticated: true,
      user: {
        id: req.session.userId,
        name: req.session.name,
        email: req.session.email,
        type: req.session.userType
      }
    });
  } else {
    res.status(401).json({
      success: false,
      authenticated: false,
      message: 'Not authenticated'
    });
  }
});

/**
 * @route   POST /api/auth/register
 * @desc    Register new member (customer)
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, address, dateOfBirth } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Check if email already exists
    const [existingUsers] = await db.query(
      `SELECT email FROM members WHERE email = ?
       UNION
       SELECT email FROM admins WHERE email = ?
       UNION
       SELECT email FROM super_admins WHERE email = ?`,
      [email, email, email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new member
    const [result] = await db.query(
      `INSERT INTO members (first_name, last_name, email, password, phone, address, date_of_birth, membership_start_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())`,
      [firstName, lastName, email, hashedPassword, phone || null, address || null, dateOfBirth || null]
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      userId: result.insertId
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
});

export default router;





