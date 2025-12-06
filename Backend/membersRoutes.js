import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { isAuthenticated, isAdmin } from './authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/members
 * @desc    Get all members/customers
 * @access  Admin
 */
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const [members] = await db.query(`
      SELECT 
        member_id as id,
        first_name as firstName,
        last_name as lastName,
        CONCAT(first_name, ' ', last_name) as name,
        email,
        phone,
        address,
        date_of_birth as dateOfBirth,
        membership_start_date as joinedDate,
        membership_end_date as membershipEndDate,
        is_active as isActive,
        created_at as createdAt,
        updated_at as updatedAt
      FROM members
      ORDER BY member_id DESC
    `);

    res.json({
      success: true,
      data: members
    });

  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching members',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/members/:id
 * @desc    Get single member
 * @access  Admin or Self
 */
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    // Allow access if admin or user requesting their own data
    if (req.session.userType === 'customer' && req.session.userId !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const [members] = await db.query(`
      SELECT 
        member_id as id,
        first_name as firstName,
        last_name as lastName,
        CONCAT(first_name, ' ', last_name) as name,
        email,
        phone,
        address,
        date_of_birth as dateOfBirth,
        membership_start_date as joinedDate,
        membership_end_date as membershipEndDate,
        is_active as isActive,
        created_at as createdAt,
        updated_at as updatedAt
      FROM members
      WHERE member_id = ?
    `, [id]);

    if (members.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Get borrowing history
    const [borrowings] = await db.query(`
      SELECT 
        br.borrowing_id as id,
        br.borrow_date as borrowDate,
        br.due_date as dueDate,
        br.return_date as returnDate,
        br.status,
        br.fine_amount as fineAmount,
        b.book_id as bookId,
        b.title as bookTitle
      FROM borrowings br
      JOIN books b ON br.book_id = b.book_id
      WHERE br.member_id = ?
      ORDER BY br.borrow_date DESC
    `, [id]);

    res.json({
      success: true,
      data: {
        ...members[0],
        borrowings: borrowings
      }
    });

  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching member',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/members
 * @desc    Create a new member
 * @access  Admin
 */
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, address, dateOfBirth } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, and password are required'
      });
    }

    // Check if email already exists
    const [existing] = await db.query('SELECT member_id FROM members WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(`
      INSERT INTO members (first_name, last_name, email, password, phone, address, date_of_birth, membership_start_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE())
    `, [firstName, lastName, email, hashedPassword, phone || null, address || null, dateOfBirth || null]);

    res.status(201).json({
      success: true,
      message: 'Member created successfully',
      data: { id: result.insertId }
    });

  } catch (error) {
    console.error('Error creating member:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating member',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/members/:id
 * @desc    Update a member
 * @access  Admin or Self
 */
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    // Allow access if admin or user updating their own data
    if (req.session.userType === 'customer' && req.session.userId !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { firstName, lastName, email, password, phone, address, dateOfBirth, isActive } = req.body;

    const [existing] = await db.query('SELECT member_id FROM members WHERE member_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Check if new email already exists for another user
    if (email) {
      const [emailExists] = await db.query(
        'SELECT member_id FROM members WHERE email = ? AND member_id != ?',
        [email, id]
      );
      if (emailExists.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use by another member'
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
    
    // Only admins can change active status
    if (isActive !== undefined && (req.session.userType === 'admin' || req.session.userType === 'superadmin')) {
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
      `UPDATE members SET ${updateFields.join(', ')} WHERE member_id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Member updated successfully'
    });

  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating member',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/members/:id
 * @desc    Delete (deactivate) a member
 * @access  Admin
 */
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT member_id FROM members WHERE member_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    // Check for active borrowings
    const [activeBorrowings] = await db.query(
      'SELECT borrowing_id FROM borrowings WHERE member_id = ? AND status = "Borrowed"',
      [id]
    );

    if (activeBorrowings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete member with active borrowings. Return all books first.'
      });
    }

    // Soft delete - set is_active to false
    await db.query('UPDATE members SET is_active = FALSE WHERE member_id = ?', [id]);

    res.json({
      success: true,
      message: 'Member deactivated successfully'
    });

  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting member',
      error: error.message
    });
  }
});

export default router;





