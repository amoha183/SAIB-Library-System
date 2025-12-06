import express from 'express';
import db from '../db.js';
import { isAuthenticated, isAdmin } from './authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/genres
 * @desc    Get all genres
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const [genres] = await db.query(`
      SELECT 
        genre_id as id,
        name,
        description,
        created_at as createdAt
      FROM genres
      ORDER BY name
    `);

    res.json({
      success: true,
      data: genres
    });

  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching genres',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/genres/:id
 * @desc    Get single genre
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [genres] = await db.query(`
      SELECT 
        genre_id as id,
        name,
        description,
        created_at as createdAt
      FROM genres
      WHERE genre_id = ?
    `, [id]);

    if (genres.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Genre not found'
      });
    }

    // Get books in this genre
    const [books] = await db.query(`
      SELECT 
        b.book_id as id,
        b.title,
        b.isbn
      FROM books b
      JOIN book_genres bg ON b.book_id = bg.book_id
      WHERE bg.genre_id = ?
    `, [id]);

    res.json({
      success: true,
      data: {
        ...genres[0],
        books: books
      }
    });

  } catch (error) {
    console.error('Error fetching genre:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching genre',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/genres
 * @desc    Create a new genre
 * @access  Admin
 */
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Genre name is required'
      });
    }

    const [result] = await db.query(`
      INSERT INTO genres (name, description)
      VALUES (?, ?)
    `, [name, description || null]);

    res.status(201).json({
      success: true,
      message: 'Genre created successfully',
      data: { id: result.insertId }
    });

  } catch (error) {
    console.error('Error creating genre:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'A genre with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating genre',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/genres/:id
 * @desc    Update a genre
 * @access  Admin
 */
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const [existing] = await db.query('SELECT genre_id FROM genres WHERE genre_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Genre not found'
      });
    }

    await db.query(`
      UPDATE genres SET
        name = COALESCE(?, name),
        description = ?
      WHERE genre_id = ?
    `, [name, description, id]);

    res.json({
      success: true,
      message: 'Genre updated successfully'
    });

  } catch (error) {
    console.error('Error updating genre:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'A genre with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating genre',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/genres/:id
 * @desc    Delete a genre
 * @access  Admin
 */
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT genre_id FROM genres WHERE genre_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Genre not found'
      });
    }

    // Check if genre has books
    const [books] = await db.query('SELECT book_id FROM book_genres WHERE genre_id = ?', [id]);
    if (books.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete genre with associated books. Remove book associations first.'
      });
    }

    await db.query('DELETE FROM genres WHERE genre_id = ?', [id]);

    res.json({
      success: true,
      message: 'Genre deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting genre:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting genre',
      error: error.message
    });
  }
});

export default router;





