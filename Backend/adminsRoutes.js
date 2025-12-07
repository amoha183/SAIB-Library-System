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
 * @route   PUT /api/admins/:id/role
 * @desc    Change admin role (move between admins and super_admins tables)
 * @access  Super Admin
 */
router.put('/:id/role', isAuthenticated, isSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { currentRole, newRole, adminType } = req.body;

    if (!currentRole || !newRole) {
      return res.status(400).json({
        success: false,
        message: 'Current role and new role are required'
      });
    }

    // Determine source and target tables
    const isCurrentlySuper = currentRole === 'Super Admin' || adminType === 'super';
    const isBecomingSuper = newRole === 'Super Admin';

    // If role isn't actually changing, just return success
    if (isCurrentlySuper === isBecomingSuper) {
      return res.json({
        success: true,
        message: 'Role unchanged'
      });
    }

    // Prevent a super admin from downgrading themselves
    if (isCurrentlySuper && !isBecomingSuper) {
      const adminId = parseInt(id);
      if (req.session.userType === 'superadmin' && req.session.userId === adminId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot downgrade your own account. Another super admin must change your role.'
        });
      }

      // Ensure at least one super admin remains after downgrade
      const [superAdminCount] = await db.query('SELECT COUNT(*) as count FROM super_admins');
      if (superAdminCount[0].count <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot downgrade the last super admin. At least one super admin must remain.'
        });
      }
    }

    const sourceTable = isCurrentlySuper ? 'super_admins' : 'admins';
    const sourceIdColumn = isCurrentlySuper ? 'super_admin_id' : 'admin_id';
    const targetTable = isBecomingSuper ? 'super_admins' : 'admins';
    const targetIdColumn = isBecomingSuper ? 'super_admin_id' : 'admin_id';

    // Get the admin's current data
    const [adminData] = await db.query(`
      SELECT 
        first_name, last_name, email, password, phone, address, date_of_birth
      FROM ${sourceTable}
      WHERE ${sourceIdColumn} = ?
    `, [id]);

    if (adminData.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    const admin = adminData[0];

    // Check if email already exists in target table
    const [existing] = await db.query(
      `SELECT ${targetIdColumn} FROM ${targetTable} WHERE email = ?`,
      [admin.email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An admin with this email already exists in the target role table'
      });
    }

    // Use transaction to ensure data consistency
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Insert into target table
      const [insertResult] = await connection.query(`
        INSERT INTO ${targetTable} (first_name, last_name, email, password, phone, address, date_of_birth)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        admin.first_name,
        admin.last_name,
        admin.email,
        admin.password,
        admin.phone,
        admin.address,
        admin.date_of_birth
      ]);

      const newId = insertResult.insertId;

      // Delete from source table
      await connection.query(
        `DELETE FROM ${sourceTable} WHERE ${sourceIdColumn} = ?`,
        [id]
      );

      await connection.commit();

      res.json({
        success: true,
        message: `Admin role changed from ${currentRole} to ${newRole} successfully`,
        data: {
          newId: newId,
          newRole: newRole
        }
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error changing admin role:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing admin role',
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

/**
 * @route   PUT /api/admins/:id/role
 * @desc    Change admin role (Admin <-> Super Admin)
 * @access  Super Admin
 */
router.put('/:id/role', isAuthenticated, isSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { currentRole, newRole } = req.body;

    // Validate input
    if (!currentRole || !newRole) {
      return res.status(400).json({
        success: false,
        message: 'Current role and new role are required'
      });
    }

    if (!['Admin', 'Super Admin'].includes(currentRole) || !['Admin', 'Super Admin'].includes(newRole)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be "Admin" or "Super Admin"'
      });
    }

    // No change needed
    if (currentRole === newRole) {
      return res.status(400).json({
        success: false,
        message: 'New role is the same as current role'
      });
    }

    // Prevent changing your own role
    if (req.session.userType === 'superadmin' && currentRole === 'Super Admin' && req.session.userId === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    if (currentRole === 'Admin' && newRole === 'Super Admin') {
      // Promote Admin to Super Admin
      // 1. Get admin data
      const [admins] = await db.query(`
        SELECT first_name, last_name, email, national_id, password, phone, address, date_of_birth
        FROM admins WHERE admin_id = ?
      `, [id]);

      if (admins.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Admin not found'
        });
      }

      const admin = admins[0];

      // 2. Insert into super_admins table
      const [result] = await db.query(`
        INSERT INTO super_admins (first_name, last_name, email, national_id, password, phone, address, date_of_birth)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [admin.first_name, admin.last_name, admin.email, admin.national_id, admin.password, admin.phone, admin.address, admin.date_of_birth]);

      // 3. Delete from admins table
      await db.query('DELETE FROM admins WHERE admin_id = ?', [id]);

      res.json({
        success: true,
        message: 'Admin promoted to Super Admin successfully',
        newId: result.insertId,
        newRole: 'Super Admin'
      });

    } else if (currentRole === 'Super Admin' && newRole === 'Admin') {
      // Demote Super Admin to Admin
      // 1. Check if this is the last super admin
      const [superAdminCount] = await db.query('SELECT COUNT(*) as count FROM super_admins');
      if (superAdminCount[0].count <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot demote the last super admin'
        });
      }

      // 2. Get super admin data
      const [superAdmins] = await db.query(`
        SELECT first_name, last_name, email, national_id, password, phone, address, date_of_birth
        FROM super_admins WHERE super_admin_id = ?
      `, [id]);

      if (superAdmins.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Super Admin not found'
        });
      }

      const superAdmin = superAdmins[0];

      // 3. Insert into admins table (with is_active = true)
      const [result] = await db.query(`
        INSERT INTO admins (first_name, last_name, email, national_id, password, phone, address, date_of_birth, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)
      `, [superAdmin.first_name, superAdmin.last_name, superAdmin.email, superAdmin.national_id, superAdmin.password, superAdmin.phone, superAdmin.address, superAdmin.date_of_birth]);

      // 4. Delete from super_admins table
      await db.query('DELETE FROM super_admins WHERE super_admin_id = ?', [id]);

      res.json({
        success: true,
        message: 'Super Admin demoted to Admin successfully',
        newId: result.insertId,
        newRole: 'Admin'
      });
    }

  } catch (error) {
    console.error('Error changing admin role:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing admin role',
      error: error.message
    });
  }
});

export default router;

