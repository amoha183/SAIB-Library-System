import express from 'express';
import db from '../db.js';
import { isAuthenticated, isAdmin } from './authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/borrowings
 * @desc    Get all borrowings with book and member info
 * @access  Admin
 */
router.get('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const [borrowings] = await db.query(`
      SELECT 
        br.borrowing_id as id,
        br.book_id as bookId,
        br.member_id as memberId,
        br.borrow_date as borrowDate,
        br.due_date as dueDate,
        br.return_date as returnDate,
        br.status,
        br.fine_amount as fineAmount,
        br.notes,
        br.created_at as createdAt,
        br.updated_at as updatedAt,
        b.title as bookTitle,
        b.isbn,
        CONCAT(m.first_name, ' ', m.last_name) as memberName,
        m.email as memberEmail,
        CASE 
          WHEN br.status = 'Borrowed' AND br.due_date < CURDATE() THEN TRUE 
          ELSE FALSE 
        END as isOverdue
      FROM borrowings br
      JOIN books b ON br.book_id = b.book_id
      JOIN members m ON br.member_id = m.member_id
      ORDER BY br.created_at DESC
    `);

    res.json({
      success: true,
      data: borrowings
    });

  } catch (error) {
    console.error('Error fetching borrowings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching borrowings',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/borrowings/:id
 * @desc    Get single borrowing
 * @access  Admin or Member (own borrowings)
 */
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    const [borrowings] = await db.query(`
      SELECT 
        br.borrowing_id as id,
        br.book_id as bookId,
        br.member_id as memberId,
        br.borrow_date as borrowDate,
        br.due_date as dueDate,
        br.return_date as returnDate,
        br.status,
        br.fine_amount as fineAmount,
        br.notes,
        br.created_at as createdAt,
        br.updated_at as updatedAt,
        b.title as bookTitle,
        b.isbn,
        CONCAT(m.first_name, ' ', m.last_name) as memberName,
        m.email as memberEmail,
        CASE 
          WHEN br.status = 'Borrowed' AND br.due_date < CURDATE() THEN TRUE 
          ELSE FALSE 
        END as isOverdue
      FROM borrowings br
      JOIN books b ON br.book_id = b.book_id
      JOIN members m ON br.member_id = m.member_id
      WHERE br.borrowing_id = ?
    `, [id]);

    if (borrowings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Borrowing not found'
      });
    }

    // Check access: admin or own borrowing
    if (req.session.userType === 'customer' && req.session.userId !== borrowings[0].memberId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: borrowings[0]
    });

  } catch (error) {
    console.error('Error fetching borrowing:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching borrowing',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/borrowings/book/:bookId
 * @desc    Get all borrowings for a specific book
 * @access  Public
 */
router.get('/book/:bookId', async (req, res) => {
  try {
    const { bookId } = req.params;

    const [borrowings] = await db.query(`
      SELECT 
        br.borrowing_id as id,
        br.member_id as memberId,
        br.borrow_date as borrowDate,
        br.due_date as dueDate,
        br.return_date as returnDate,
        br.status,
        CONCAT(m.first_name, ' ', m.last_name) as memberName
      FROM borrowings br
      JOIN members m ON br.member_id = m.member_id
      WHERE br.book_id = ?
      ORDER BY br.borrow_date DESC
    `, [bookId]);

    res.json({
      success: true,
      data: borrowings
    });

  } catch (error) {
    console.error('Error fetching book borrowings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching book borrowings',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/borrowings/member/:memberId
 * @desc    Get all borrowings for a specific member
 * @access  Admin or Self
 */
router.get('/member/:memberId', isAuthenticated, async (req, res) => {
  try {
    const { memberId } = req.params;

    // Check access: admin or own borrowings
    if (req.session.userType === 'customer' && req.session.userId !== parseInt(memberId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const [borrowings] = await db.query(`
      SELECT
        br.borrowing_id as id,
        br.book_id as bookId,
        br.borrow_date as borrowDate,
        br.due_date as dueDate,
        br.return_date as returnDate,
        br.status,
        br.fine_amount as fineAmount,
        b.title as bookTitle,
        b.isbn,
        b.image_uri as imageUri,
        CASE
          WHEN br.status = 'Borrowed' AND br.due_date < CURDATE() THEN TRUE
          ELSE FALSE
        END as isOverdue
      FROM borrowings br
      JOIN books b ON br.book_id = b.book_id
      WHERE br.member_id = ?
      ORDER BY br.borrow_date DESC
    `, [memberId]);

    // Get authors for all books in borrowings
    const bookIds = [...new Set(borrowings.map(br => br.bookId))];
    let authorsMap = {};

    if (bookIds.length > 0) {
      const [bookAuthors] = await db.query(`
        SELECT
          ba.book_id,
          CONCAT(a.first_name, ' ', a.last_name) as author_name
        FROM book_authors ba
        JOIN authors a ON ba.author_id = a.author_id
        WHERE ba.book_id IN (?)
      `, [bookIds]);

      // Group authors by book
      bookAuthors.forEach(ba => {
        if (!authorsMap[ba.book_id]) {
          authorsMap[ba.book_id] = [];
        }
        authorsMap[ba.book_id].push(ba.author_name);
      });
    }

    // Add author to each borrowing
    const borrowingsWithAuthors = borrowings.map(br => ({
      ...br,
      author: authorsMap[br.bookId] ? authorsMap[br.bookId].join(', ') : 'Unknown Author'
    }));

    res.json({
      success: true,
      data: borrowingsWithAuthors
    });

  } catch (error) {
    console.error('Error fetching member borrowings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching member borrowings',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/borrowings
 * @desc    Create a new borrowing (check out a book)
 * @access  Admin
 */
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { bookId, memberId, borrowDate, dueDate, notes } = req.body;

    if (!bookId || !memberId || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Book ID, member ID, and due date are required'
      });
    }

    // Check if book exists and has available copies
    const [books] = await connection.query(
      'SELECT book_id, title, available_copies FROM books WHERE book_id = ?',
      [bookId]
    );

    if (books.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    if (books[0].available_copies <= 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'No copies of this book are available'
      });
    }

    // Check if member exists and is active
    const [members] = await connection.query(
      'SELECT member_id, is_active FROM members WHERE member_id = ?',
      [memberId]
    );

    if (members.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    if (!members[0].is_active) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Member account is not active'
      });
    }

    // Check if member already has this book borrowed
    const [existingBorrowing] = await connection.query(
      'SELECT borrowing_id FROM borrowings WHERE book_id = ? AND member_id = ? AND status = "Borrowed"',
      [bookId, memberId]
    );

    if (existingBorrowing.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Member already has this book borrowed'
      });
    }

    // Create borrowing record
    const actualBorrowDate = borrowDate || new Date().toISOString().split('T')[0];
    
    const [result] = await connection.query(`
      INSERT INTO borrowings (book_id, member_id, borrow_date, due_date, status, notes)
      VALUES (?, ?, ?, ?, 'Borrowed', ?)
    `, [bookId, memberId, actualBorrowDate, dueDate, notes || null]);

    // Decrease available copies
    await connection.query(
      'UPDATE books SET available_copies = available_copies - 1 WHERE book_id = ?',
      [bookId]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Book borrowed successfully',
      data: { 
        id: result.insertId,
        bookTitle: books[0].title
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error creating borrowing:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating borrowing',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

/**
 * @route   PUT /api/borrowings/:id/return
 * @desc    Mark a borrowing as returned
 * @access  Admin
 */
router.put('/:id/return', isAuthenticated, isAdmin, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { returnDate, fineAmount, notes } = req.body;

    // Get borrowing info
    const [borrowings] = await connection.query(
      'SELECT borrowing_id, book_id, status, due_date FROM borrowings WHERE borrowing_id = ?',
      [id]
    );

    if (borrowings.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Borrowing not found'
      });
    }

    if (borrowings[0].status !== 'Borrowed') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'This book has already been returned'
      });
    }

    const actualReturnDate = returnDate || new Date().toISOString().split('T')[0];
    const dueDate = new Date(borrowings[0].due_date);
    const returnDateObj = new Date(actualReturnDate);
    
    // Determine status based on return date
    let status = 'Returned';
    if (returnDateObj > dueDate) {
      status = 'Overdue';
    }

    // Update borrowing record
    await connection.query(`
      UPDATE borrowings SET
        return_date = ?,
        status = ?,
        fine_amount = COALESCE(?, fine_amount),
        notes = COALESCE(?, notes)
      WHERE borrowing_id = ?
    `, [actualReturnDate, status, fineAmount, notes, id]);

    // Increase available copies
    await connection.query(
      'UPDATE books SET available_copies = available_copies + 1 WHERE book_id = ?',
      [borrowings[0].book_id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Book returned successfully',
      data: { status }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error returning book:', error);
    res.status(500).json({
      success: false,
      message: 'Error returning book',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

/**
 * @route   PUT /api/borrowings/:id
 * @desc    Update a borrowing (e.g., extend due date)
 * @access  Admin
 */
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { dueDate, fineAmount, notes, status } = req.body;

    const [existing] = await db.query('SELECT borrowing_id FROM borrowings WHERE borrowing_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Borrowing not found'
      });
    }

    let updateFields = [];
    let values = [];

    if (dueDate) { updateFields.push('due_date = ?'); values.push(dueDate); }
    if (fineAmount !== undefined) { updateFields.push('fine_amount = ?'); values.push(fineAmount); }
    if (notes !== undefined) { updateFields.push('notes = ?'); values.push(notes); }
    if (status) { updateFields.push('status = ?'); values.push(status); }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    values.push(id);

    await db.query(
      `UPDATE borrowings SET ${updateFields.join(', ')} WHERE borrowing_id = ?`,
      values
    );

    res.json({
      success: true,
      message: 'Borrowing updated successfully'
    });

  } catch (error) {
    console.error('Error updating borrowing:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating borrowing',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/borrowings/:id
 * @desc    Delete a borrowing record
 * @access  Admin
 */
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;

    // Get borrowing info
    const [borrowings] = await connection.query(
      'SELECT borrowing_id, book_id, status FROM borrowings WHERE borrowing_id = ?',
      [id]
    );

    if (borrowings.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Borrowing not found'
      });
    }

    // If book is still borrowed, return the copy first
    if (borrowings[0].status === 'Borrowed') {
      await connection.query(
        'UPDATE books SET available_copies = available_copies + 1 WHERE book_id = ?',
        [borrowings[0].book_id]
      );
    }

    // Delete the borrowing record
    await connection.query('DELETE FROM borrowings WHERE borrowing_id = ?', [id]);

    await connection.commit();

    res.json({
      success: true,
      message: 'Borrowing record deleted successfully'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error deleting borrowing:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting borrowing',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

export default router;







