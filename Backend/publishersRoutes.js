import express from 'express';
import db from '../db.js';
import { isAuthenticated, isAdmin } from './authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/publishers
 * @desc    Get all publishers
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const [publishers] = await db.query(`
      SELECT 
        publisher_id as id,
        name,
        address,
        phone,
        email,
        website,
        created_at as createdAt
      FROM publishers
      ORDER BY name
    `);

    res.json({
      success: true,
      data: publishers
    });

  } catch (error) {
    console.error('Error fetching publishers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching publishers',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/publishers/:id
 * @desc    Get single publisher
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [publishers] = await db.query(`
      SELECT 
        publisher_id as id,
        name,
        address,
        phone,
        email,
        website,
        created_at as createdAt
      FROM publishers
      WHERE publisher_id = ?
    `, [id]);

    if (publishers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Publisher not found'
      });
    }

    // Get books by this publisher
    const [books] = await db.query(`
      SELECT 
        book_id as id,
        title,
        isbn
      FROM books
      WHERE publisher_id = ?
    `, [id]);

    res.json({
      success: true,
      data: {
        ...publishers[0],
        books: books
      }
    });

  } catch (error) {
    console.error('Error fetching publisher:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching publisher',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/publishers
 * @desc    Create a new publisher
 * @access  Admin
 */
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { name, address, phone, email, website } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Publisher name is required'
      });
    }

    const [result] = await db.query(`
      INSERT INTO publishers (name, address, phone, email, website)
      VALUES (?, ?, ?, ?, ?)
    `, [name, address || null, phone || null, email || null, website || null]);

    res.status(201).json({
      success: true,
      message: 'Publisher created successfully',
      data: { id: result.insertId }
    });

  } catch (error) {
    console.error('Error creating publisher:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'A publisher with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating publisher',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/publishers/:id
 * @desc    Update a publisher
 * @access  Admin
 */
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, phone, email, website } = req.body;

    const [existing] = await db.query('SELECT publisher_id FROM publishers WHERE publisher_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Publisher not found'
      });
    }

    await db.query(`
      UPDATE publishers SET
        name = COALESCE(?, name),
        address = ?,
        phone = ?,
        email = ?,
        website = ?
      WHERE publisher_id = ?
    `, [name, address, phone, email, website, id]);

    res.json({
      success: true,
      message: 'Publisher updated successfully'
    });

  } catch (error) {
    console.error('Error updating publisher:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'A publisher with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating publisher',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/publishers/:id
 * @desc    Delete a publisher
 * @access  Admin
 */
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT publisher_id FROM publishers WHERE publisher_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Publisher not found'
      });
    }

    // Check if publisher has books (books will have NULL publisher_id due to ON DELETE SET NULL)
    // We can safely delete, but let's warn if there are associated books
    const [books] = await db.query('SELECT book_id FROM books WHERE publisher_id = ?', [id]);
    if (books.length > 0) {
      // We'll proceed but let the user know
      console.log(`Deleting publisher ${id} with ${books.length} associated books (will be set to NULL)`);
    }

    await db.query('DELETE FROM publishers WHERE publisher_id = ?', [id]);

    res.json({
      success: true,
      message: 'Publisher deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting publisher:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting publisher',
      error: error.message
    });
  }
});

export default router;







