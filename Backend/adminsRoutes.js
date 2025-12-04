import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { isAuthenticated, isSuperAdmin } from './authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/admins
 * @desc    Get all admins (both regular and super)
 * @access  Super Admin (or Admin for read-only)
 */
router.get('/', isAuthenticated, async (req, res) => {
  try {
    // Log for debugging
    console.log('GET /api/admins - User:', req.session.userType, 'ID:', req.session.userId);
    
    // Only super admins and admins can view admin list
    if (req.session.userType !== 'superadmin' && req.session.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required to view administrators'
      });
    }
    
    // Get regular admins
    const [admins] = await db.query(`
      SELECT 
        admin_id as id,
        first_name as firstName,
        last_name as lastName,
        CONCAT(first_name, ' ', last_name) as name,
        email,
        phone,
        address,
        date_of_birth as dateOfBirth,
        is_active as isActive,
        'Admin' as role,
        created_at as createdAt,
        updated_at as updatedAt
      FROM admins
      ORDER BY admin_id DESC
    `);

    // Get super admins
    const [superAdmins] = await db.query(`
      SELECT 
        super_admin_id as id,
        first_name as firstName,
        last_name as lastName,
        CONCAT(first_name, ' ', last_name) as name,
        email,
        phone,
        address,
        date_of_birth as dateOfBirth,
        TRUE as isActive,
        'Super Admin' as role,
        created_at as createdAt,
        updated_at as updatedAt
      FROM super_admins
      ORDER BY super_admin_id DESC
    `);

    console.log('Found admins:', admins.length, 'super admins:', superAdmins.length);

    // Combine and mark with type for identification
    const allAdmins = [
      ...superAdmins.map(a => ({ ...a, adminType: 'super' })),
      ...admins.map(a => ({ ...a, adminType: 'regular' }))
    ];

    res.json({
      success: true,
      data: allAdmins
    });

  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admins',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admins/:id
 * @desc    Get single admin
 * @access  Super Admin
 */
router.get('/:id', isAuthenticated, isSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query; // 'super' or 'regular'

    let admin = null;

    if (type === 'super') {
      const [superAdmins] = await db.query(`
        SELECT 
          super_admin_id as id,
          first_name as firstName,
          last_name as lastName,
          CONCAT(first_name, ' ', last_name) as name,
          email,
          phone,
          address,
          date_of_birth as dateOfBirth,
          TRUE as isActive,
          'Super Admin' as role,
          created_at as createdAt,
          updated_at as updatedAt
        FROM super_admins
        WHERE super_admin_id = ?
      `, [id]);
      admin = superAdmins[0];
    } else {
      const [admins] = await db.query(`
        SELECT 
          admin_id as id,
          first_name as firstName,
          last_name as lastName,
          CONCAT(first_name, ' ', last_name) as name,
          email,
          phone,
          address,
          date_of_birth as dateOfBirth,
          is_active as isActive,
          'Admin' as role,
          created_at as createdAt,
          updated_at as updatedAt
        FROM admins
        WHERE admin_id = ?
      `, [id]);
      admin = admins[0];
    }

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.json({
      success: true,
      data: admin
    });

  } catch (error) {
    console.error('Error fetching admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admins
 * @desc    Create a new admin
 * @access  Super Admin
 */
router.post('/', isAuthenticated, isSuperAdmin, async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, address, dateOfBirth, role } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, and password are required'
      });
    }

    // Check if email already exists in any admin table
    const [existingAdmin] = await db.query('SELECT admin_id FROM admins WHERE email = ?', [email]);
    const [existingSuperAdmin] = await db.query('SELECT super_admin_id FROM super_admins WHERE email = ?', [email]);
    
    if (existingAdmin.length > 0 || existingSuperAdmin.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered as admin'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let result;

    if (role === 'Super Admin') {
      // Create super admin
      [result] = await db.query(`
        INSERT INTO super_admins (first_name, last_name, email, password, phone, address, date_of_birth)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [firstName, lastName, email, hashedPassword, phone || null, address || null, dateOfBirth || null]);
    } else {
      // Create regular admin
      [result] = await db.query(`
        INSERT INTO admins (first_name, last_name, email, password, phone, address, date_of_birth)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [firstName, lastName, email, hashedPassword, phone || null, address || null, dateOfBirth || null]);
    }

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: { 
        id: result.insertId,
        role: role || 'Admin'
      }
    });

  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating admin',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/admins/:id
 * @desc    Update an admin
 * @access  Super Admin
 */
router.put('/:id', isAuthenticated, isSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, password, phone, address, dateOfBirth, isActive, adminType } = req.body;

    const table = adminType === 'super' ? 'super_admins' : 'admins';
    const idColumn = adminType === 'super' ? 'super_admin_id' : 'admin_id';

    const [existing] = await db.query(`SELECT ${idColumn} FROM ${table} WHERE ${idColumn} = ?`, [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Check if new email already exists for another admin
    if (email) {
      const [emailExistsAdmin] = await db.query(
        `SELECT admin_id FROM admins WHERE email = ? AND admin_id != ?`,
        [email, adminType === 'super' ? -1 : id]
      );
      const [emailExistsSuperAdmin] = await db.query(
        `SELECT super_admin_id FROM super_admins WHERE email = ? AND super_admin_id != ?`,
        [email, adminType === 'super' ? id : -1]
      );
      
      if (emailExistsAdmin.length > 0 || emailExistsSuperAdmin.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use by another admin'
        });
      }
    }

    // Build update query dynamically
    let updateFields = [];
    let values = [];

    if (firstName) { updateFields.push('first_name = ?'); values.push(firstName); }
    if (lastName) { updateFields.push('last_name = ?'); values.push(lastName); }
    if (email) { updateFields.push('email = ?'); values.push(email); }
    if (phone !== undefined) { updateFields.push('phone = ?'); values.push(phone); }
    if (address !== undefined) { updateFields.push('address = ?'); values.push(address); }
    if (dateOfBirth !== undefined) { updateFields.push('date_of_birth = ?'); values.push(dateOfBirth); }
    
    // Only regular admins have is_active field
    if (isActive !== undefined && adminType !== 'super') {
      updateFields.push('is_active = ?');
      values.push(isActive);
    }

    // Hash new password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push('password = ?');
      values.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id);

    await db.query(
      `UPDATE ${table} SET ${updateFields.join(', ')} WHERE ${idColumn} = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Admin updated successfully'
    });

  } catch (error) {
    console.error('Error updating admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating admin',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/admins/:id
 * @desc    Delete (deactivate) an admin
 * @access  Super Admin
 */
router.delete('/:id', isAuthenticated, isSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { type } = req.query; // 'super' or 'regular'

    // Prevent deleting yourself
    if (req.session.userType === 'superadmin' && type === 'super' && req.session.userId === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    if (type === 'super') {
      const [existing] = await db.query('SELECT super_admin_id FROM super_admins WHERE super_admin_id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Super admin not found'
        });
      }

      // Check if this is the last super admin
      const [superAdminCount] = await db.query('SELECT COUNT(*) as count FROM super_admins');
      if (superAdminCount[0].count <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last super admin'
        });
      }

      // Hard delete for super admins
      await db.query('DELETE FROM super_admins WHERE super_admin_id = ?', [id]);
    } else {
      const [existing] = await db.query('SELECT admin_id FROM admins WHERE admin_id = ?', [id]);
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }

      // Soft delete - set is_active to false
      await db.query('UPDATE admins SET is_active = FALSE WHERE admin_id = ?', [id]);
    }

    res.json({
      success: true,
      message: type === 'super' ? 'Super admin deleted successfully' : 'Admin deactivated successfully'
    });

  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting admin',
      error: error.message
    });
  }
});

export default router;

