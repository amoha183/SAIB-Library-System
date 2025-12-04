import express from 'express';
import db from '../db.js';
import { isAuthenticated, isAdmin } from './authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/books
 * @desc    Get all books with authors, genres, and publisher info
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Get all books with publisher info
    const [books] = await db.query(`
      SELECT 
        b.book_id as id,
        b.isbn,
        b.title,
        b.publication_date,
        YEAR(b.publication_date) as year,
        b.edition,
        b.language,
        b.page_count,
        b.description,
        b.image_uri as image,
        b.total_copies,
        b.available_copies,
        b.available_copies > 0 as isAvailable,
        b.created_at,
        b.updated_at,
        p.publisher_id,
        p.name as publisher_name
      FROM books b
      LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
      ORDER BY b.book_id DESC
    `);

    // Get authors for all books
    const [bookAuthors] = await db.query(`
      SELECT 
        ba.book_id,
        a.author_id,
        CONCAT(a.first_name, ' ', a.last_name) as author_name,
        a.first_name,
        a.last_name
      FROM book_authors ba
      JOIN authors a ON ba.author_id = a.author_id
    `);

    // Get genres for all books
    const [bookGenres] = await db.query(`
      SELECT 
        bg.book_id,
        g.genre_id,
        g.name as genre_name
      FROM book_genres bg
      JOIN genres g ON bg.genre_id = g.genre_id
    `);

    // Get active borrowings for books
    const [activeBorrowings] = await db.query(`
      SELECT 
        br.book_id,
        br.borrowing_id,
        br.member_id,
        br.borrow_date,
        br.due_date,
        CONCAT(m.first_name, ' ', m.last_name) as borrower_name
      FROM borrowings br
      JOIN members m ON br.member_id = m.member_id
      WHERE br.status = 'Borrowed'
    `);

    // Map authors and genres to books
    const booksWithDetails = books.map(book => {
      const authors = bookAuthors
        .filter(ba => ba.book_id === book.id)
        .map(ba => ({
          id: ba.author_id,
          name: ba.author_name,
          firstName: ba.first_name,
          lastName: ba.last_name
        }));

      const genres = bookGenres
        .filter(bg => bg.book_id === book.id)
        .map(bg => ({
          id: bg.genre_id,
          name: bg.genre_name
        }));

      const borrowing = activeBorrowings.find(br => br.book_id === book.id);

      return {
        ...book,
        author: authors.map(a => a.name).join(', ') || 'Unknown',
        authors: authors,
        category: genres.map(g => g.name).join(', ') || 'Uncategorized',
        genres: genres,
        publisher: book.publisher_name ? {
          id: book.publisher_id,
          name: book.publisher_name
        } : null,
        borrowedBy: borrowing ? borrowing.borrower_name : null,
        borrowDate: borrowing ? borrowing.borrow_date : null,
        returnDate: borrowing ? borrowing.due_date : null,
        borrowingId: borrowing ? borrowing.borrowing_id : null
      };
    });

    res.json({
      success: true,
      data: booksWithDetails
    });

  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching books',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/books/:id
 * @desc    Get single book with full details
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get book with publisher info
    const [books] = await db.query(`
      SELECT 
        b.book_id as id,
        b.isbn,
        b.title,
        b.publication_date,
        YEAR(b.publication_date) as year,
        b.edition,
        b.language,
        b.page_count,
        b.description,
        b.image_uri as image,
        b.total_copies,
        b.available_copies,
        b.available_copies > 0 as isAvailable,
        b.created_at,
        b.updated_at,
        p.publisher_id,
        p.name as publisher_name
      FROM books b
      LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
      WHERE b.book_id = ?
    `, [id]);

    if (books.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    const book = books[0];

    // Get authors for this book
    const [authors] = await db.query(`
      SELECT 
        a.author_id as id,
        CONCAT(a.first_name, ' ', a.last_name) as name,
        a.first_name,
        a.last_name
      FROM book_authors ba
      JOIN authors a ON ba.author_id = a.author_id
      WHERE ba.book_id = ?
    `, [id]);

    // Get genres for this book
    const [genres] = await db.query(`
      SELECT 
        g.genre_id as id,
        g.name
      FROM book_genres bg
      JOIN genres g ON bg.genre_id = g.genre_id
      WHERE bg.book_id = ?
    `, [id]);

    // Get active borrowing if any
    const [borrowings] = await db.query(`
      SELECT 
        br.borrowing_id,
        br.member_id,
        br.borrow_date,
        br.due_date,
        CONCAT(m.first_name, ' ', m.last_name) as borrower_name
      FROM borrowings br
      JOIN members m ON br.member_id = m.member_id
      WHERE br.book_id = ? AND br.status = 'Borrowed'
    `, [id]);

    const borrowing = borrowings[0] || null;

    res.json({
      success: true,
      data: {
        ...book,
        author: authors.map(a => a.name).join(', ') || 'Unknown',
        authors: authors,
        category: genres.map(g => g.name).join(', ') || 'Uncategorized',
        genres: genres,
        publisher: book.publisher_name ? {
          id: book.publisher_id,
          name: book.publisher_name
        } : null,
        borrowedBy: borrowing ? borrowing.borrower_name : null,
        borrowDate: borrowing ? borrowing.borrow_date : null,
        returnDate: borrowing ? borrowing.due_date : null,
        borrowingId: borrowing ? borrowing.borrowing_id : null
      }
    });

  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching book',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/books
 * @desc    Create a new book with authors and genres
 * @access  Admin
 */
router.post('/', isAuthenticated, isAdmin, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      isbn,
      title,
      publication_date,
      edition,
      language,
      page_count,
      description,
      image,
      publisher_id,
      total_copies,
      author_ids,  // Array of author IDs
      genre_ids    // Array of genre IDs
    } = req.body;

    // Validate required fields
    if (!isbn || !title) {
      return res.status(400).json({
        success: false,
        message: 'ISBN and title are required'
      });
    }

    // Insert the book
    const [result] = await connection.query(`
      INSERT INTO books (isbn, title, publication_date, edition, language, page_count, description, image_uri, publisher_id, total_copies, available_copies)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      isbn,
      title,
      publication_date || null,
      edition || null,
      language || 'English',
      page_count || null,
      description || null,
      image || null,
      publisher_id || null,
      total_copies || 1,
      total_copies || 1  // Initially all copies are available
    ]);

    const bookId = result.insertId;

    // Insert book-author relationships
    if (author_ids && author_ids.length > 0) {
      const authorValues = author_ids.map(authorId => [bookId, authorId]);
      await connection.query(
        'INSERT INTO book_authors (book_id, author_id) VALUES ?',
        [authorValues]
      );
    }

    // Insert book-genre relationships
    if (genre_ids && genre_ids.length > 0) {
      const genreValues = genre_ids.map(genreId => [bookId, genreId]);
      await connection.query(
        'INSERT INTO book_genres (book_id, genre_id) VALUES ?',
        [genreValues]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: { id: bookId }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error creating book:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'A book with this ISBN already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating book',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

/**
 * @route   PUT /api/books/:id
 * @desc    Update a book
 * @access  Admin
 */
router.put('/:id', isAuthenticated, isAdmin, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const {
      isbn,
      title,
      publication_date,
      edition,
      language,
      page_count,
      description,
      image,
      publisher_id,
      total_copies,
      available_copies,
      author_ids,
      genre_ids
    } = req.body;

    // Check if book exists
    const [existing] = await connection.query('SELECT book_id FROM books WHERE book_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Update the book
    await connection.query(`
      UPDATE books SET
        isbn = COALESCE(?, isbn),
        title = COALESCE(?, title),
        publication_date = COALESCE(?, publication_date),
        edition = COALESCE(?, edition),
        language = COALESCE(?, language),
        page_count = COALESCE(?, page_count),
        description = COALESCE(?, description),
        image_uri = COALESCE(?, image_uri),
        publisher_id = ?,
        total_copies = COALESCE(?, total_copies),
        available_copies = COALESCE(?, available_copies)
      WHERE book_id = ?
    `, [
      isbn, title, publication_date, edition, language, page_count,
      description, image, publisher_id, total_copies, available_copies, id
    ]);

    // Update book-author relationships if provided
    if (author_ids !== undefined) {
      await connection.query('DELETE FROM book_authors WHERE book_id = ?', [id]);
      if (author_ids && author_ids.length > 0) {
        const authorValues = author_ids.map(authorId => [id, authorId]);
        await connection.query(
          'INSERT INTO book_authors (book_id, author_id) VALUES ?',
          [authorValues]
        );
      }
    }

    // Update book-genre relationships if provided
    if (genre_ids !== undefined) {
      await connection.query('DELETE FROM book_genres WHERE book_id = ?', [id]);
      if (genre_ids && genre_ids.length > 0) {
        const genreValues = genre_ids.map(genreId => [id, genreId]);
        await connection.query(
          'INSERT INTO book_genres (book_id, genre_id) VALUES ?',
          [genreValues]
        );
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Book updated successfully'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error updating book:', error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'A book with this ISBN already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating book',
      error: error.message
    });
  } finally {
    connection.release();
  }
});

/**
 * @route   DELETE /api/books/:id
 * @desc    Delete a book
 * @access  Admin
 */
router.delete('/:id', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if book exists
    const [existing] = await db.query('SELECT book_id FROM books WHERE book_id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if book has active borrowings
    const [activeBorrowings] = await db.query(
      'SELECT borrowing_id FROM borrowings WHERE book_id = ? AND status = "Borrowed"',
      [id]
    );

    if (activeBorrowings.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete book with active borrowings. Please return all copies first.'
      });
    }

    // Delete book (cascade will handle book_authors and book_genres)
    await db.query('DELETE FROM books WHERE book_id = ?', [id]);

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting book',
      error: error.message
    });
  }
});

export default router;




