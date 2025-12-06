import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';

const router = express.Router();

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
};

/**
 * @route   GET /api/profile
 * @desc    Get current user's profile data
 * @access  Private
 */
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { userId, userType } = req.session;
    let profileData = null;

    if (userType === 'superadmin') {
      const [rows] = await db.query(
        `SELECT super_admin_id as id, first_name, last_name, email, phone, address,
                date_of_birth, national_id
         FROM super_admins WHERE super_admin_id = ?`,
        [userId]
      );
      if (rows.length > 0) profileData = rows[0];
    } else if (userType === 'admin') {
      const [rows] = await db.query(
        `SELECT admin_id as id, first_name, last_name, email, phone, address,
                date_of_birth, national_id, is_active
         FROM admins WHERE admin_id = ?`,
        [userId]
      );
      if (rows.length > 0) profileData = rows[0];
    } else if (userType === 'customer') {
      const [rows] = await db.query(
        `SELECT member_id as id, first_name, last_name, email, phone, address,
                date_of_birth, membership_start_date, membership_end_date, is_active
         FROM members WHERE member_id = ?`,
        [userId]
      );
      if (rows.length > 0) profileData = rows[0];
    }

    if (!profileData) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profileData);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile data' });
  }
});

/**
 * @route   PUT /api/profile
 * @desc    Update current user's profile
 * @access  Private
 */
router.put('/', isAuthenticated, async (req, res) => {
  try {
    const { userId, userType } = req.session;
    const { first_name, last_name, phone, address, date_of_birth, national_id } = req.body;

    // Validate required fields
    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    // Validate national ID format for admins (16 digits)
    if ((userType === 'admin' || userType === 'superadmin') && national_id) {
      if (!/^\d{16}$/.test(national_id)) {
        return res.status(400).json({ error: 'National ID must be exactly 16 digits' });
      }
    }

    let updateQuery, updateParams;

    if (userType === 'superadmin') {
      updateQuery = `
        UPDATE super_admins
        SET first_name = ?, last_name = ?, phone = ?, address = ?, date_of_birth = ?, national_id = ?
        WHERE super_admin_id = ?
      `;
      updateParams = [first_name, last_name, phone || null, address || null, date_of_birth || null, national_id || null, userId];
    } else if (userType === 'admin') {
      updateQuery = `
        UPDATE admins
        SET first_name = ?, last_name = ?, phone = ?, address = ?, date_of_birth = ?, national_id = ?
        WHERE admin_id = ?
      `;
      updateParams = [first_name, last_name, phone || null, address || null, date_of_birth || null, national_id || null, userId];
    } else if (userType === 'customer') {
      updateQuery = `
        UPDATE members
        SET first_name = ?, last_name = ?, phone = ?, address = ?, date_of_birth = ?
        WHERE member_id = ?
      `;
      updateParams = [first_name, last_name, phone || null, address || null, date_of_birth || null, userId];
    } else {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    await db.query(updateQuery, updateParams);

    // Update session name
    req.session.name = `${first_name} ${last_name}`;

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * @route   PUT /api/profile/password
 * @desc    Change user's password
 * @access  Private
 */
router.put('/password', isAuthenticated, async (req, res) => {
  try {
    const { userId, userType } = req.session;
    const { current_password, new_password } = req.body;

    // Validate input
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Get current password hash based on user type
    let passwordQuery, table, idColumn;
    if (userType === 'superadmin') {
      table = 'super_admins';
      idColumn = 'super_admin_id';
    } else if (userType === 'admin') {
      table = 'admins';
      idColumn = 'admin_id';
    } else if (userType === 'customer') {
      table = 'members';
      idColumn = 'member_id';
    } else {
      return res.status(400).json({ error: 'Invalid user type' });
    }

    const [rows] = await db.query(
      `SELECT password FROM ${table} WHERE ${idColumn} = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(current_password, rows[0].password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(new_password, saltRounds);

    // Update password
    await db.query(
      `UPDATE ${table} SET password = ? WHERE ${idColumn} = ?`,
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

export default router;
