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
        image: "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg",
        description: "The Great Gatsby is a 1925 novel by American writer F. Scott Fitzgerald. Set in the Jazz Age on Long Island, near New York City, the novel depicts first-person narrator Nick Carraway's interactions with mysterious millionaire Jay Gatsby and Gatsby's obsession to reunite with his former lover, Daisy Buchanan.",
        isAvailable: true,
        borrowedBy: null,
        borrowDate: null,
        returnDate: null
    },
    {
        id: 2,
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        category: "Fiction",
        year: 1960,
        image: "https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg",
        description: "To Kill a Mockingbird is a novel by the American author Harper Lee. It was published in 1960 and was instantly successful. The plot and characters are loosely based on Lee's observations of her family, her neighbors and an event that occurred near her hometown of Monroeville, Alabama, in 1936, when she was ten.",
        isAvailable: false,
        borrowedBy: "John Doe",
        borrowDate: "2024-11-20",
        returnDate: "2024-12-20"
    },
    {
        id: 3,
        title: "1984",
        author: "George Orwell",
        category: "Fiction",
        year: 1949,
        image: "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg",
        description: "1984 is a dystopian social science fiction novel and cautionary tale by English writer George Orwell. It was published on 8 June 1949 as Orwell's ninth and final book completed in his lifetime. The story takes place in an imagined future, the year 1984, when much of the world has fallen victim to perpetual war, omnipresent government surveillance, historical negationism, and propaganda.",
        isAvailable: true,
        borrowedBy: null,
        borrowDate: null,
        returnDate: null
    },
    {
        id: 4,
        title: "Pride and Prejudice",
        author: "Jane Austen",
        category: "Fiction",
        year: 1813,
        image: "https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg",
        description: "Pride and Prejudice is an 1813 novel of manners by Jane Austen. The novel follows the character development of Elizabeth Bennet, the dynamic protagonist who learns about the repercussions of hasty judgments and comes to appreciate the difference between superficial goodness and actual goodness.",
        isAvailable: false,
        borrowedBy: "Jane Smith",
        borrowDate: "2024-11-25",
        returnDate: "2024-12-15"
    },
    {
        id: 5,
        title: "The Catcher in the Rye",
        author: "J.D. Salinger",
        category: "Fiction",
        year: 1951,
        image: "https://covers.openlibrary.org/b/isbn/9780316769488-L.jpg",
        description: "The Catcher in the Rye is a novel by J. D. Salinger. A controversial novel originally published for adults, it has since become popular with adolescent readers for its themes of teenage angst and alienation. The novel's protagonist Holden Caulfield has become an icon for teenage rebellion.",
        isAvailable: true,
        borrowedBy: null,
        borrowDate: null,
        returnDate: null
    },
    {
        id: 6,
        title: "Sapiens",
        author: "Yuval Noah Harari",
        category: "History",
        year: 2011,
        image: "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg",
        description: "Sapiens: A Brief History of Humankind is a book by Yuval Noah Harari, first published in Hebrew in Israel in 2011 based on a series of lectures Harari taught at The Hebrew University of Jerusalem. The book surveys the history of humankind from the evolution of archaic human species in the Stone Age up to the twenty-first century.",
        isAvailable: true,
        borrowedBy: null,
        borrowDate: null,
        returnDate: null
    },
    {
        id: 7,
        title: "Educated",
        author: "Tara Westover",
        category: "Biography",
        year: 2018,
        image: "https://covers.openlibrary.org/b/isbn/9780399590504-L.jpg",
        description: "Educated is a memoir by the American author Tara Westover. It tells the story of her quest for knowledge, despite growing up in a survivalist family in rural Idaho who were opposed to public education. She taught herself enough mathematics and grammar to be admitted to Brigham Young University, where she studied history, learning for the first time about important world events.",
        isAvailable: true,
        borrowedBy: null,
        borrowDate: null,
        returnDate: null
    },
    {
        id: 8,
        title: "Atomic Habits",
        author: "James Clear",
        category: "Self-Help",
        year: 2018,
        image: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
        description: "Atomic Habits is a self-help book by James Clear. The book describes a number of ideas, including the aggregation of marginal gains, which is the idea that if you improve by just 1% each day, you'll end up with results that are nearly 37 times better after one year.",
        isAvailable: true,
        borrowedBy: null,
        borrowDate: null,
        returnDate: null
    },
    {
        id: 9,
        title: "The Lean Startup",
        author: "Eric Ries",
        category: "Business",
        year: 2011,
        image: "https://covers.openlibrary.org/b/isbn/9780307887894-L.jpg",
        description: "The Lean Startup is a book by Eric Ries describing his proposed lean startup strategy for startup companies. The book consists primarily of interviews with entrepreneurs, managers, and investors who describe their experiences with the lean startup approach.",
        isAvailable: true,
        borrowedBy: null,
        borrowDate: null,
        returnDate: null
    },
    {
        id: 10,
        title: "A Brief History of Time",
        author: "Stephen Hawking",
        category: "Science",
        year: 1988,
        image: "https://covers.openlibrary.org/b/isbn/9780553380163-L.jpg",
        description: "A Brief History of Time: From the Big Bang to Black Holes is a book on theoretical cosmology by English physicist Stephen Hawking. It became a best-seller and sold more than 25 million copies. The book discusses the history of cosmology and the underlying physics theories on which modern cosmology is based.",
        isAvailable: true,
        borrowedBy: null,
        borrowDate: null,
        returnDate: null
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
 * Global state for tracking current book being borrowed/returned
 */
let bookToBorrow = null;

/**
 * Global state for storing uploaded image preview
 */
let uploadedImageData = null;

/**
 * Global state for current sort option
 */
let currentSortOption = 'default';

/**
 * Global state for customers data
 */
let customersData = [
    {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1 234-567-8901",
        joinedDate: "2024-01-15",
        password: "password123"
    },
    {
        id: 2,
        name: "Jane Smith",
        email: "jane.smith@example.com",
        phone: "+1 234-567-8902",
        joinedDate: "2024-02-20",
        password: "password123"
    },
    {
        id: 3,
        name: "Mike Johnson",
        email: "mike.johnson@example.com",
        phone: "+1 234-567-8903",
        joinedDate: "2024-03-10",
        password: "password123"
    }
];

/**
 * Global state for admins data
 */
let adminsData = [
    {
        id: 1,
        name: "Admin User",
        email: "admin@saib.com",
        phone: "+1 234-567-9001",
        role: "Admin",
        password: "admin123"
    },
    {
        id: 2,
        name: "Super Admin",
        email: "superadmin@saib.com",
        phone: "+1 234-567-9002",
        role: "Super Admin",
        password: "superadmin123"
    }
];

/**
 * Global state for tracking current user being edited/deleted
 */
let userToEdit = null;
let userToDelete = null;
let deleteItemType = null;

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
        // Check if email contains "superadmin" - redirect to superadmin page
        if (email.toLowerCase().includes('superadmin')) {
            sessionStorage.setItem('userType', 'superadmin');
            sessionStorage.setItem('userEmail', email);
            window.location.href = 'superadmin.html';
        }
        // Check if email contains "admin" - redirect to admin page
        else if (email.toLowerCase().includes('admin')) {
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
    
    // Setup book form submission handler
    const bookForm = document.getElementById('bookForm');
    if (bookForm) {
        bookForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleBookFormSubmit();
        });
    }
    
    // Setup borrow form submission handler
    const borrowForm = document.getElementById('borrowForm');
    if (borrowForm) {
        borrowForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleBorrowFormSubmit();
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
    const emptyState = document.getElementById('emptyState') || document.getElementById('booksEmptyState');
    
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
        const statusBadge = book.isAvailable 
            ? '<span class="status-badge status-available">Available</span>'
            : '<span class="status-badge status-borrowed">Borrowed</span>';
        
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
            <td>${statusBadge}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-edit" onclick="openEditBookModal(${book.id})">
                        Edit
                    </button>
                    <button class="btn btn-sm ${book.isAvailable ? 'btn-warning' : 'btn-success'}" onclick="openBorrowModal(${book.id})">
                        ${book.isAvailable ? 'Mark Borrowed' : 'Mark Returned'}
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
    document.getElementById('bookDescription').value = book.description || '';
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
    const description = document.getElementById('bookDescription').value.trim();
    const imageUrl = document.getElementById('bookImageUrl').value.trim();
    
    // Use uploaded image data or URL input
    const image = uploadedImageData || imageUrl || 'https://via.placeholder.com/300x450?text=No+Cover';
    
    // Validate inputs
    if (!title || !author || !category || !year || !description) {
        alert('Please fill in all fields');
        return;
    }
    
    if (year < 1000 || year > 2100) {
        alert('Please enter a valid year');
        return;
    }
    
    if (bookId) {
        // Edit existing book
        updateBook(parseInt(bookId), { title, author, category, year, description, image });
    } else {
        // Add new book
        addBook({ title, author, category, year, description, image });
    }
    
    // Close modal
    closeBookModal();
}

/**
 * Add new book to the collection
 * @param {Object} bookData - Book data (title, author, category, year, description)
 */
function addBook(bookData) {
    // Generate new ID
    const newId = booksData.length > 0 
        ? Math.max(...booksData.map(b => b.id)) + 1 
        : 1;
    
    // Create new book object with default availability
    const newBook = {
        id: newId,
        ...bookData,
        isAvailable: true,
        borrowedBy: null,
        borrowDate: null,
        returnDate: null
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
    
    // Preserve availability data when updating
    const existingBook = booksData[index];
    
    // Update book data
    booksData[index] = {
        id: bookId,
        ...bookData,
        isAvailable: existingBook.isAvailable,
        borrowedBy: existingBook.borrowedBy,
        borrowDate: existingBook.borrowDate,
        returnDate: existingBook.returnDate
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

/**
 * Open borrow/return modal
 * @param {number} bookId - ID of book to borrow/return
 */
function openBorrowModal(bookId) {
    const book = booksData.find(b => b.id === bookId);
    if (!book) return;
    
    bookToBorrow = book;
    
    const modalTitle = document.getElementById('borrowModalTitle');
    const borrowFormContent = document.getElementById('borrowFormContent');
    const returnFormContent = document.getElementById('returnFormContent');
    const saveBtn = document.getElementById('saveBorrowBtn');
    
    document.getElementById('borrowBookId').value = bookId;
    
    if (book.isAvailable) {
        // Book is available - show borrow form
        if (modalTitle) modalTitle.textContent = 'Mark Book as Borrowed';
        if (borrowFormContent) borrowFormContent.style.display = 'block';
        if (returnFormContent) returnFormContent.style.display = 'none';
        if (saveBtn) saveBtn.textContent = 'Mark as Borrowed';
        
        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        const returnDate = new Date();
        returnDate.setDate(returnDate.getDate() + 30); // 30 days from now
        
        document.getElementById('borrowDate').value = today;
        document.getElementById('returnDate').value = returnDate.toISOString().split('T')[0];
        document.getElementById('borrowerName').value = '';
    } else {
        // Book is borrowed - show return confirmation
        if (modalTitle) modalTitle.textContent = 'Mark Book as Returned';
        if (borrowFormContent) borrowFormContent.style.display = 'none';
        if (returnFormContent) returnFormContent.style.display = 'block';
        if (saveBtn) saveBtn.textContent = 'Mark as Returned';
        
        // Display current borrow info
        document.getElementById('displayBorrower').textContent = book.borrowedBy || 'N/A';
        document.getElementById('displayBorrowDate').textContent = formatDate(book.borrowDate);
        document.getElementById('displayReturnDate').textContent = formatDate(book.returnDate);
    }
    
    showModal('borrowModal');
}

/**
 * Handle borrow form submission
 */
function handleBorrowFormSubmit() {
    const bookId = parseInt(document.getElementById('borrowBookId').value);
    const book = booksData.find(b => b.id === bookId);
    
    if (!book) return;
    
    if (book.isAvailable) {
        // Mark as borrowed
        const borrowerName = document.getElementById('borrowerName').value.trim();
        const borrowDate = document.getElementById('borrowDate').value;
        const returnDate = document.getElementById('returnDate').value;
        
        if (!borrowerName || !borrowDate || !returnDate) {
            alert('Please fill in all fields');
            return;
        }
        
        // Validate dates
        if (new Date(returnDate) <= new Date(borrowDate)) {
            alert('Return date must be after borrow date');
            return;
        }
        
        markBookAsBorrowed(bookId, borrowerName, borrowDate, returnDate);
    } else {
        // Mark as returned
        markBookAsReturned(bookId);
    }
    
    closeBorrowModal();
}

/**
 * Mark book as borrowed
 * @param {number} bookId - ID of book
 * @param {string} borrowerName - Name of borrower
 * @param {string} borrowDate - Borrow date
 * @param {string} returnDate - Expected return date
 */
function markBookAsBorrowed(bookId, borrowerName, borrowDate, returnDate) {
    const index = booksData.findIndex(b => b.id === bookId);
    if (index === -1) return;
    
    booksData[index].isAvailable = false;
    booksData[index].borrowedBy = borrowerName;
    booksData[index].borrowDate = borrowDate;
    booksData[index].returnDate = returnDate;
    
    // Re-render tables and grids
    renderBooksTable();
    renderBooksGrid();
    
    console.log('Book marked as borrowed:', booksData[index]);
}

/**
 * Mark book as returned
 * @param {number} bookId - ID of book
 */
function markBookAsReturned(bookId) {
    const index = booksData.findIndex(b => b.id === bookId);
    if (index === -1) return;
    
    booksData[index].isAvailable = true;
    booksData[index].borrowedBy = null;
    booksData[index].borrowDate = null;
    booksData[index].returnDate = null;
    
    // Re-render tables and grids
    renderBooksTable();
    renderBooksGrid();
    
    console.log('Book marked as returned:', booksData[index]);
}

/**
 * Close borrow modal
 */
function closeBorrowModal() {
    hideModal('borrowModal');
    document.getElementById('borrowForm').reset();
    bookToBorrow = null;
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
    card.onclick = () => openBookDetailsModal(book.id);
    
    // Determine availability status
    const availabilityBadge = book.isAvailable 
        ? '<span class="availability-badge available">Available</span>'
        : '<span class="availability-badge not-available">Not Available</span>';
    
    // Format return date if book is borrowed
    const returnInfo = !book.isAvailable && book.returnDate
        ? `<div class="return-info">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="return-icon">
                   <circle cx="12" cy="12" r="10"></circle>
                   <polyline points="12 6 12 12 16 14"></polyline>
               </svg>
               <span>Expected back: ${formatDate(book.returnDate)}</span>
           </div>`
        : '';
    
    card.innerHTML = `
        <div class="book-card-image">
            <img src="${book.image || 'https://via.placeholder.com/300x450?text=No+Cover'}" 
                 alt="${escapeHtml(book.title)}" 
                 class="book-cover"
                 onerror="this.src='https://via.placeholder.com/300x450?text=No+Cover'">
            ${availabilityBadge}
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
                ${returnInfo}
            </div>
        </div>
    `;
    
    return card;
}

/**
 * Open book details modal in customer view
 * @param {number} bookId - ID of book to display
 */
function openBookDetailsModal(bookId) {
    const book = booksData.find(b => b.id === bookId);
    if (!book) return;
    
    // Update modal content
    document.getElementById('detailBookImage').src = book.image || 'https://via.placeholder.com/300x450?text=No+Cover';
    document.getElementById('detailBookTitle').textContent = book.title;
    document.getElementById('detailBookAuthor').textContent = book.author;
    document.getElementById('detailBookCategory').textContent = book.category;
    document.getElementById('detailBookYear').textContent = book.year;
    document.getElementById('detailBookDescription').textContent = book.description || 'No description available.';
    
    // Update availability status
    const statusElement = document.getElementById('detailBookStatus');
    if (book.isAvailable) {
        statusElement.innerHTML = '<span class="status-badge status-available">Available</span>';
    } else {
        statusElement.innerHTML = `
            <span class="status-badge status-borrowed">Not Available</span>
            <p class="detail-return-info">Expected back: ${formatDate(book.returnDate)}</p>
        `;
    }
    
    showModal('bookDetailsModal');
}

/**
 * Close book details modal
 */
function closeBookDetailsModal() {
    hideModal('bookDetailsModal');
}

/**
 * Handle search input in customer view
 * Filters books in real-time based on search query
 */
function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const query = searchInput.value.toLowerCase().trim();
    
    // If search is empty, show all books with current sort
    if (!query) {
        const sortedBooks = sortBooks(booksData, currentSortOption);
        renderBooksGrid(sortedBooks);
        return;
    }
    
    // Filter books by title, author, or category
    const filteredBooks = booksData.filter(book => {
        return book.title.toLowerCase().includes(query) ||
               book.author.toLowerCase().includes(query) ||
               book.category.toLowerCase().includes(query);
    });
    
    // Apply current sort to filtered books
    const sortedFilteredBooks = sortBooks(filteredBooks, currentSortOption);
    
    // Render filtered and sorted books
    renderBooksGrid(sortedFilteredBooks);
}

/**
 * Handle sort selection change
 * Sorts books based on selected option
 */
function handleSort() {
    const sortSelect = document.getElementById('sortSelect');
    if (!sortSelect) return;
    
    currentSortOption = sortSelect.value;
    
    // Get current search query if any
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    // Filter books if there's a search query
    let booksToSort = booksData;
    if (query) {
        booksToSort = booksData.filter(book => {
            return book.title.toLowerCase().includes(query) ||
                   book.author.toLowerCase().includes(query) ||
                   book.category.toLowerCase().includes(query);
        });
    }
    
    // Sort the books
    const sortedBooks = sortBooks(booksToSort, currentSortOption);
    
    // Render sorted books
    renderBooksGrid(sortedBooks);
}

/**
 * Sort books based on selected option
 * @param {Array} books - Array of books to sort
 * @param {string} sortOption - Sort option (e.g., 'title-asc', 'year-desc')
 * @returns {Array} - Sorted array of books
 */
function sortBooks(books, sortOption) {
    // Create a copy to avoid mutating original array
    const sortedBooks = [...books];
    
    switch (sortOption) {
        case 'title-asc':
            return sortedBooks.sort((a, b) => a.title.localeCompare(b.title));
        
        case 'title-desc':
            return sortedBooks.sort((a, b) => b.title.localeCompare(a.title));
        
        case 'author-asc':
            return sortedBooks.sort((a, b) => a.author.localeCompare(b.author));
        
        case 'author-desc':
            return sortedBooks.sort((a, b) => b.author.localeCompare(a.author));
        
        case 'year-asc':
            return sortedBooks.sort((a, b) => a.year - b.year);
        
        case 'year-desc':
            return sortedBooks.sort((a, b) => b.year - a.year);
        
        case 'category-asc':
            return sortedBooks.sort((a, b) => a.category.localeCompare(b.category));
        
        case 'category-desc':
            return sortedBooks.sort((a, b) => b.category.localeCompare(a.category));
        
        case 'default':
        default:
            // Return books in their original order (by ID)
            return sortedBooks.sort((a, b) => a.id - b.id);
    }
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
 * @param {Date|string} date - Date object or date string
 * @returns {string} - Formatted date string
 */
function formatDate(date) {
    if (!date) return 'N/A';
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
// SUPER ADMIN PAGE FUNCTIONS
// ========================================

/**
 * Initialize super admin dashboard
 * Sets up all tabs and loads initial data
 */
function initSuperAdminPage() {
    loadBooks();
    renderBooksTable();
    renderCustomersTable();
    renderAdminsTable();
    
    // Setup book form submission handler
    const bookForm = document.getElementById('bookForm');
    if (bookForm) {
        bookForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleBookFormSubmit();
        });
    }
    
    // Setup user form submission handler
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleUserFormSubmit();
        });
    }
    
    // Setup borrow form submission handler
    const borrowForm = document.getElementById('borrowForm');
    if (borrowForm) {
        borrowForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleBorrowFormSubmit();
        });
    }
}

/**
 * Switch between tabs in super admin dashboard
 * @param {string} tabName - Name of tab to switch to ('books', 'customers', 'admins')
 */
function switchTab(tabName) {
    // Remove active class from all tabs
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab
    const activeButton = Array.from(tabButtons).find(btn => 
        btn.textContent.toLowerCase().includes(tabName)
    );
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Show corresponding content
    const contentMap = {
        'books': 'booksTab',
        'customers': 'customersTab',
        'admins': 'adminsTab'
    };
    
    const activeContent = document.getElementById(contentMap[tabName]);
    if (activeContent) {
        activeContent.classList.add('active');
    }
}

/**
 * Render customers in table
 */
function renderCustomersTable() {
    const tableBody = document.getElementById('customersTableBody');
    const emptyState = document.getElementById('customersEmptyState');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (customersData.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    customersData.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.id}</td>
            <td>${escapeHtml(customer.name)}</td>
            <td>${escapeHtml(customer.email)}</td>
            <td>${escapeHtml(customer.phone)}</td>
            <td>${formatDate(customer.joinedDate)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-edit" onclick="openEditUserModal(${customer.id}, 'customer')">
                        Edit
                    </button>
                    <button class="btn btn-sm btn-delete" onclick="openDeleteUserModal(${customer.id}, 'customer')">
                        Delete
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * Render admins in table
 */
function renderAdminsTable() {
    const tableBody = document.getElementById('adminsTableBody');
    const emptyState = document.getElementById('adminsEmptyState');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (adminsData.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    adminsData.forEach(admin => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${admin.id}</td>
            <td>${escapeHtml(admin.name)}</td>
            <td>${escapeHtml(admin.email)}</td>
            <td>${escapeHtml(admin.phone)}</td>
            <td><span class="badge badge-admin">${escapeHtml(admin.role)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-edit" onclick="openEditUserModal(${admin.id}, 'admin')">
                        Edit
                    </button>
                    <button class="btn btn-sm btn-delete" onclick="openDeleteUserModal(${admin.id}, 'admin')">
                        Delete
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * Open modal for adding new user (customer or admin)
 * @param {string} type - Type of user ('customer' or 'admin')
 */
function openAddUserModal(type) {
    userToEdit = null;
    
    const modalTitle = document.getElementById('userModalTitle');
    const saveBtn = document.getElementById('saveUserBtn');
    const roleGroup = document.getElementById('roleGroup');
    
    if (type === 'customer') {
        if (modalTitle) modalTitle.textContent = 'Add New Customer';
        if (saveBtn) saveBtn.textContent = 'Save Customer';
        if (roleGroup) roleGroup.style.display = 'none';
    } else {
        if (modalTitle) modalTitle.textContent = 'Add New Administrator';
        if (saveBtn) saveBtn.textContent = 'Save Administrator';
        if (roleGroup) roleGroup.style.display = 'block';
    }
    
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('userType').value = type;
    
    showModal('userModal');
}

/**
 * Open modal for editing existing user
 * @param {number} userId - ID of user to edit
 * @param {string} type - Type of user ('customer' or 'admin')
 */
function openEditUserModal(userId, type) {
    const userData = type === 'customer' 
        ? customersData.find(u => u.id === userId)
        : adminsData.find(u => u.id === userId);
    
    if (!userData) return;
    
    userToEdit = userData;
    
    const modalTitle = document.getElementById('userModalTitle');
    const saveBtn = document.getElementById('saveUserBtn');
    const roleGroup = document.getElementById('roleGroup');
    
    if (type === 'customer') {
        if (modalTitle) modalTitle.textContent = 'Edit Customer';
        if (saveBtn) saveBtn.textContent = 'Update Customer';
        if (roleGroup) roleGroup.style.display = 'none';
    } else {
        if (modalTitle) modalTitle.textContent = 'Edit Administrator';
        if (saveBtn) saveBtn.textContent = 'Update Administrator';
        if (roleGroup) roleGroup.style.display = 'block';
    }
    
    document.getElementById('userId').value = userData.id;
    document.getElementById('userType').value = type;
    document.getElementById('userName').value = userData.name;
    document.getElementById('userEmail').value = userData.email;
    document.getElementById('userPhone').value = userData.phone;
    document.getElementById('userPassword').value = userData.password;
    
    if (type === 'admin' && userData.role) {
        document.getElementById('userRole').value = userData.role;
    }
    
    showModal('userModal');
}

/**
 * Handle user form submission (add or edit)
 */
function handleUserFormSubmit() {
    const userId = document.getElementById('userId').value;
    const userType = document.getElementById('userType').value;
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const phone = document.getElementById('userPhone').value.trim();
    const password = document.getElementById('userPassword').value;
    
    if (!name || !email || !phone || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    if (!isValidEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    const userData = { name, email, phone, password };
    
    if (userType === 'admin') {
        userData.role = document.getElementById('userRole').value;
    } else {
        userData.joinedDate = new Date().toISOString().split('T')[0];
    }
    
    if (userId) {
        updateUser(parseInt(userId), userData, userType);
    } else {
        addUser(userData, userType);
    }
    
    closeUserModal();
}

/**
 * Add new user (customer or admin)
 * @param {Object} userData - User data
 * @param {string} type - Type of user ('customer' or 'admin')
 */
function addUser(userData, type) {
    const dataArray = type === 'customer' ? customersData : adminsData;
    
    const newId = dataArray.length > 0 
        ? Math.max(...dataArray.map(u => u.id)) + 1 
        : 1;
    
    const newUser = {
        id: newId,
        ...userData
    };
    
    dataArray.push(newUser);
    
    if (type === 'customer') {
        renderCustomersTable();
    } else {
        renderAdminsTable();
    }
    
    console.log(`${type} added:`, newUser);
}

/**
 * Update existing user
 * @param {number} userId - ID of user to update
 * @param {Object} userData - Updated user data
 * @param {string} type - Type of user ('customer' or 'admin')
 */
function updateUser(userId, userData, type) {
    const dataArray = type === 'customer' ? customersData : adminsData;
    const index = dataArray.findIndex(u => u.id === userId);
    
    if (index === -1) return;
    
    dataArray[index] = {
        id: userId,
        ...userData
    };
    
    if (type === 'customer') {
        renderCustomersTable();
    } else {
        renderAdminsTable();
    }
    
    console.log(`${type} updated:`, dataArray[index]);
}

/**
 * Open delete confirmation modal for user
 * @param {number} userId - ID of user to delete
 * @param {string} type - Type of user ('customer' or 'admin')
 */
function openDeleteUserModal(userId, type) {
    const userData = type === 'customer' 
        ? customersData.find(u => u.id === userId)
        : adminsData.find(u => u.id === userId);
    
    if (!userData) return;
    
    userToDelete = userData;
    deleteItemType = type;
    
    const deleteMessage = document.getElementById('deleteMessage');
    const deleteItemName = document.getElementById('deleteItemName');
    
    if (deleteMessage) {
        deleteMessage.textContent = `Are you sure you want to delete this ${type}?`;
    }
    
    if (deleteItemName) {
        deleteItemName.textContent = `${userData.name} (${userData.email})`;
    }
    
    showModal('deleteModal');
}

/**
 * Confirm and execute deletion
 */
function confirmDelete() {
    // Check if deleting a book
    if (bookToDelete) {
        deleteBook(bookToDelete.id);
        bookToDelete = null;
    }
    // Check if deleting a user
    else if (userToDelete && deleteItemType) {
        deleteUser(userToDelete.id, deleteItemType);
        userToDelete = null;
        deleteItemType = null;
    }
    
    closeDeleteModal();
}

/**
 * Delete user from collection
 * @param {number} userId - ID of user to delete
 * @param {string} type - Type of user ('customer' or 'admin')
 */
function deleteUser(userId, type) {
    const dataArray = type === 'customer' ? customersData : adminsData;
    const index = dataArray.findIndex(u => u.id === userId);
    
    if (index === -1) return;
    
    const deletedUser = dataArray.splice(index, 1)[0];
    
    if (type === 'customer') {
        renderCustomersTable();
    } else {
        renderAdminsTable();
    }
    
    console.log(`${type} deleted:`, deletedUser);
}

/**
 * Close user add/edit modal
 */
function closeUserModal() {
    hideModal('userModal');
    document.getElementById('userForm').reset();
    userToEdit = null;
}

// ========================================
// INITIALIZATION
// ========================================

// Log initialization
console.log('SAIB Library System - Frontend Initialized');
console.log('Total books in database:', booksData.length);

