import express from 'express';
import db from '../db.js';
import { isAuthenticated, isAdmin } from './authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/authors
 * @desc    Get all authors
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const [authors] = await db.query(`
      SELECT 
        author_id as id,
        first_name as firstName,
        last_name as lastName,
        CONCAT(first_name, ' ', last_name) as name,
        middle_name as middleName,
        birth_date as birthDate,
        nationality,
        biography,
        created_at as createdAt
      FROM authors
      ORDER BY last_name, first_name
    `);

    res.json({
      success: true,
      data: authors
    });

  } catch (error) {
    console.error('Error fetching authors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching authors',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/authors/:id
 * @desc    Get single author
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [authors] = await db.query(`
      SELECT 
        author_id as id,
        first_name as firstName,
        last_name as lastName,
        CONCAT(first_name, ' ', last_name) as name,
        middle_name as middleName,
        birth_date as birthDate,
        nationality,
        biography,
        created_at as createdAt
      FROM authors
      WHERE author_id = ?
    `, [id]);

    if (authors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }

    // Get books by this author
    const [books] = await db.query(`
      SELECT 
        b.book_id as id,
        b.title,
        b.isbn
      FROM books b
      JOIN book_authors ba ON b.book_id = ba.book_id
      WHERE ba.author_id = ?
    `, [id]);

    res.json({
      success: true,
      data: {
        ...authors[0],
        books: books
      }
    });

  } catch (error) {
    console.error('Error fetching author:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching author',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/authors
 * @desc    Create a new author
 * @access  Admin
 */
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { firstName, lastName, middleName, birthDate, nationality, biography } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'First name and last name are required'
      });
    }

    const [result] = await db.query(`
      INSERT INTO authors (first_name, last_name, middle_name, birth_date, nationality, biography)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [firstName, lastName, middleName || null, birthDate || null, nationality || null, biography || null]);

    res.status(201).json({
      success: true,
      message: 'Author created successfully',
      data: { id: result.insertId }
    });

  } catch (error) {
    console.error('Error creating author:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating author',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/authors/:id
 * @desc    Update an author
 * @access  Admin
 */
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, middleName, birthDate, nationality, biography } = req.body;

    const [existing] = await db.query('SELECT author_id FROM authors WHERE author_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }

    await db.query(`
      UPDATE authors SET
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        middle_name = ?,
        birth_date = ?,
        nationality = ?,
        biography = ?
      WHERE author_id = ?
    `, [firstName, lastName, middleName, birthDate, nationality, biography, id]);

    res.json({
      success: true,
      message: 'Author updated successfully'
    });

  } catch (error) {
    console.error('Error updating author:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating author',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/authors/:id
 * @desc    Delete an author
 * @access  Admin
 */
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT author_id FROM authors WHERE author_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }

    // Check if author has books
    const [books] = await db.query('SELECT book_id FROM book_authors WHERE author_id = ?', [id]);
    if (books.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete author with associated books. Remove book associations first.'
      });
    }

    await db.query('DELETE FROM authors WHERE author_id = ?', [id]);

    res.json({
      success: true,
      message: 'Author deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting author:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting author',
      error: error.message
    });
  }
});

export default router;







