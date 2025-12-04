/**
 * SAIB Library - API Service
 * Centralized API functions for database operations
 */

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Generic fetch wrapper with error handling
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

// ========================================
// BOOKS API
// ========================================

/**
 * Fetch all books from the database
 */
async function fetchBooks() {
  try {
    const response = await apiRequest('/books');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
}

/**
 * Fetch a single book by ID
 */
async function fetchBook(id) {
  try {
    const response = await apiRequest(`/books/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching book:', error);
    throw error;
  }
}

/**
 * Create a new book
 */
async function createBook(bookData) {
  try {
    const response = await apiRequest('/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    });
    return response;
  } catch (error) {
    console.error('Error creating book:', error);
    throw error;
  }
}

/**
 * Update an existing book
 */
async function updateBook(id, bookData) {
  try {
    const response = await apiRequest(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookData),
    });
    return response;
  } catch (error) {
    console.error('Error updating book:', error);
    throw error;
  }
}

/**
 * Delete a book
 */
async function deleteBookApi(id) {
  try {
    const response = await apiRequest(`/books/${id}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Error deleting book:', error);
    throw error;
  }
}

// ========================================
// AUTHORS API
// ========================================

/**
 * Fetch all authors
 */
async function fetchAuthors() {
  try {
    const response = await apiRequest('/authors');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching authors:', error);
    throw error;
  }
}

/**
 * Fetch a single author by ID
 */
async function fetchAuthor(id) {
  try {
    const response = await apiRequest(`/authors/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching author:', error);
    throw error;
  }
}

/**
 * Create a new author
 */
async function createAuthor(authorData) {
  try {
    const response = await apiRequest('/authors', {
      method: 'POST',
      body: JSON.stringify(authorData),
    });
    return response;
  } catch (error) {
    console.error('Error creating author:', error);
    throw error;
  }
}

/**
 * Update an author
 */
async function updateAuthorApi(id, authorData) {
  try {
    const response = await apiRequest(`/authors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(authorData),
    });
    return response;
  } catch (error) {
    console.error('Error updating author:', error);
    throw error;
  }
}

/**
 * Delete an author
 */
async function deleteAuthorApi(id) {
  try {
    const response = await apiRequest(`/authors/${id}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Error deleting author:', error);
    throw error;
  }
}

// ========================================
// GENRES API
// ========================================

/**
 * Fetch all genres
 */
async function fetchGenres() {
  try {
    const response = await apiRequest('/genres');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching genres:', error);
    throw error;
  }
}

/**
 * Fetch a single genre by ID
 */
async function fetchGenre(id) {
  try {
    const response = await apiRequest(`/genres/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching genre:', error);
    throw error;
  }
}

/**
 * Create a new genre
 */
async function createGenre(genreData) {
  try {
    const response = await apiRequest('/genres', {
      method: 'POST',
      body: JSON.stringify(genreData),
    });
    return response;
  } catch (error) {
    console.error('Error creating genre:', error);
    throw error;
  }
}

/**
 * Update a genre
 */
async function updateGenreApi(id, genreData) {
  try {
    const response = await apiRequest(`/genres/${id}`, {
      method: 'PUT',
      body: JSON.stringify(genreData),
    });
    return response;
  } catch (error) {
    console.error('Error updating genre:', error);
    throw error;
  }
}

/**
 * Delete a genre
 */
async function deleteGenreApi(id) {
  try {
    const response = await apiRequest(`/genres/${id}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Error deleting genre:', error);
    throw error;
  }
}

// ========================================
// PUBLISHERS API
// ========================================

/**
 * Fetch all publishers
 */
async function fetchPublishers() {
  try {
    const response = await apiRequest('/publishers');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching publishers:', error);
    throw error;
  }
}

/**
 * Fetch a single publisher by ID
 */
async function fetchPublisher(id) {
  try {
    const response = await apiRequest(`/publishers/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching publisher:', error);
    throw error;
  }
}

/**
 * Create a new publisher
 */
async function createPublisher(publisherData) {
  try {
    const response = await apiRequest('/publishers', {
      method: 'POST',
      body: JSON.stringify(publisherData),
    });
    return response;
  } catch (error) {
    console.error('Error creating publisher:', error);
    throw error;
  }
}

/**
 * Update a publisher
 */
async function updatePublisherApi(id, publisherData) {
  try {
    const response = await apiRequest(`/publishers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(publisherData),
    });
    return response;
  } catch (error) {
    console.error('Error updating publisher:', error);
    throw error;
  }
}

/**
 * Delete a publisher
 */
async function deletePublisherApi(id) {
  try {
    const response = await apiRequest(`/publishers/${id}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Error deleting publisher:', error);
    throw error;
  }
}

// ========================================
// MEMBERS API
// ========================================

/**
 * Fetch all members
 */
async function fetchMembers() {
  try {
    const response = await apiRequest('/members');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching members:', error);
    throw error;
  }
}

/**
 * Fetch a single member by ID
 */
async function fetchMember(id) {
  try {
    const response = await apiRequest(`/members/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching member:', error);
    throw error;
  }
}

/**
 * Create a new member
 */
async function createMember(memberData) {
  try {
    const response = await apiRequest('/members', {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
    return response;
  } catch (error) {
    console.error('Error creating member:', error);
    throw error;
  }
}

/**
 * Update a member
 */
async function updateMemberApi(id, memberData) {
  try {
    const response = await apiRequest(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(memberData),
    });
    return response;
  } catch (error) {
    console.error('Error updating member:', error);
    throw error;
  }
}

/**
 * Delete a member
 */
async function deleteMemberApi(id) {
  try {
    const response = await apiRequest(`/members/${id}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Error deleting member:', error);
    throw error;
  }
}

// ========================================
// ADMINS API
// ========================================

/**
 * Fetch all admins
 */
async function fetchAdmins() {
  try {
    const response = await apiRequest('/admins');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw error;
  }
}

/**
 * Fetch a single admin by ID
 */
async function fetchAdmin(id, type = 'regular') {
  try {
    const response = await apiRequest(`/admins/${id}?type=${type}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching admin:', error);
    throw error;
  }
}

/**
 * Create a new admin
 */
async function createAdmin(adminData) {
  try {
    const response = await apiRequest('/admins', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
    return response;
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error;
  }
}

/**
 * Update an admin
 */
async function updateAdminApi(id, adminData) {
  try {
    const response = await apiRequest(`/admins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(adminData),
    });
    return response;
  } catch (error) {
    console.error('Error updating admin:', error);
    throw error;
  }
}

/**
 * Delete an admin
 */
async function deleteAdminApi(id, type = 'regular') {
  try {
    const response = await apiRequest(`/admins/${id}?type=${type}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Error deleting admin:', error);
    throw error;
  }
}

// ========================================
// BORROWINGS API
// ========================================

/**
 * Fetch all borrowings
 */
async function fetchBorrowings() {
  try {
    const response = await apiRequest('/borrowings');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching borrowings:', error);
    throw error;
  }
}

/**
 * Fetch a single borrowing by ID
 */
async function fetchBorrowing(id) {
  try {
    const response = await apiRequest(`/borrowings/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching borrowing:', error);
    throw error;
  }
}

/**
 * Fetch borrowings for a specific book
 */
async function fetchBookBorrowings(bookId) {
  try {
    const response = await apiRequest(`/borrowings/book/${bookId}`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching book borrowings:', error);
    throw error;
  }
}

/**
 * Fetch borrowings for a specific member
 */
async function fetchMemberBorrowings(memberId) {
  try {
    const response = await apiRequest(`/borrowings/member/${memberId}`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching member borrowings:', error);
    throw error;
  }
}

/**
 * Create a new borrowing (borrow a book)
 */
async function createBorrowing(borrowingData) {
  try {
    const response = await apiRequest('/borrowings', {
      method: 'POST',
      body: JSON.stringify(borrowingData),
    });
    return response;
  } catch (error) {
    console.error('Error creating borrowing:', error);
    throw error;
  }
}

/**
 * Return a borrowed book
 */
async function returnBook(borrowingId, returnData = {}) {
  try {
    const response = await apiRequest(`/borrowings/${borrowingId}/return`, {
      method: 'PUT',
      body: JSON.stringify(returnData),
    });
    return response;
  } catch (error) {
    console.error('Error returning book:', error);
    throw error;
  }
}

/**
 * Update a borrowing record
 */
async function updateBorrowingApi(id, borrowingData) {
  try {
    const response = await apiRequest(`/borrowings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(borrowingData),
    });
    return response;
  } catch (error) {
    console.error('Error updating borrowing:', error);
    throw error;
  }
}

/**
 * Delete a borrowing record
 */
async function deleteBorrowingApi(id) {
  try {
    const response = await apiRequest(`/borrowings/${id}`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Error deleting borrowing:', error);
    throw error;
  }
}

// ========================================
// AUTHENTICATION API
// ========================================

/**
 * Login user
 */
async function loginUser(email, password) {
  try {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
}

/**
 * Logout user
 */
async function logoutUser() {
  try {
    const response = await apiRequest('/auth/logout', {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
}

/**
 * Verify authentication
 */
async function verifyAuth() {
  try {
    const response = await apiRequest('/auth/verify');
    return response;
  } catch (error) {
    console.error('Error verifying auth:', error);
    throw error;
  }
}

/**
 * Register new user
 */
async function registerUser(userData) {
  try {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response;
  } catch (error) {
    console.error('Error registering:', error);
    throw error;
  }
}

// Log initialization
console.log('API Service initialized - Base URL:', API_BASE_URL);




