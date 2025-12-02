/* ========================================
   SAIB LIBRARY - MAIN JAVASCRIPT
   Frontend-only implementation with placeholder backend calls
   ======================================== */

// ========================================
// GLOBAL STATE & DATA
// ========================================

/**
 * Dummy books data - simulates database
 * In production, this will be fetched from backend API
 */
let booksData = [
    {
        id: 1,
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        category: "Fiction",
        year: 1925,
        image: "https://covers.openlibrary.org/b/id/7222246-L.jpg"
    },
    {
        id: 2,
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        category: "Fiction",
        year: 1960,
        image: "https://covers.openlibrary.org/b/id/8228691-L.jpg"
    },
    {
        id: 3,
        title: "1984",
        author: "George Orwell",
        category: "Fiction",
        year: 1949,
        image: "https://covers.openlibrary.org/b/id/7222246-L.jpg"
    },
    {
        id: 4,
        title: "Pride and Prejudice",
        author: "Jane Austen",
        category: "Fiction",
        year: 1813,
        image: "https://covers.openlibrary.org/b/id/8235657-L.jpg"
    },
    {
        id: 5,
        title: "The Catcher in the Rye",
        author: "J.D. Salinger",
        category: "Fiction",
        year: 1951,
        image: "https://covers.openlibrary.org/b/id/8228691-L.jpg"
    },
    {
        id: 6,
        title: "Sapiens",
        author: "Yuval Noah Harari",
        category: "History",
        year: 2011,
        image: "https://covers.openlibrary.org/b/id/8235657-L.jpg"
    },
    {
        id: 7,
        title: "Educated",
        author: "Tara Westover",
        category: "Biography",
        year: 2018,
        image: "https://covers.openlibrary.org/b/id/7222246-L.jpg"
    },
    {
        id: 8,
        title: "Atomic Habits",
        author: "James Clear",
        category: "Self-Help",
        year: 2018,
        image: "https://covers.openlibrary.org/b/id/8228691-L.jpg"
    },
    {
        id: 9,
        title: "The Lean Startup",
        author: "Eric Ries",
        category: "Business",
        year: 2011,
        image: "https://covers.openlibrary.org/b/id/8235657-L.jpg"
    },
    {
        id: 10,
        title: "A Brief History of Time",
        author: "Stephen Hawking",
        category: "Science",
        year: 1988,
        image: "https://covers.openlibrary.org/b/id/7222246-L.jpg"
    }
];

/**
 * Global state for tracking current book being deleted
 */
let bookToDelete = null;

/**
 * Global state for tracking current book being edited
 */
let bookToEdit = null;

/**
 * Global state for storing uploaded image preview
 */
let uploadedImageData = null;

// ========================================
// LOGIN PAGE FUNCTIONS
// ========================================

/**
 * Initialize login page functionality
 * Sets up form validation and submission handler
 */
function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    
    if (!loginForm) return;
    
    // Handle form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });
    
    // Clear error messages on input
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            clearError('emailError');
            clearError('generalError');
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            clearError('passwordError');
            clearError('generalError');
        });
    }
}

/**
 * Handle login form submission
 * Validates inputs and redirects based on email
 */
function handleLogin() {
    // Get form values
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Clear previous errors
    clearError('emailError');
    clearError('passwordError');
    clearError('generalError');
    
    // Validation flags
    let isValid = true;
    
    // Validate email
    if (!email) {
        showError('emailError', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('emailError', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Validate password
    if (!password) {
        showError('passwordError', 'Password is required');
        isValid = false;
    } else if (password.length < 6) {
        showError('passwordError', 'Password must be at least 6 characters');
        isValid = false;
    }
    
    // If validation fails, stop here
    if (!isValid) return;
    
    // Frontend-only authentication logic
    // In production, this will be replaced with actual API call:
    // fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    
    // Simulate authentication delay
    const generalError = document.getElementById('generalError');
    generalError.textContent = 'Logging in...';
    generalError.classList.add('show');
    generalError.style.backgroundColor = '#e3f2fd';
    generalError.style.color = '#1976d2';
    
    setTimeout(() => {
        // Check if email contains "admin" - redirect to admin page
        if (email.toLowerCase().includes('admin')) {
            // Store user type in sessionStorage for future use
            sessionStorage.setItem('userType', 'admin');
            sessionStorage.setItem('userEmail', email);
            window.location.href = 'admin.html';
        } else {
            // Regular user - redirect to customer page
            sessionStorage.setItem('userType', 'customer');
            sessionStorage.setItem('userEmail', email);
            window.location.href = 'customer.html';
        }
    }, 500);
}

/**
 * Validate email format using regex
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Display error message for a specific field
 * @param {string} elementId - ID of error message element
 * @param {string} message - Error message to display
 */
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        if (elementId === 'generalError') {
            errorElement.classList.add('show');
        }
    }
}

/**
 * Clear error message for a specific field
 * @param {string} elementId - ID of error message element
 */
function clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }
}

/**
 * Handle logout action
 * Clears session and redirects to login page
 */
function handleLogout() {
    sessionStorage.clear();
    // In production, call backend logout API:
    // fetch('/api/auth/logout', { method: 'POST' })
}

// ========================================
// ADMIN PAGE FUNCTIONS
// ========================================

/**
 * Initialize admin dashboard
 * Loads and displays books in table format
 */
function initAdminPage() {
    loadBooks();
    renderBooksTable();
    
    // Setup form submission handler
    const bookForm = document.getElementById('bookForm');
    if (bookForm) {
        bookForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleBookFormSubmit();
        });
    }
}

/**
 * Load books from backend (placeholder)
 * In production, this will fetch from API
 */
function loadBooks() {
    // Placeholder for backend API call
    // In production, replace with:
    /*
    fetch('/api/books')
        .then(response => response.json())
        .then(data => {
            booksData = data;
            renderBooksTable();
        })
        .catch(error => {
            console.error('Error loading books:', error);
        });
    */
    
    // For now, we use the dummy data already defined
    console.log('Books loaded (frontend simulation):', booksData.length, 'books');
}

/**
 * Render books in admin table
 * Displays all books with edit/delete actions
 */
function renderBooksTable() {
    const tableBody = document.getElementById('booksTableBody');
    const emptyState = document.getElementById('emptyState');
    
    if (!tableBody) return;
    
    // Clear existing content
    tableBody.innerHTML = '';
    
    // Check if there are books
    if (booksData.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    // Render each book as a table row
    booksData.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.id}</td>
            <td>
                <div class="book-title-with-image">
                    <img src="${book.image || 'https://via.placeholder.com/40x60?text=No+Cover'}" alt="${escapeHtml(book.title)}" class="book-thumbnail">
                    <span>${escapeHtml(book.title)}</span>
                </div>
            </td>
            <td>${escapeHtml(book.author)}</td>
            <td>${escapeHtml(book.category)}</td>
            <td>${book.year}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-edit" onclick="openEditBookModal(${book.id})">
                        Edit
                    </button>
                    <button class="btn btn-sm btn-delete" onclick="openDeleteModal(${book.id})">
                        Delete
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * Open modal for adding new book
 */
function openAddBookModal() {
    bookToEdit = null;
    uploadedImageData = null;
    
    // Update modal title
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.textContent = 'Add New Book';
    
    // Update button text
    const saveBtn = document.getElementById('saveBookBtn');
    if (saveBtn) saveBtn.textContent = 'Save Book';
    
    // Clear form
    document.getElementById('bookForm').reset();
    document.getElementById('bookId').value = '';
    
    // Clear image preview
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) {
        imagePreview.style.display = 'none';
        imagePreview.src = '';
    }
    
    // Show modal
    showModal('bookModal');
}

/**
 * Open modal for editing existing book
 * @param {number} bookId - ID of book to edit
 */
function openEditBookModal(bookId) {
    // Find book by ID
    const book = booksData.find(b => b.id === bookId);
    if (!book) return;
    
    bookToEdit = book;
    uploadedImageData = book.image;
    
    // Update modal title
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.textContent = 'Edit Book';
    
    // Update button text
    const saveBtn = document.getElementById('saveBookBtn');
    if (saveBtn) saveBtn.textContent = 'Update Book';
    
    // Populate form with book data
    document.getElementById('bookId').value = book.id;
    document.getElementById('bookTitle').value = book.title;
    document.getElementById('bookAuthor').value = book.author;
    document.getElementById('bookCategory').value = book.category;
    document.getElementById('bookYear').value = book.year;
    document.getElementById('bookImageUrl').value = book.image || '';
    
    // Show image preview if exists
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview && book.image) {
        imagePreview.src = book.image;
        imagePreview.style.display = 'block';
    }
    
    // Show modal
    showModal('bookModal');
}

/**
 * Handle book form submission (add or edit)
 */
function handleBookFormSubmit() {
    // Get form values
    const bookId = document.getElementById('bookId').value;
    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();
    const category = document.getElementById('bookCategory').value;
    const year = parseInt(document.getElementById('bookYear').value);
    const imageUrl = document.getElementById('bookImageUrl').value.trim();
    
    // Use uploaded image data or URL input
    const image = uploadedImageData || imageUrl || 'https://via.placeholder.com/300x450?text=No+Cover';
    
    // Validate inputs
    if (!title || !author || !category || !year) {
        alert('Please fill in all fields');
        return;
    }
    
    if (year < 1000 || year > 2100) {
        alert('Please enter a valid year');
        return;
    }
    
    if (bookId) {
        // Edit existing book
        updateBook(parseInt(bookId), { title, author, category, year, image });
    } else {
        // Add new book
        addBook({ title, author, category, year, image });
    }
    
    // Close modal
    closeBookModal();
}

/**
 * Add new book to the collection
 * @param {Object} bookData - Book data (title, author, category, year)
 */
function addBook(bookData) {
    // Generate new ID
    const newId = booksData.length > 0 
        ? Math.max(...booksData.map(b => b.id)) + 1 
        : 1;
    
    // Create new book object
    const newBook = {
        id: newId,
        ...bookData
    };
    
    // Placeholder for backend API call
    // In production, replace with:
    /*
    fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBook)
    })
        .then(response => response.json())
        .then(data => {
            booksData.push(data);
            renderBooksTable();
        })
        .catch(error => {
            console.error('Error adding book:', error);
            alert('Failed to add book');
        });
    */
    
    // Frontend simulation
    booksData.push(newBook);
    renderBooksTable();
    
    console.log('Book added (frontend simulation):', newBook);
}

/**
 * Update existing book
 * @param {number} bookId - ID of book to update
 * @param {Object} bookData - Updated book data
 */
function updateBook(bookId, bookData) {
    // Find book index
    const index = booksData.findIndex(b => b.id === bookId);
    if (index === -1) return;
    
    // Update book data
    booksData[index] = {
        id: bookId,
        ...bookData
    };
    
    // Placeholder for backend API call
    // In production, replace with:
    /*
    fetch(`/api/books/${bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData)
    })
        .then(response => response.json())
        .then(data => {
            booksData[index] = data;
            renderBooksTable();
        })
        .catch(error => {
            console.error('Error updating book:', error);
            alert('Failed to update book');
        });
    */
    
    // Frontend simulation
    renderBooksTable();
    
    console.log('Book updated (frontend simulation):', booksData[index]);
}

/**
 * Open delete confirmation modal
 * @param {number} bookId - ID of book to delete
 */
function openDeleteModal(bookId) {
    // Find book by ID
    const book = booksData.find(b => b.id === bookId);
    if (!book) return;
    
    bookToDelete = book;
    
    // Update modal content
    const deleteBookTitle = document.getElementById('deleteBookTitle');
    if (deleteBookTitle) {
        deleteBookTitle.textContent = `"${book.title}" by ${book.author}`;
    }
    
    // Show modal
    showModal('deleteModal');
}

/**
 * Confirm and execute book deletion
 */
function confirmDelete() {
    if (!bookToDelete) return;
    
    deleteBook(bookToDelete.id);
    closeDeleteModal();
}

/**
 * Delete book from collection
 * @param {number} bookId - ID of book to delete
 */
function deleteBook(bookId) {
    // Find book index
    const index = booksData.findIndex(b => b.id === bookId);
    if (index === -1) return;
    
    // Placeholder for backend API call
    // In production, replace with:
    /*
    fetch(`/api/books/${bookId}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (response.ok) {
                booksData.splice(index, 1);
                renderBooksTable();
            }
        })
        .catch(error => {
            console.error('Error deleting book:', error);
            alert('Failed to delete book');
        });
    */
    
    // Frontend simulation
    const deletedBook = booksData.splice(index, 1)[0];
    renderBooksTable();
    
    console.log('Book deleted (frontend simulation):', deletedBook);
}

/**
 * Handle image file upload
 * Converts image to base64 for preview and storage
 */
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB');
        return;
    }
    
    // Read and preview image
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImageData = e.target.result;
        
        // Show preview
        const imagePreview = document.getElementById('imagePreview');
        if (imagePreview) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
        }
    };
    reader.readAsDataURL(file);
}

/**
 * Handle image URL input change
 * Shows preview of the image from URL
 */
function handleImageUrlChange() {
    const imageUrl = document.getElementById('bookImageUrl').value.trim();
    const imagePreview = document.getElementById('imagePreview');
    
    if (imageUrl && imagePreview) {
        uploadedImageData = imageUrl;
        imagePreview.src = imageUrl;
        imagePreview.style.display = 'block';
        
        // Handle image load error
        imagePreview.onerror = function() {
            imagePreview.style.display = 'none';
            alert('Failed to load image from URL');
        };
    } else if (imagePreview) {
        imagePreview.style.display = 'none';
    }
}

/**
 * Close book add/edit modal
 */
function closeBookModal() {
    hideModal('bookModal');
    document.getElementById('bookForm').reset();
    bookToEdit = null;
    uploadedImageData = null;
    
    // Clear image preview
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) {
        imagePreview.style.display = 'none';
        imagePreview.src = '';
    }
}

/**
 * Close delete confirmation modal
 */
function closeDeleteModal() {
    hideModal('deleteModal');
    bookToDelete = null;
}

// ========================================
// CUSTOMER PAGE FUNCTIONS
// ========================================

/**
 * Initialize customer page
 * Loads and displays books in card grid format
 */
function initCustomerPage() {
    loadBooks();
    renderBooksGrid();
}

/**
 * Render books in customer grid view
 * Displays books as cards in responsive grid
 */
function renderBooksGrid(filteredBooks = null) {
    const booksGrid = document.getElementById('booksGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (!booksGrid) return;
    
    // Use filtered books if provided, otherwise use all books
    const books = filteredBooks !== null ? filteredBooks : booksData;
    
    // Clear existing content
    booksGrid.innerHTML = '';
    
    // Check if there are books
    if (books.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    // Render each book as a card
    books.forEach(book => {
        const card = createBookCard(book);
        booksGrid.appendChild(card);
    });
}

/**
 * Create a book card element
 * @param {Object} book - Book data
 * @returns {HTMLElement} - Book card element
 */
function createBookCard(book) {
    const card = document.createElement('div');
    card.className = 'book-card';
    
    card.innerHTML = `
        <div class="book-card-image">
            <img src="${book.image || 'https://via.placeholder.com/300x450?text=No+Cover'}" 
                 alt="${escapeHtml(book.title)}" 
                 class="book-cover"
                 onerror="this.src='https://via.placeholder.com/300x450?text=No+Cover'">
        </div>
        <div class="book-card-content">
            <div class="book-card-header">
                <h3 class="book-title">${escapeHtml(book.title)}</h3>
                <p class="book-author">by ${escapeHtml(book.author)}</p>
            </div>
            <div class="book-card-body">
                <div class="book-meta">
                    <span class="book-meta-label">Year:</span>
                    <span>${book.year}</span>
                </div>
                <span class="book-category">${escapeHtml(book.category)}</span>
            </div>
        </div>
    `;
    
    return card;
}

/**
 * Handle search input in customer view
 * Filters books in real-time based on search query
 */
function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const query = searchInput.value.toLowerCase().trim();
    
    // If search is empty, show all books
    if (!query) {
        renderBooksGrid();
        return;
    }
    
    // Filter books by title, author, or category
    const filteredBooks = booksData.filter(book => {
        return book.title.toLowerCase().includes(query) ||
               book.author.toLowerCase().includes(query) ||
               book.category.toLowerCase().includes(query);
    });
    
    // Render filtered books
    renderBooksGrid(filteredBooks);
}

// ========================================
// MODAL UTILITIES
// ========================================

/**
 * Show modal by ID
 * @param {string} modalId - ID of modal element
 */
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Hide modal by ID
 * @param {string} modalId - ID of modal element
 */
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        // Restore body scroll
        document.body.style.overflow = '';
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Escape HTML to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Format date to readable string
 * @param {Date} date - Date object
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

// ========================================
// EVENT LISTENERS
// ========================================

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        const modal = e.target.closest('.modal');
        if (modal) {
            hideModal(modal.id);
        }
    }
});

// Close modals with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
            hideModal(openModal.id);
        }
    }
});

// ========================================
// INITIALIZATION
// ========================================

// Log initialization
console.log('SAIB Library System - Frontend Initialized');
console.log('Total books in database:', booksData.length);

