/* ========================================
   SAIB LIBRARY - MAIN JAVASCRIPT
   Database-driven implementation with API calls
   ======================================== */

// ========================================
// GLOBAL STATE (populated from API)
// ========================================

// Data arrays - populated from database via API
let booksData = [];
let customersData = [];
let adminsData = [];
let adminsLoadError = null;
let authorsData = [];
let genresData = [];
let publishersData = [];

// UI state
let bookToDelete = null;
let bookToEdit = null;
let bookToBorrow = null;
let uploadedImageData = null;
let currentSortOption = 'default';
let userToEdit = null;
let userToDelete = null;
let deleteItemType = null;
let isLoading = false;

// Admin filtered data
let filteredAdminBooksData = [];
let filteredCustomersData = [];
let filteredAdminsData = [];

// ========================================
// INPUT VALIDATION
// ========================================

/**
 * Validation utility functions
 */
const Validators = {
    // Name validation - letters, spaces, hyphens, apostrophes only (NO numbers)
    isValidName: (name) => /^[a-zA-Z\s\-']+$/.test(name),

    // Phone validation - numbers, spaces, hyphens, parentheses, plus sign only
    isValidPhone: (phone) => !phone || /^[+]?[0-9\s\-()]+$/.test(phone),

    // National ID - exactly 16 digits (NO letters)
    isValidNationalId: (id) => !id || /^[0-9]{16}$/.test(id),

    // ISBN - numbers and hyphens, 10-17 characters
    isValidIsbn: (isbn) => /^[0-9\-]{10,17}$/.test(isbn.replace(/\s/g, '')),

    // Email validation
    isValidEmail: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),

    // Year validation - 4 digits, 1000-2100
    isValidYear: (year) => !year || (year >= 1000 && year <= 2100),

    // Page count - positive integer up to 10000
    isValidPageCount: (count) => !count || (parseInt(count) > 0 && parseInt(count) <= 10000),

    // Total copies - positive integer 1-10000
    isValidCopies: (copies) => parseInt(copies) >= 1 && parseInt(copies) <= 10000,

    // Date of birth - must be in past, at least 13 years old
    isValidDOB: (dob) => {
        if (!dob) return true;
        const birthDate = new Date(dob);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        return birthDate < today && age >= 13;
    },

    // Future date validation (for membership end date)
    isFutureOrToday: (date) => {
        if (!date) return true;
        const d = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return d >= today;
    }
};

/**
 * Real-time field validation functions
 */
function validateNameField(input) {
    const value = input.value;
    if (value && !Validators.isValidName(value)) {
        input.classList.add('input-error');
        input.classList.remove('input-success');
        showFieldError(input, 'Name can only contain letters, spaces, hyphens, and apostrophes');
    } else if (value) {
        input.classList.remove('input-error');
        input.classList.add('input-success');
        clearFieldError(input);
    } else {
        input.classList.remove('input-error', 'input-success');
        clearFieldError(input);
    }
}

function validatePhoneField(input) {
    const value = input.value;
    if (value && !Validators.isValidPhone(value)) {
        input.classList.add('input-error');
        input.classList.remove('input-success');
        showFieldError(input, 'Phone can only contain numbers, spaces, hyphens, +, and parentheses');
    } else if (value) {
        input.classList.remove('input-error');
        input.classList.add('input-success');
        clearFieldError(input);
    } else {
        input.classList.remove('input-error', 'input-success');
        clearFieldError(input);
    }
}

function validateNationalIdField(input) {
    const value = input.value;
    if (value && !Validators.isValidNationalId(value)) {
        input.classList.add('input-error');
        input.classList.remove('input-success');
        showFieldError(input, 'National ID must be exactly 16 digits (numbers only)');
    } else if (value) {
        input.classList.remove('input-error');
        input.classList.add('input-success');
        clearFieldError(input);
    } else {
        input.classList.remove('input-error', 'input-success');
        clearFieldError(input);
    }
}

function validateIsbnField(input) {
    const value = input.value;
    if (value && !Validators.isValidIsbn(value)) {
        input.classList.add('input-error');
        input.classList.remove('input-success');
        showFieldError(input, 'ISBN must contain only numbers and hyphens (10-17 characters)');
    } else if (value) {
        input.classList.remove('input-error');
        input.classList.add('input-success');
        clearFieldError(input);
    } else {
        input.classList.remove('input-error', 'input-success');
        clearFieldError(input);
    }
}

function validateEmailField(input) {
    const value = input.value;
    if (value && !Validators.isValidEmail(value)) {
        input.classList.add('input-error');
        input.classList.remove('input-success');
        showFieldError(input, 'Please enter a valid email address');
    } else if (value) {
        input.classList.remove('input-error');
        input.classList.add('input-success');
        clearFieldError(input);
    } else {
        input.classList.remove('input-error', 'input-success');
        clearFieldError(input);
    }
}

function validatePageCountField(input) {
    const value = input.value;
    if (value && !Validators.isValidPageCount(value)) {
        input.classList.add('input-error');
        input.classList.remove('input-success');
        showFieldError(input, 'Page count must be a number between 1 and 10,000');
    } else if (value) {
        input.classList.remove('input-error');
        input.classList.add('input-success');
        clearFieldError(input);
    } else {
        input.classList.remove('input-error', 'input-success');
        clearFieldError(input);
    }
}

function validateCopiesField(input) {
    const value = input.value;
    if (value && !Validators.isValidCopies(value)) {
        input.classList.add('input-error');
        input.classList.remove('input-success');
        showFieldError(input, 'Total copies must be a number between 1 and 10,000');
    } else if (value) {
        input.classList.remove('input-error');
        input.classList.add('input-success');
        clearFieldError(input);
    } else {
        input.classList.remove('input-error', 'input-success');
        clearFieldError(input);
    }
}

function validateDOBField(input) {
    const value = input.value;
    if (value && !Validators.isValidDOB(value)) {
        input.classList.add('input-error');
        input.classList.remove('input-success');
        showFieldError(input, 'Date of birth must be in the past and user must be at least 13 years old');
    } else if (value) {
        input.classList.remove('input-error');
        input.classList.add('input-success');
        clearFieldError(input);
    } else {
        input.classList.remove('input-error', 'input-success');
        clearFieldError(input);
    }
}

function validateMembershipEndField(input) {
    const value = input.value;
    if (value && !Validators.isFutureOrToday(value)) {
        input.classList.add('input-error');
        input.classList.remove('input-success');
        showFieldError(input, 'Membership end date must be today or a future date');
    } else if (value) {
        input.classList.remove('input-error');
        input.classList.add('input-success');
        clearFieldError(input);
    } else {
        input.classList.remove('input-error', 'input-success');
        clearFieldError(input);
    }
}

/**
 * Show error message below a field
 */
function showFieldError(input, message) {
    let errorEl = input.parentElement.querySelector('.field-error');
    if (!errorEl) {
        errorEl = document.createElement('small');
        errorEl.className = 'field-error';
        input.parentElement.appendChild(errorEl);
    }
    errorEl.textContent = message;
}

/**
 * Clear error message from a field
 */
function clearFieldError(input) {
    const errorEl = input.parentElement.querySelector('.field-error');
    if (errorEl) errorEl.remove();
}

// ========================================
// LOGIN PAGE FUNCTIONS
// ========================================

/**
 * Initialize login page functionality
 */
function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });
    
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
 */
async function handleLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    clearError('emailError');
    clearError('passwordError');
    clearError('generalError');
    
    let isValid = true;
    
    if (!email) {
        showError('emailError', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('emailError', 'Please enter a valid email address');
        isValid = false;
    }
    
    if (!password) {
        showError('passwordError', 'Password is required');
        isValid = false;
    } else if (password.length < 6) {
        showError('passwordError', 'Password must be at least 6 characters');
        isValid = false;
    }
    
    if (!isValid) return;
    
    const generalError = document.getElementById('generalError');
    generalError.textContent = 'Logging in...';
    generalError.classList.add('show');
    generalError.style.backgroundColor = '#e3f2fd';
    generalError.style.color = '#1976d2';
    
    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            sessionStorage.setItem('userType', data.user.type);
            sessionStorage.setItem('userEmail', data.user.email);
            sessionStorage.setItem('userName', data.user.name);
            sessionStorage.setItem('userId', data.user.id);
            
            generalError.textContent = 'Login successful! Redirecting...';
            generalError.style.backgroundColor = '#e8f5e9';
            generalError.style.color = '#2e7d32';
            
            setTimeout(() => {
                window.location.href = data.redirectTo;
            }, 500);
        } else {
            showError('generalError', data.message || 'Login failed');
            generalError.style.backgroundColor = '#ffebee';
            generalError.style.color = '#c62828';
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('generalError', 'Unable to connect to server. Please try again.');
        generalError.style.backgroundColor = '#ffebee';
        generalError.style.color = '#c62828';
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        if (elementId === 'generalError') {
            errorElement.classList.add('show');
        }
    }
}

function clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }
}

async function handleLogout() {
    try {
        await fetch('http://localhost:3000/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    sessionStorage.clear();
    window.location.href = '/index.html';
}

// ========================================
// DATA LOADING FUNCTIONS
// ========================================

/**
 * Load books from database
 */
async function loadBooks() {
    try {
        isLoading = true;
        const response = await fetch('http://localhost:3000/api/books', {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
            booksData = data.data;
            filteredAdminBooksData = [...booksData]; // Initialize filtered data
            console.log('Books loaded from database:', booksData.length, 'books');

            // Fetch next available dates for books with no available copies
            await fetchNextAvailableDates();

            // Populate admin category filter if on admin page
            populateAdminCategoryFilter();
        } else {
            console.error('Failed to load books:', data.message);
            booksData = [];
        }
    } catch (error) {
        console.error('Error loading books:', error);
        booksData = [];
    } finally {
        isLoading = false;
    }
}

/**
 * Fetch next available dates for books that are fully borrowed
 */
async function fetchNextAvailableDates() {
    try {
        // Get all active borrowings
        const response = await fetch('http://localhost:3000/api/borrowings', {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success && data.data) {
            const borrowings = data.data;

            // For each book with no available copies, find the earliest return date
            booksData.forEach(book => {
                const availableCopies = book.availableCopies !== undefined
                    ? book.availableCopies
                    : (book.available_copies !== undefined ? book.available_copies : (book.isAvailable ? 1 : 0));

                if (availableCopies === 0) {
                    // Find active borrowings for this book (not returned)
                    const activeBookBorrowings = borrowings.filter(b =>
                        (b.book_id === book.id || b.bookId === book.id) &&
                        !b.return_date && !b.returnDate
                    );

                    if (activeBookBorrowings.length > 0) {
                        // Find the earliest due date
                        const earliestDueDate = activeBookBorrowings.reduce((earliest, b) => {
                            const dueDate = new Date(b.due_date || b.dueDate);
                            return !earliest || dueDate < earliest ? dueDate : earliest;
                        }, null);

                        if (earliestDueDate) {
                            book.nextAvailableDate = earliestDueDate.toISOString().split('T')[0];
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error fetching borrowings for availability:', error);
    }
}

/**
 * Load customers/members from database
 */
async function loadCustomers() {
    try {
        const response = await fetch('http://localhost:3000/api/members', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            customersData = data.data;
            filteredCustomersData = [...customersData]; // Initialize filtered data
            console.log('Customers loaded from database:', customersData.length);
        } else {
            console.error('Failed to load customers:', data.message);
            customersData = [];
            filteredCustomersData = [];
        }
    } catch (error) {
        console.error('Error loading customers:', error);
        customersData = [];
        filteredCustomersData = [];
    }
}

/**
 * Load admins from database
 */
async function loadAdmins() {
    try {
        const response = await fetch('http://localhost:3000/api/admins', {
            credentials: 'include'
        });
        
        // Check if response is OK (status 200-299)
        if (!response.ok) {
            console.error('Admins API error:', response.status, response.statusText);
            // If unauthorized, user might need to re-login
            if (response.status === 401) {
                console.warn('Not authenticated. Please login first.');
                adminsLoadError = 'Please login to view administrators.';
            } else if (response.status === 403) {
                console.warn('Access denied. Only admins can view this list.');
                adminsLoadError = 'Access denied. Admin privileges required.';
            } else {
                adminsLoadError = 'Failed to load administrators.';
            }
            adminsData = [];
            return;
        }
        
        const data = await response.json();
        
        if (data.success) {
            adminsData = data.data || [];
            filteredAdminsData = [...adminsData]; // Initialize filtered data
            adminsLoadError = null;
            console.log('Admins loaded from database:', adminsData.length, adminsData);
        } else {
            console.error('Failed to load admins:', data.message);
            adminsLoadError = data.message || 'Failed to load administrators.';
            adminsData = [];
            filteredAdminsData = [];
        }
    } catch (error) {
        console.error('Error loading admins:', error);
        adminsLoadError = 'Network error loading administrators.';
        adminsData = [];
        filteredAdminsData = [];
    }
}

/**
 * Load authors from database
 */
async function loadAuthors() {
    try {
        const response = await fetch('http://localhost:3000/api/authors', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            authorsData = data.data;
            console.log('Authors loaded from database:', authorsData.length);
        }
    } catch (error) {
        console.error('Error loading authors:', error);
        authorsData = [];
    }
}

/**
 * Load genres from database
 */
async function loadGenres() {
    try {
        const response = await fetch('http://localhost:3000/api/genres', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            genresData = data.data;
            console.log('Genres loaded from database:', genresData.length);
        }
    } catch (error) {
        console.error('Error loading genres:', error);
        genresData = [];
    }
}

/**
 * Load publishers from database
 */
async function loadPublishers() {
    try {
        const response = await fetch('http://localhost:3000/api/publishers', {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success) {
            publishersData = data.data;
            console.log('Publishers loaded from database:', publishersData.length);
        }
    } catch (error) {
        console.error('Error loading publishers:', error);
        publishersData = [];
    }
}

// ========================================
// ADMIN PAGE FUNCTIONS
// ========================================

/**
 * Initialize admin dashboard
 */
async function initAdminPage() {
    // Initialize profile dropdown
    initProfileDropdown();

    await loadBooks();
    await loadAuthors();
    await loadGenres();
    await loadPublishers();
    await loadCustomers(); // For borrowing and customers tab
    renderBooksTable();
    renderAdminCustomersTable(); // Render customers table for admin (delete only)
    populateFormDropdowns();
    
    const bookForm = document.getElementById('bookForm');
    if (bookForm) {
        bookForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleBookFormSubmit();
        });
    }
    
    const borrowForm = document.getElementById('borrowForm');
    if (borrowForm) {
        borrowForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleBorrowFormSubmit();
        });
    }
}

/**
 * Populate form dropdowns with data from database
 */
function populateFormDropdowns() {
    // Populate single genre dropdown if exists
    // Populate genres checkboxes
    const genresContainer = document.getElementById('bookGenresContainer');
    if (genresContainer && genresData) {
        genresContainer.innerHTML = '';
        genresData.forEach(genre => {
            const checkboxItem = document.createElement('div');
            checkboxItem.className = 'genre-checkbox-item';
            checkboxItem.innerHTML = `
                <input type="checkbox" id="genre_${genre.id}" name="bookGenres" value="${genre.id}">
                <label for="genre_${genre.id}">${escapeHtml(genre.name)}</label>
            `;
            genresContainer.appendChild(checkboxItem);
        });
    }

    // Populate authors multi-select if exists (for backward compatibility)
    const authorSelect = document.getElementById('bookAuthors');
    if (authorSelect) {
        authorSelect.innerHTML = '';
        authorsData.forEach(author => {
            const option = document.createElement('option');
            option.value = author.id;
            option.textContent = author.name;
            authorSelect.appendChild(option);
        });
    }

    // Populate genres multi-select if exists (for backward compatibility)
    const genreSelect = document.getElementById('bookGenres');
    if (genreSelect) {
        genreSelect.innerHTML = '';
        genresData.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.id;
            option.textContent = genre.name;
            genreSelect.appendChild(option);
        });
    }

    // Populate category dropdown (for backward compatibility)
    const categorySelect = document.getElementById('bookCategory');
    if (categorySelect && genresData.length > 0) {
        categorySelect.innerHTML = '<option value="">Select a category</option>';
        genresData.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.name;
            option.textContent = genre.name;
            categorySelect.appendChild(option);
        });
    }

    // Populate publisher dropdown if exists
    const publisherSelect = document.getElementById('bookPublisher');
    if (publisherSelect) {
        publisherSelect.innerHTML = '<option value="">Select a publisher</option>';
        publishersData.forEach(publisher => {
            const option = document.createElement('option');
            option.value = publisher.id;
            option.textContent = publisher.name;
            publisherSelect.appendChild(option);
        });
    }

    // Note: Member dropdown for borrowing is now handled by populateBorrowMemberDropdown()
    // which creates a searchable dropdown instead of a regular select
}

/**
 * Render books in admin table
 */
function renderBooksTable() {
    const tableBody = document.getElementById('booksTableBody');
    const emptyState = document.getElementById('emptyState') || document.getElementById('booksEmptyState');

    if (!tableBody) return;

    tableBody.innerHTML = '';

    // Always use filtered data - it's initialized with all data on load
    const dataToRender = filteredAdminBooksData;

    if (dataToRender.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    dataToRender.forEach(book => {
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
            <td>${escapeHtml(book.author || 'Unknown')}</td>
            <td>${escapeHtml(book.category || 'Uncategorized')}</td>
            <td>${book.year || 'N/A'}</td>
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
 * Filter and sort admin books table
 */
function filterAdminBooks() {
    const searchTerm = document.getElementById('adminBookSearch')?.value.toLowerCase() || '';
    const sortOption = document.getElementById('adminBookSort')?.value || 'default';
    const categoryFilter = document.getElementById('adminCategoryFilter')?.value || '';
    const availabilityFilter = document.getElementById('adminAvailabilityFilter')?.value || '';

    // Start with all books
    let filtered = [...booksData];

    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(book => {
            const title = (book.title || '').toLowerCase();
            const author = (book.author || '').toLowerCase();
            const isbn = (book.isbn || '').toLowerCase();
            const category = (book.category || '').toLowerCase();
            return title.includes(searchTerm) ||
                   author.includes(searchTerm) ||
                   isbn.includes(searchTerm) ||
                   category.includes(searchTerm);
        });
    }

    // Apply category filter
    if (categoryFilter) {
        filtered = filtered.filter(book => {
            const bookCategory = (book.category || '').toLowerCase();
            return bookCategory === categoryFilter.toLowerCase();
        });
    }

    // Apply availability filter
    if (availabilityFilter) {
        filtered = filtered.filter(book => {
            // Handle both camelCase and snake_case field names, and type conversion
            const availableCopies = book.availableCopies ?? book.available_copies ?? 0;
            const isAvailable = book.isAvailable === true || book.isAvailable === 1 || availableCopies > 0;

            if (availabilityFilter === 'available') {
                return isAvailable;
            } else if (availabilityFilter === 'borrowed') {
                return !isAvailable;
            }
            return true;
        });
    }

    // Apply sorting
    if (sortOption !== 'default') {
        filtered.sort((a, b) => {
            switch (sortOption) {
                case 'title-asc':
                    return (a.title || '').localeCompare(b.title || '');
                case 'title-desc':
                    return (b.title || '').localeCompare(a.title || '');
                case 'author-asc':
                    return (a.author || '').localeCompare(b.author || '');
                case 'author-desc':
                    return (b.author || '').localeCompare(a.author || '');
                case 'year-asc':
                    return (a.year || 0) - (b.year || 0);
                case 'year-desc':
                    return (b.year || 0) - (a.year || 0);
                default:
                    return 0;
            }
        });
    }

    filteredAdminBooksData = filtered;
    renderBooksTable();
}

/**
 * Clear all admin book filters
 */
function clearAdminBookFilters() {
    const searchInput = document.getElementById('adminBookSearch');
    const sortSelect = document.getElementById('adminBookSort');
    const categorySelect = document.getElementById('adminCategoryFilter');
    const availabilitySelect = document.getElementById('adminAvailabilityFilter');

    if (searchInput) searchInput.value = '';
    if (sortSelect) sortSelect.value = 'default';
    if (categorySelect) categorySelect.value = '';
    if (availabilitySelect) availabilitySelect.value = '';

    filteredAdminBooksData = [...booksData];
    renderBooksTable();
}

/**
 * Populate admin category filter dropdown
 */
function populateAdminCategoryFilter() {
    const categorySelect = document.getElementById('adminCategoryFilter');
    if (!categorySelect) return;

    // Get unique categories from books
    const categories = [...new Set(booksData.map(book => book.category).filter(Boolean))];
    categories.sort();

    // Keep the first "All Categories" option
    categorySelect.innerHTML = '<option value="">All Categories</option>';

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

/**
 * Open modal for adding new book
 */
function openAddBookModal() {
    bookToEdit = null;
    uploadedImageData = null;
    
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.textContent = 'Add New Book';
    
    const saveBtn = document.getElementById('saveBookBtn');
    if (saveBtn) saveBtn.textContent = 'Save Book';
    
    const bookForm = document.getElementById('bookForm');
    if (bookForm) bookForm.reset();
    
    const bookId = document.getElementById('bookId');
    if (bookId) bookId.value = '';
    
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) {
        imagePreview.style.display = 'none';
        imagePreview.src = '';
    }
    
    // Clear multi-selects
    const authorSelect = document.getElementById('bookAuthors');
    if (authorSelect) {
        Array.from(authorSelect.options).forEach(opt => opt.selected = false);
    }
    
    // Reset genre checkboxes
    const genreCheckboxes = document.querySelectorAll('input[name="bookGenres"]');
    genreCheckboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    showModal('bookModal');
}

/**
 * Open modal for editing existing book
 */
function openEditBookModal(bookId) {
    const book = booksData.find(b => b.id === bookId);
    if (!book) return;

    bookToEdit = book;
    uploadedImageData = book.image;

    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.textContent = 'Edit Book';

    const saveBtn = document.getElementById('saveBookBtn');
    if (saveBtn) saveBtn.textContent = 'Update Book';

    // Populate form fields
    const bookIdField = document.getElementById('bookId');
    if (bookIdField) bookIdField.value = book.id;

    const bookIsbn = document.getElementById('bookIsbn');
    if (bookIsbn) bookIsbn.value = book.isbn || '';

    const bookTitle = document.getElementById('bookTitle');
    if (bookTitle) bookTitle.value = book.title || '';

    const bookYear = document.getElementById('bookYear');
    if (bookYear) bookYear.value = book.year || '';

    const bookEdition = document.getElementById('bookEdition');
    if (bookEdition) bookEdition.value = book.edition || '';

    const bookLanguage = document.getElementById('bookLanguage');
    if (bookLanguage) bookLanguage.value = book.language || 'English';

    const bookPageCount = document.getElementById('bookPageCount');
    if (bookPageCount) bookPageCount.value = book.page_count || '';

    const bookTotalCopies = document.getElementById('bookTotalCopies');
    if (bookTotalCopies) bookTotalCopies.value = book.total_copies || 1;

    const bookDescription = document.getElementById('bookDescription');
    if (bookDescription) bookDescription.value = book.description || '';

    const bookImageUrl = document.getElementById('bookImageUrl');
    if (bookImageUrl) bookImageUrl.value = book.image || '';

    // Set publisher dropdown value
    const publisherSelect = document.getElementById('bookPublisher');
    if (publisherSelect) publisherSelect.value = book.publisher_id || '';

    // Set author text input value
    const authorInput = document.getElementById('bookAuthor');
    if (authorInput) {
        // Get first author name if available
        authorInput.value = book.author || (book.authors && book.authors.length > 0 ? book.authors[0].name : '');
    }

    // Set genre checkboxes
    if (book.genres && book.genres.length > 0) {
        const genreIds = book.genres.map(g => g.id.toString());
        const genreCheckboxes = document.querySelectorAll('input[name="bookGenres"]');
        genreCheckboxes.forEach(checkbox => {
            checkbox.checked = genreIds.includes(checkbox.value);
        });
    } else {
        // Uncheck all if no genres
        const genreCheckboxes = document.querySelectorAll('input[name="bookGenres"]');
        genreCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    }

    // Set multi-select values for authors (backward compatibility)
    const authorSelect = document.getElementById('bookAuthors');
    if (authorSelect && book.authors) {
        const authorIds = book.authors.map(a => a.id.toString());
        Array.from(authorSelect.options).forEach(opt => {
            opt.selected = authorIds.includes(opt.value);
        });
    }

    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview && book.image) {
        imagePreview.src = book.image;
        imagePreview.style.display = 'block';
    }

    showModal('bookModal');
}

/**
 * Handle book form submission (add or edit)
 */
async function handleBookFormSubmit() {
    const bookIdField = document.getElementById('bookId');
    const bookId = bookIdField ? bookIdField.value : '';

    // Get form values
    const isbn = document.getElementById('bookIsbn')?.value.trim();
    const title = document.getElementById('bookTitle')?.value.trim();
    const year = document.getElementById('bookYear')?.value;
    const edition = document.getElementById('bookEdition')?.value.trim();
    const language = document.getElementById('bookLanguage')?.value;
    const pageCount = document.getElementById('bookPageCount')?.value;
    const description = document.getElementById('bookDescription')?.value.trim();
    const totalCopies = document.getElementById('bookTotalCopies')?.value || 1;
    const imageUrl = document.getElementById('bookImageUrl')?.value.trim();

    const image = uploadedImageData || imageUrl || null;

    // Validate required fields
    if (!isbn) {
        alert('Please enter an ISBN');
        return;
    }

    // Validate ISBN format (numbers and hyphens only)
    if (!Validators.isValidIsbn(isbn)) {
        alert('ISBN must contain only numbers and hyphens (10-17 characters)');
        return;
    }

    if (!title) {
        alert('Please enter a book title');
        return;
    }

    // Validate page count if provided
    if (pageCount && !Validators.isValidPageCount(pageCount)) {
        alert('Page count must be a number between 1 and 10,000');
        return;
    }

    // Validate total copies
    if (totalCopies && !Validators.isValidCopies(totalCopies)) {
        alert('Total copies must be a number between 1 and 10,000');
        return;
    }

    // Get author name from text input
    const authorInput = document.getElementById('bookAuthor');
    const authorName = authorInput?.value.trim();

    // Validate author name (letters only, no numbers)
    if (authorName) {
        if (!Validators.isValidName(authorName)) {
            alert('Author name can only contain letters, spaces, hyphens, and apostrophes (no numbers)');
            return;
        }
    } else {
        alert('Please enter an author name');
        return;
    }

    // Get selected genre from single dropdown
    // Get selected genre IDs from checkboxes
    const genreCheckboxes = document.querySelectorAll('input[name="bookGenres"]:checked');
    const genreIds = Array.from(genreCheckboxes).map(cb => parseInt(cb.value));

    if (genreIds.length === 0) {
        alert('Please select at least one genre');
        return;
    }

    // Get publisher from dropdown
    let publisherId = null;
    const publisherSelect = document.getElementById('bookPublisher');
    if (publisherSelect && publisherSelect.value) {
        publisherId = parseInt(publisherSelect.value);
    }

    const bookData = {
        isbn,
        title,
        description,
        image,
        publication_date: year ? `${year}-01-01` : null,
        edition: edition || null,
        language: language || 'English',
        page_count: pageCount ? parseInt(pageCount) : null,
        author_name: authorName,
        genre_ids: genreIds,  // Array of genre IDs
        publisher_id: publisherId,
        total_copies: parseInt(totalCopies)
    };
    
    try {
        let response;
        if (bookId) {
            // Update existing book
            response = await fetch(`http://localhost:3000/api/books/${bookId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(bookData)
            });
        } else {
            // Create new book
            response = await fetch('http://localhost:3000/api/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(bookData)
            });
        }
        
        const data = await response.json();
        
        if (data.success) {
            await loadBooks();
            renderBooksTable();
            renderBooksGrid();
            closeBookModal();
            console.log(bookId ? 'Book updated' : 'Book created', data);
        } else {
            alert(data.message || 'Failed to save book');
        }
    } catch (error) {
        console.error('Error saving book:', error);
        alert('Error saving book. Please try again.');
    }
}

/**
 * Open delete confirmation modal
 */
function openDeleteModal(bookId) {
    const book = booksData.find(b => b.id === bookId);
    if (!book) return;
    
    bookToDelete = book;
    userToDelete = null;
    deleteItemType = 'book';
    
    const deleteMessage = document.getElementById('deleteMessage');
    if (deleteMessage) {
        deleteMessage.textContent = 'Are you sure you want to delete this book?';
    }
    
    const deleteItemName = document.getElementById('deleteItemName');
    if (deleteItemName) {
        deleteItemName.textContent = `"${book.title}" by ${book.author || 'Unknown'}`;
    }
    
    const deleteBookTitle = document.getElementById('deleteBookTitle');
    if (deleteBookTitle) {
        deleteBookTitle.textContent = `"${book.title}" by ${book.author || 'Unknown'}`;
    }
    
    showModal('deleteModal');
}

/**
 * Confirm and execute deletion
 */
async function confirmDelete() {
    console.log('confirmDelete called', { bookToDelete, userToDelete, deleteItemType });

    if (bookToDelete && deleteItemType === 'book') {
        await deleteBook(bookToDelete.id);
        bookToDelete = null;
    } else if (userToDelete && deleteItemType) {
        console.log('Deleting user:', userToDelete.id, 'type:', deleteItemType);
        try {
            await deleteUser(userToDelete.id, deleteItemType);
        } catch (err) {
            console.error('Error in deleteUser:', err);
            alert('Error deleting user: ' + err.message);
        }
        userToDelete = null;
    } else {
        console.log('No item to delete - userToDelete:', userToDelete, 'deleteItemType:', deleteItemType);
    }

    deleteItemType = null;
    closeDeleteModal();
}

/**
 * Delete book from database
 */
async function deleteBook(bookId) {
    try {
        const response = await fetch(`http://localhost:3000/api/books/${bookId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (data.success) {
            await loadBooks();
            renderBooksTable();
            renderBooksGrid();
            console.log('Book deleted:', bookId);
        } else {
            alert(data.message || 'Failed to delete book');
        }
    } catch (error) {
        console.error('Error deleting book:', error);
        alert('Error deleting book. Please try again.');
    }
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImageData = e.target.result;
        const imagePreview = document.getElementById('imagePreview');
        if (imagePreview) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
        }
    };
    reader.readAsDataURL(file);
}

function handleImageUrlChange() {
    const imageUrl = document.getElementById('bookImageUrl')?.value.trim();
    const imagePreview = document.getElementById('imagePreview');
    
    if (imageUrl && imagePreview) {
        uploadedImageData = imageUrl;
        imagePreview.src = imageUrl;
        imagePreview.style.display = 'block';
        imagePreview.onerror = function() {
            imagePreview.style.display = 'none';
            alert('Failed to load image from URL');
        };
    } else if (imagePreview) {
        imagePreview.style.display = 'none';
    }
}

function closeBookModal() {
    hideModal('bookModal');
    const bookForm = document.getElementById('bookForm');
    if (bookForm) bookForm.reset();
    bookToEdit = null;
    uploadedImageData = null;
    
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) {
        imagePreview.style.display = 'none';
        imagePreview.src = '';
    }
}

function closeDeleteModal() {
    hideModal('deleteModal');
    // Don't reset variables here - confirmDelete handles that
    // Only reset if modal is closed without confirming
}

// ========================================
// BORROWING FUNCTIONS
// ========================================

/**
 * Open borrow/return modal
 */
function openBorrowModal(bookId) {
    const book = booksData.find(b => b.id === bookId);
    if (!book) return;

    bookToBorrow = book;

    const modalTitle = document.getElementById('borrowModalTitle');
    const borrowFormContent = document.getElementById('borrowFormContent');
    const returnFormContent = document.getElementById('returnFormContent');
    const saveBtn = document.getElementById('saveBorrowBtn');
    const noCopiesWarning = document.getElementById('noCopiesAvailable');
    const bookAvailabilityInfo = document.getElementById('bookAvailabilityInfo');

    const borrowBookId = document.getElementById('borrowBookId');
    if (borrowBookId) borrowBookId.value = bookId;

    // Populate member dropdown for borrowing
    populateBorrowMemberDropdown();

    // Display book availability information
    displayBookAvailability(book);

    // Check if book has available copies
    const availableCopies = book.availableCopies !== undefined ? book.availableCopies : (book.isAvailable ? 1 : 0);
    const hasAvailableCopies = availableCopies > 0;

    if (hasAvailableCopies) {
        // Show borrow form
        if (modalTitle) modalTitle.textContent = 'Borrow Book for Customer';
        if (borrowFormContent) borrowFormContent.style.display = 'block';
        if (returnFormContent) returnFormContent.style.display = 'none';
        if (noCopiesWarning) noCopiesWarning.style.display = 'none';
        if (saveBtn) {
            saveBtn.textContent = 'Confirm Borrowing';
            saveBtn.disabled = false;
        }

        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        const borrowDateField = document.getElementById('borrowDate');
        if (borrowDateField) {
            borrowDateField.value = today;
            borrowDateField.min = today;
        }

        // Reset duration to default (14 days)
        const borrowDuration = document.getElementById('borrowDuration');
        if (borrowDuration) borrowDuration.value = '14';

        const customDurationGroup = document.getElementById('customDurationGroup');
        if (customDurationGroup) customDurationGroup.style.display = 'none';

        // Calculate return date
        updateReturnDate();

        // Reset notes
        const borrowNotes = document.getElementById('borrowNotes');
        if (borrowNotes) borrowNotes.value = '';

        // Reset member selection
        if (typeof window.resetBorrowMemberDropdown === 'function') {
            window.resetBorrowMemberDropdown();
        }

    } else if (!book.isAvailable || book.borrowingId) {
        // Show return form for borrowed book
        if (modalTitle) modalTitle.textContent = 'Return Book';
        if (borrowFormContent) borrowFormContent.style.display = 'none';
        if (returnFormContent) returnFormContent.style.display = 'block';
        if (noCopiesWarning) noCopiesWarning.style.display = 'none';
        if (saveBtn) {
            saveBtn.textContent = 'Confirm Return';
            saveBtn.disabled = false;
        }

        // Display borrowing info
        const displayBorrower = document.getElementById('displayBorrower');
        if (displayBorrower) displayBorrower.textContent = book.borrowedBy || 'N/A';

        const displayBorrowDate = document.getElementById('displayBorrowDate');
        if (displayBorrowDate) displayBorrowDate.textContent = formatDate(book.borrowDate);

        const displayReturnDate = document.getElementById('displayReturnDate');
        if (displayReturnDate) displayReturnDate.textContent = formatDate(book.returnDate || book.dueDate);

        // Check if overdue
        checkOverdueStatus(book);
    } else {
        // No copies available and no specific borrowing to return
        if (modalTitle) modalTitle.textContent = 'Book Unavailable';
        if (borrowFormContent) borrowFormContent.style.display = 'none';
        if (returnFormContent) returnFormContent.style.display = 'none';
        if (noCopiesWarning) noCopiesWarning.style.display = 'block';
        if (saveBtn) {
            saveBtn.textContent = 'Close';
            saveBtn.disabled = true;
        }
    }

    showModal('borrowModal');
}

/**
 * Populate member dropdown for borrowing (searchable)
 */
function populateBorrowMemberDropdown() {
    const searchInput = document.getElementById('borrowMemberSearch');
    const hiddenInput = document.getElementById('borrowMember');
    const dropdownList = document.getElementById('borrowMemberList');
    
    if (!searchInput || !hiddenInput || !dropdownList || !customersData) {
        return;
    }

    // Store all customers for filtering
    let allCustomers = [...customersData];
    let selectedCustomer = null;

    // Function to filter and display customers
    function filterCustomers(searchTerm = '') {
        const term = searchTerm.toLowerCase().trim();
        let filtered = allCustomers;

        if (term) {
            filtered = allCustomers.filter(member => {
                const name = (member.name || '').toLowerCase();
                const email = (member.email || '').toLowerCase();
                const phone = (member.phone || '').toLowerCase();
                return name.includes(term) || email.includes(term) || phone.includes(term);
            });
        }

        // Clear and populate dropdown
        dropdownList.innerHTML = '';

        if (filtered.length === 0) {
            dropdownList.innerHTML = '<div class="dropdown-list-empty">No customers found</div>';
            dropdownList.style.display = 'block';
            return;
        }

        // Show up to 10 results
        filtered.slice(0, 10).forEach(member => {
            const item = document.createElement('div');
            item.className = 'dropdown-list-item';
            item.dataset.id = member.id;
            item.innerHTML = `
                <span class="item-name">${escapeHtml(member.name)}</span>
                <span class="item-email">${escapeHtml(member.email)}</span>
            `;
            
            item.addEventListener('click', () => {
                selectedCustomer = member;
                searchInput.value = `${member.name} (${member.email})`;
                hiddenInput.value = member.id;
                dropdownList.style.display = 'none';
                
                // Remove required validation error if any
                searchInput.setCustomValidity('');
            });
            
            dropdownList.appendChild(item);
        });

        dropdownList.style.display = 'block';
    }

    // Handle input/search
    searchInput.addEventListener('input', (e) => {
        const value = e.target.value;
        if (value && !selectedCustomer) {
            filterCustomers(value);
        } else if (!value) {
            selectedCustomer = null;
            hiddenInput.value = '';
            dropdownList.style.display = 'none';
        }
    });

    // Handle focus
    searchInput.addEventListener('focus', () => {
        if (searchInput.value && !selectedCustomer) {
            filterCustomers(searchInput.value);
        } else if (!selectedCustomer) {
            filterCustomers(''); // Show all on focus
        }
    });

    // Handle click outside to close dropdown
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('borrowMemberDropdown');
        if (dropdown && !dropdown.contains(e.target)) {
            dropdownList.style.display = 'none';
        }
    });

    // Handle keyboard navigation
    let selectedIndex = -1;
    searchInput.addEventListener('keydown', (e) => {
        const items = dropdownList.querySelectorAll('.dropdown-list-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateSelection(items, selectedIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelection(items, selectedIndex);
        } else if (e.key === 'Enter' && selectedIndex >= 0 && items[selectedIndex]) {
            e.preventDefault();
            items[selectedIndex].click();
        } else if (e.key === 'Escape') {
            dropdownList.style.display = 'none';
            selectedIndex = -1;
        }
    });

    function updateSelection(items, index) {
        items.forEach((item, i) => {
            item.classList.toggle('selected', i === index);
        });
        if (index >= 0 && items[index]) {
            items[index].scrollIntoView({ block: 'nearest' });
        }
    }

    // Clear selection when input is cleared
    searchInput.addEventListener('blur', () => {
        // Delay to allow click events to fire first
        setTimeout(() => {
            if (!selectedCustomer && !hiddenInput.value) {
                searchInput.value = '';
            }
        }, 200);
    });

    // Validation
    searchInput.addEventListener('invalid', () => {
        if (!hiddenInput.value) {
            searchInput.setCustomValidity('Please select a customer');
        }
    });

    // Reset function
    window.resetBorrowMemberDropdown = function() {
        selectedCustomer = null;
        searchInput.value = '';
        hiddenInput.value = '';
        dropdownList.style.display = 'none';
        searchInput.setCustomValidity('');
    };
}

/**
 * Display book availability information
 */
function displayBookAvailability(book) {
    const bookTitle = document.getElementById('availabilityBookTitle');
    if (bookTitle) bookTitle.textContent = book.title;

    const totalCopies = book.totalCopies || book.total_copies || 1;
    const availableCopies = book.availableCopies !== undefined ? book.availableCopies : (book.isAvailable ? totalCopies : 0);
    const borrowedCopies = totalCopies - availableCopies;

    const totalDisplay = document.getElementById('totalCopiesDisplay');
    if (totalDisplay) totalDisplay.textContent = totalCopies;

    const availableDisplay = document.getElementById('availableCopiesDisplay');
    if (availableDisplay) {
        availableDisplay.textContent = availableCopies;
        availableDisplay.className = `stat-value ${availableCopies > 0 ? 'available' : 'none-available'}`;
    }

    const borrowedDisplay = document.getElementById('borrowedCopiesDisplay');
    if (borrowedDisplay) borrowedDisplay.textContent = borrowedCopies;

    // Show next available date if no copies available
    const nextAvailableInfo = document.getElementById('nextAvailableInfo');
    const nextAvailableDateDisplay = document.getElementById('nextAvailableDateDisplay');

    if (availableCopies === 0 && book.nextAvailableDate) {
        if (nextAvailableInfo) nextAvailableInfo.style.display = 'flex';
        if (nextAvailableDateDisplay) nextAvailableDateDisplay.textContent = formatDate(book.nextAvailableDate);
    } else if (availableCopies === 0 && book.returnDate) {
        if (nextAvailableInfo) nextAvailableInfo.style.display = 'flex';
        if (nextAvailableDateDisplay) nextAvailableDateDisplay.textContent = formatDate(book.returnDate);
    } else {
        if (nextAvailableInfo) nextAvailableInfo.style.display = 'none';
    }
}

/**
 * Check if book is overdue and display warning
 */
function checkOverdueStatus(book) {
    const overdueWarning = document.getElementById('overdueWarning');
    const overdueDays = document.getElementById('overdueDays');

    if (!overdueWarning) return;

    const dueDate = new Date(book.returnDate || book.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dueDate < today) {
        const diffTime = Math.abs(today - dueDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        overdueWarning.style.display = 'flex';
        if (overdueDays) overdueDays.textContent = diffDays;
    } else {
        overdueWarning.style.display = 'none';
    }
}

/**
 * Update return date based on borrow duration selection
 */
function updateReturnDate() {
    const borrowDateField = document.getElementById('borrowDate');
    const borrowDuration = document.getElementById('borrowDuration');
    const customDuration = document.getElementById('customDuration');
    const customDurationGroup = document.getElementById('customDurationGroup');
    const returnDateField = document.getElementById('returnDate');

    if (!borrowDateField || !borrowDuration || !returnDateField) return;

    const borrowDate = new Date(borrowDateField.value);
    let duration = parseInt(borrowDuration.value);

    // Handle custom duration
    if (borrowDuration.value === 'custom') {
        if (customDurationGroup) customDurationGroup.style.display = 'block';
        if (customDuration && customDuration.value) {
            duration = parseInt(customDuration.value);
        } else {
            return; // Wait for custom duration input
        }
    } else {
        if (customDurationGroup) customDurationGroup.style.display = 'none';
    }

    if (isNaN(duration) || duration < 1) return;

    const returnDate = new Date(borrowDate);
    returnDate.setDate(returnDate.getDate() + duration);
    returnDateField.value = returnDate.toISOString().split('T')[0];
}

/**
 * Handle borrow form submission
 */
async function handleBorrowFormSubmit() {
    const borrowBookId = document.getElementById('borrowBookId');
    const bookId = borrowBookId ? parseInt(borrowBookId.value) : null;
    const book = booksData.find(b => b.id === bookId);

    if (!book) return;

    // Check if this is a borrow or return action
    const borrowFormContent = document.getElementById('borrowFormContent');
    const isBorrowing = borrowFormContent && borrowFormContent.style.display !== 'none';

    if (isBorrowing) {
        // Mark as borrowed
        const memberId = document.getElementById('borrowMember')?.value;
        const borrowDate = document.getElementById('borrowDate')?.value;
        const returnDate = document.getElementById('returnDate')?.value;
        const notes = document.getElementById('borrowNotes')?.value.trim();

        // Validation
        if (!memberId) {
            alert('Please select a customer');
            return;
        }

        if (!borrowDate) {
            alert('Please select a borrow date');
            return;
        }

        if (!returnDate) {
            alert('Please set a return date');
            return;
        }

        if (new Date(returnDate) <= new Date(borrowDate)) {
            alert('Return date must be after borrow date');
            return;
        }

        await markBookAsBorrowed(bookId, memberId, borrowDate, returnDate, notes);
    } else {
        // Mark as returned
        await markBookAsReturned(bookId, book.borrowingId);
    }

    closeBorrowModal();
}

/**
 * Mark book as borrowed using borrowings API
 */
async function markBookAsBorrowed(bookId, memberId, borrowDate, dueDate, notes = '') {
    try {
        if (!memberId) {
            alert('Please select a customer');
            return;
        }

        const response = await fetch('http://localhost:3000/api/borrowings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                bookId: parseInt(bookId),
                memberId: parseInt(memberId),
                borrowDate,
                dueDate,
                notes
            })
        });

        const data = await response.json();

        if (data.success) {
            await loadBooks();
            renderBooksTable();
            renderBooksGrid();
            alert('Book borrowed successfully!');
            console.log('Book marked as borrowed:', data);
        } else {
            alert(data.message || 'Failed to borrow book');
        }
    } catch (error) {
        console.error('Error borrowing book:', error);
        alert('Error borrowing book. Please try again.');
    }
}

/**
 * Mark book as returned using borrowings API
 */
async function markBookAsReturned(bookId, borrowingId) {
    try {
        if (!borrowingId) {
            // Find the borrowing ID if not provided
            const book = booksData.find(b => b.id === bookId);
            borrowingId = book?.borrowingId;
        }

        if (!borrowingId) {
            alert('Could not find borrowing record');
            return;
        }

        const response = await fetch(`http://localhost:3000/api/borrowings/${borrowingId}/return`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                returnDate: new Date().toISOString().split('T')[0]
            })
        });

        const data = await response.json();

        if (data.success) {
            await loadBooks();
            renderBooksTable();
            renderBooksGrid();
            alert('Book returned successfully!');
            console.log('Book marked as returned:', data);
        } else {
            alert(data.message || 'Failed to return book');
        }
    } catch (error) {
        console.error('Error returning book:', error);
        alert('Error returning book. Please try again.');
    }
}

function closeBorrowModal() {
    hideModal('borrowModal');
    const borrowForm = document.getElementById('borrowForm');
    if (borrowForm) borrowForm.reset();

    // Reset searchable dropdown
    if (typeof window.resetBorrowMemberDropdown === 'function') {
        window.resetBorrowMemberDropdown();
    }

    // Reset UI elements
    const customDurationGroup = document.getElementById('customDurationGroup');
    if (customDurationGroup) customDurationGroup.style.display = 'none';

    const noCopiesWarning = document.getElementById('noCopiesAvailable');
    if (noCopiesWarning) noCopiesWarning.style.display = 'none';

    const overdueWarning = document.getElementById('overdueWarning');
    if (overdueWarning) overdueWarning.style.display = 'none';

    bookToBorrow = null;
}

// ========================================
// CUSTOMER PAGE FUNCTIONS
// ========================================

/**
 * Initialize customer page
 */
async function initCustomerPage() {
    // Initialize profile dropdown
    initProfileDropdown();

    await loadBooks();
    populateCustomerFilterDropdowns();
    renderBooksGrid();

    // Hide "My Borrowings" tab for admin/superadmin users (they don't have borrowings)
    const userType = sessionStorage.getItem('userType');
    if (userType === 'admin' || userType === 'superadmin') {
        const myBorrowingsTabBtn = document.getElementById('myBorrowingsTabBtn');
        const myBorrowingsTab = document.getElementById('myBorrowingsTab');
        if (myBorrowingsTabBtn) myBorrowingsTabBtn.style.display = 'none';
        if (myBorrowingsTab) myBorrowingsTab.style.display = 'none';
    }
}

// ========================================
// CUSTOMER BORROWINGS FUNCTIONS
// ========================================

let myBorrowingsData = [];
let filteredMyBorrowingsData = [];

/**
 * Switch between customer tabs (browse/myBorrowings)
 */
function switchCustomerTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.customer-tab-button').forEach(btn => {
        btn.classList.remove('active');
    });

    // Hide all tab contents
    document.querySelectorAll('.customer-tab-content').forEach(content => {
        content.classList.remove('active');
    });

    if (tabName === 'browse') {
        document.querySelector('.customer-tab-button:first-child').classList.add('active');
        document.getElementById('browseTab').classList.add('active');
    } else if (tabName === 'myBorrowings') {
        document.querySelector('.customer-tab-button:nth-child(2)').classList.add('active');
        document.getElementById('myBorrowingsTab').classList.add('active');
        loadMyBorrowings();
    }
}

/**
 * Load current customer's borrowings from API
 */
async function loadMyBorrowings() {
    const memberId = sessionStorage.getItem('userId');
    const userType = sessionStorage.getItem('userType');

    // Admin/superadmin users don't have borrowings
    if (userType === 'admin' || userType === 'superadmin') {
        myBorrowingsData = [];
        filteredMyBorrowingsData = [];
        renderMyBorrowingsList();
        return;
    }

    if (!memberId) {
        console.error('No user ID found in session');
        renderMyBorrowingsList();
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/borrowings/member/${memberId}`, {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
            myBorrowingsData = data.data || [];
            filteredMyBorrowingsData = [...myBorrowingsData];
            updateMyBorrowingsStats();
            renderMyBorrowingsList();
        } else {
            console.error('Failed to load borrowings:', data.message);
            myBorrowingsData = [];
            filteredMyBorrowingsData = [];
            renderMyBorrowingsList();
        }
    } catch (error) {
        console.error('Error loading customer borrowings:', error);
        myBorrowingsData = [];
        filteredMyBorrowingsData = [];
        renderMyBorrowingsList();
    }
}

/**
 * Filter customer's borrowings by status
 */
function filterMyBorrowings() {
    const statusFilter = document.getElementById('myBorrowingsFilter')?.value || '';

    if (!statusFilter) {
        filteredMyBorrowingsData = [...myBorrowingsData];
    } else {
        filteredMyBorrowingsData = myBorrowingsData.filter(borrowing => {
            const status = getBorrowingStatus(borrowing);
            return status === statusFilter;
        });
    }

    renderMyBorrowingsList();
}

/**
 * Update customer borrowings statistics
 */
function updateMyBorrowingsStats() {
    let currentlyBorrowed = 0;
    let overdue = 0;
    let returned = 0;

    myBorrowingsData.forEach(borrowing => {
        const status = getBorrowingStatus(borrowing);

        if (status === 'Borrowed') {
            currentlyBorrowed++;
        } else if (status === 'Overdue') {
            overdue++;
        } else if (status === 'Returned') {
            returned++;
        }
    });

    const currentlyBorrowedEl = document.getElementById('myCurrentlyBorrowedCount');
    if (currentlyBorrowedEl) currentlyBorrowedEl.textContent = currentlyBorrowed;

    const overdueEl = document.getElementById('myOverdueCount');
    if (overdueEl) overdueEl.textContent = overdue;

    const returnedEl = document.getElementById('myReturnedCount');
    if (returnedEl) returnedEl.textContent = returned;
}

/**
 * Render customer's borrowings list
 */
function renderMyBorrowingsList() {
    const listContainer = document.getElementById('myBorrowingsList');
    const emptyState = document.getElementById('myBorrowingsEmptyState');

    if (!listContainer) return;

    listContainer.innerHTML = '';

    if (filteredMyBorrowingsData.length === 0) {
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    filteredMyBorrowingsData.forEach(borrowing => {
        const card = createMyBorrowingCard(borrowing);
        listContainer.appendChild(card);
    });
}

/**
 * Create a borrowing card for customer view
 */
function createMyBorrowingCard(borrowing) {
    const card = document.createElement('div');
    card.className = 'my-borrowing-card';

    const status = getBorrowingStatus(borrowing);
    const statusClass = status.toLowerCase();

    const bookTitle = borrowing.book_title || borrowing.bookTitle || 'Unknown Book';
    const bookImage = borrowing.image_uri || borrowing.imageUri || null;
    const bookAuthor = borrowing.author || borrowing.book_author || 'Unknown Author';

    const borrowDate = formatDate(borrowing.borrow_date || borrowing.borrowDate);
    const dueDate = formatDate(borrowing.due_date || borrowing.dueDate);
    const returnDate = borrowing.return_date || borrowing.returnDate
        ? formatDate(borrowing.return_date || borrowing.returnDate)
        : null;

    // Calculate days remaining or overdue
    let daysInfo = '';
    if (status === 'Borrowed') {
        const dueDateObj = new Date(borrowing.due_date || borrowing.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((dueDateObj - today) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) {
            daysInfo = '<span class="days-info warning">Due today!</span>';
        } else if (diffDays === 1) {
            daysInfo = '<span class="days-info warning">Due tomorrow</span>';
        } else {
            daysInfo = `<span class="days-info">${diffDays} days remaining</span>`;
        }
    } else if (status === 'Overdue') {
        const dueDateObj = new Date(borrowing.due_date || borrowing.dueDate);
        const today = new Date();
        const diffDays = Math.ceil((today - dueDateObj) / (1000 * 60 * 60 * 24));
        daysInfo = `<span class="days-info overdue">${diffDays} days overdue!</span>`;
    }

    // Create book cover placeholder with book icon if no image
    let bookCoverHtml;
    if (bookImage) {
        bookCoverHtml = `<img src="${escapeHtml(bookImage)}" alt="${escapeHtml(bookTitle)}" onerror="this.parentElement.innerHTML='<div class=\\'book-cover-placeholder\\'><svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'32\\' height=\\'32\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'2\\' stroke-linecap=\\'round\\' stroke-linejoin=\\'round\\'><path d=\\'M4 19.5A2.5 2.5 0 0 1 6.5 17H20\\'></path><path d=\\'M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z\\'></path></svg></div>'">`;
    } else {
        bookCoverHtml = `
            <div class="book-cover-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
            </div>`;
    }

    card.innerHTML = `
        <div class="borrowing-card-image">
            ${bookCoverHtml}
        </div>
        <div class="borrowing-card-content">
            <h3 class="borrowing-book-title">${escapeHtml(bookTitle)}</h3>
            <p class="borrowing-book-author">by ${escapeHtml(bookAuthor)}</p>
            <div class="borrowing-dates">
                <div class="date-item">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="date-icon">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <div>
                        <span class="date-label">Borrowed on</span>
                        <span class="date-value">${borrowDate}</span>
                    </div>
                </div>
                <div class="date-item ${status === 'Overdue' ? 'overdue' : ''}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="date-icon">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <div>
                        <span class="date-label">Due date</span>
                        <span class="date-value">${dueDate}</span>
                    </div>
                </div>
                ${returnDate ? `
                <div class="date-item returned">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="date-icon">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <div>
                        <span class="date-label">Returned on</span>
                        <span class="date-value">${returnDate}</span>
                    </div>
                </div>
                ` : ''}
            </div>
            ${daysInfo}
        </div>
        <div class="borrowing-card-status">
            <span class="status-badge status-${statusClass}">${status}</span>
        </div>
    `;

    return card;
}

/**
 * Populate customer filter dropdowns with unique values from books
 */
function populateCustomerFilterDropdowns() {
    // Get unique authors
    const authors = [...new Set(booksData.map(book => book.author).filter(Boolean))].sort();
    const authorSelect = document.getElementById('filterAuthor');
    if (authorSelect) {
        authorSelect.innerHTML = '<option value="">All Authors</option>';
        authors.forEach(author => {
            const option = document.createElement('option');
            option.value = author;
            option.textContent = author;
            authorSelect.appendChild(option);
        });
    }

    // Get unique genres/categories
    const genres = [...new Set(booksData.map(book => book.category).filter(Boolean))].sort();
    const genreSelect = document.getElementById('filterGenre');
    if (genreSelect) {
        genreSelect.innerHTML = '<option value="">All Genres</option>';
        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre;
            option.textContent = genre;
            genreSelect.appendChild(option);
        });
    }

    // Get unique years
    const years = [...new Set(booksData.map(book => book.year).filter(Boolean))].sort((a, b) => b - a);
    const yearSelect = document.getElementById('filterYear');
    if (yearSelect) {
        yearSelect.innerHTML = '<option value="">All Years</option>';
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });
    }
}

/**
 * Apply filters to books grid
 */
function applyFilters() {
    const authorFilter = document.getElementById('filterAuthor')?.value || '';
    const genreFilter = document.getElementById('filterGenre')?.value || '';
    const yearFilter = document.getElementById('filterYear')?.value || '';
    const availabilityFilter = document.getElementById('filterAvailability')?.value || '';
    const searchQuery = document.getElementById('searchInput')?.value.toLowerCase().trim() || '';

    let filteredBooks = booksData.filter(book => {
        // Author filter
        if (authorFilter && book.author !== authorFilter) {
            return false;
        }

        // Genre/Category filter
        if (genreFilter && book.category !== genreFilter) {
            return false;
        }

        // Year filter
        if (yearFilter && book.year != yearFilter) {
            return false;
        }

        // Availability filter - handle type conversion from MySQL (1/0 vs true/false)
        const availableCopies = book.availableCopies ?? book.available_copies ?? 0;
        const bookIsAvailable = book.isAvailable === true || book.isAvailable === 1 || availableCopies > 0;

        if (availabilityFilter === 'available' && !bookIsAvailable) {
            return false;
        }
        if (availabilityFilter === 'borrowed' && bookIsAvailable) {
            return false;
        }

        // Search query filter
        if (searchQuery) {
            const matchesSearch =
                (book.title && book.title.toLowerCase().includes(searchQuery)) ||
                (book.author && book.author.toLowerCase().includes(searchQuery)) ||
                (book.category && book.category.toLowerCase().includes(searchQuery));
            if (!matchesSearch) {
                return false;
            }
        }

        return true;
    });

    // Apply sorting
    filteredBooks = sortBooks(filteredBooks, currentSortOption);

    renderBooksGrid(filteredBooks);
}

/**
 * Clear all filters and reset to show all books
 */
function clearFilters() {
    // Reset all filter dropdowns
    const filterAuthor = document.getElementById('filterAuthor');
    if (filterAuthor) filterAuthor.value = '';

    const filterGenre = document.getElementById('filterGenre');
    if (filterGenre) filterGenre.value = '';

    const filterYear = document.getElementById('filterYear');
    if (filterYear) filterYear.value = '';

    const filterAvailability = document.getElementById('filterAvailability');
    if (filterAvailability) filterAvailability.value = '';

    // Clear search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = '';

    // Reset sort to default
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) sortSelect.value = 'default';
    currentSortOption = 'default';

    // Render all books
    renderBooksGrid(booksData);
}

/**
 * Render books in customer grid view
 */
function renderBooksGrid(filteredBooks = null) {
    const booksGrid = document.getElementById('booksGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (!booksGrid) return;
    
    const books = filteredBooks !== null ? filteredBooks : booksData;
    
    booksGrid.innerHTML = '';
    
    if (books.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    books.forEach(book => {
        const card = createBookCard(book);
        booksGrid.appendChild(card);
    });
}

/**
 * Create a book card element
 */
function createBookCard(book) {
    const card = document.createElement('div');
    card.onclick = () => openBookDetailsModal(book.id);

    // Calculate availability
    const totalCopies = book.totalCopies || book.total_copies || 1;
    const availableCopies = book.availableCopies !== undefined ? book.availableCopies : (book.available_copies !== undefined ? book.available_copies : (book.isAvailable ? totalCopies : 0));
    const hasAvailableCopies = availableCopies > 0;

    // Add unavailable class if no copies available
    card.className = hasAvailableCopies ? 'book-card' : 'book-card unavailable';

    // Create availability badge with copies count
    let availabilityBadge;
    if (hasAvailableCopies) {
        availabilityBadge = `<span class="availability-badge available">${availableCopies} Available</span>`;
    } else {
        availabilityBadge = '<span class="availability-badge not-available">Not Available</span>';
    }

    // Show return info when no copies available
    let returnInfo = '';
    if (!hasAvailableCopies) {
        const nextAvailable = book.nextAvailableDate || book.returnDate;
        if (nextAvailable) {
            returnInfo = `<div class="return-info">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="return-icon">
                       <circle cx="12" cy="12" r="10"></circle>
                       <polyline points="12 6 12 12 16 14"></polyline>
                   </svg>
                   <span>Available again: ${formatDate(nextAvailable)}</span>
               </div>`;
        } else {
            returnInfo = `<div class="return-info">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="return-icon">
                       <circle cx="12" cy="12" r="10"></circle>
                       <polyline points="12 6 12 12 16 14"></polyline>
                   </svg>
                   <span>All copies currently borrowed</span>
               </div>`;
        }
    }

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
                <p class="book-author">by ${escapeHtml(book.author || 'Unknown')}</p>
            </div>
            <div class="book-card-body">
                <div class="book-meta">
                    <span class="book-meta-label">Year:</span>
                    <span>${book.year || 'N/A'}</span>
                </div>
                <span class="book-category">${escapeHtml(book.category || 'Uncategorized')}</span>
                ${returnInfo}
            </div>
        </div>
    `;

    return card;
}

/**
 * Open book details modal
 */
function openBookDetailsModal(bookId) {
    const book = booksData.find(b => b.id === bookId);
    if (!book) return;

    const detailBookImage = document.getElementById('detailBookImage');
    if (detailBookImage) detailBookImage.src = book.image || 'https://via.placeholder.com/300x450?text=No+Cover';

    const detailBookTitle = document.getElementById('detailBookTitle');
    if (detailBookTitle) detailBookTitle.textContent = book.title;

    const detailBookAuthor = document.getElementById('detailBookAuthor');
    if (detailBookAuthor) detailBookAuthor.textContent = book.author || 'Unknown';

    const detailBookCategory = document.getElementById('detailBookCategory');
    if (detailBookCategory) detailBookCategory.textContent = book.category || 'Uncategorized';

    const detailBookYear = document.getElementById('detailBookYear');
    if (detailBookYear) detailBookYear.textContent = book.year || 'N/A';

    const detailBookDescription = document.getElementById('detailBookDescription');
    if (detailBookDescription) detailBookDescription.textContent = book.description || 'No description available.';

    // Calculate availability
    const totalCopies = book.totalCopies || book.total_copies || 1;
    const availableCopies = book.availableCopies !== undefined ? book.availableCopies : (book.isAvailable ? totalCopies : 0);
    const hasAvailableCopies = availableCopies > 0;

    const statusElement = document.getElementById('detailBookStatus');
    if (statusElement) {
        if (hasAvailableCopies) {
            statusElement.innerHTML = `
                <span class="status-badge status-available">Available</span>
                <p class="detail-copies-info">${availableCopies} of ${totalCopies} copies available</p>
            `;
        } else {
            const nextAvailable = book.nextAvailableDate || book.returnDate;
            let returnInfoHtml = '';
            if (nextAvailable) {
                returnInfoHtml = `<p class="detail-return-info">Next copy available: ${formatDate(nextAvailable)}</p>`;
            } else {
                returnInfoHtml = `<p class="detail-return-info">All ${totalCopies} copies are currently borrowed</p>`;
            }
            statusElement.innerHTML = `
                <span class="status-badge status-borrowed">Not Available</span>
                ${returnInfoHtml}
            `;
        }
    }

    showModal('bookDetailsModal');
}

function closeBookDetailsModal() {
    hideModal('bookDetailsModal');
}

/**
 * Handle search input
 */
function handleSearch() {
    // Use applyFilters to handle search along with other filters
    applyFilters();
}

/**
 * Handle sort selection
 */
function handleSort() {
    const sortSelect = document.getElementById('sortSelect');
    if (!sortSelect) return;

    currentSortOption = sortSelect.value;

    // Use applyFilters to handle sorting along with other filters
    applyFilters();
}

/**
 * Sort books based on option
 */
function sortBooks(books, sortOption) {
    const sortedBooks = [...books];
    
    switch (sortOption) {
        case 'title-asc':
            return sortedBooks.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        case 'title-desc':
            return sortedBooks.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        case 'author-asc':
            return sortedBooks.sort((a, b) => (a.author || '').localeCompare(b.author || ''));
        case 'author-desc':
            return sortedBooks.sort((a, b) => (b.author || '').localeCompare(a.author || ''));
        case 'year-asc':
            return sortedBooks.sort((a, b) => (a.year || 0) - (b.year || 0));
        case 'year-desc':
            return sortedBooks.sort((a, b) => (b.year || 0) - (a.year || 0));
        case 'category-asc':
            return sortedBooks.sort((a, b) => (a.category || '').localeCompare(b.category || ''));
        case 'category-desc':
            return sortedBooks.sort((a, b) => (b.category || '').localeCompare(a.category || ''));
        default:
            return sortedBooks.sort((a, b) => a.id - b.id);
    }
}

// ========================================
// SUPER ADMIN PAGE FUNCTIONS
// ========================================

/**
 * Initialize super admin dashboard
 */
async function initSuperAdminPage() {
    // Initialize profile dropdown
    initProfileDropdown();

    await Promise.all([
        loadBooks(),
        loadCustomers(),
        loadAdmins(),
        loadAuthors(),
        loadGenres(),
        loadPublishers()
    ]);
    
    renderBooksTable();
    renderCustomersTable();
    renderAdminsTable();
    populateFormDropdowns();
    
    const bookForm = document.getElementById('bookForm');
    if (bookForm) {
        bookForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleBookFormSubmit();
        });
    }
    
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleUserFormSubmit();
        });
    }
    
    const borrowForm = document.getElementById('borrowForm');
    if (borrowForm) {
        borrowForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleBorrowFormSubmit();
        });
    }
}

/**
 * Switch between tabs
 */
function switchTab(tabName) {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(btn => btn.classList.remove('active'));

    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));

    const activeButton = Array.from(tabButtons).find(btn =>
        btn.textContent.toLowerCase().includes(tabName)
    );
    if (activeButton) {
        activeButton.classList.add('active');
    }

    const contentMap = {
        'books': 'booksTab',
        'customers': 'customersTab',
        'admins': 'adminsTab',
        'borrowings': 'borrowingsTab'
    };

    const activeContent = document.getElementById(contentMap[tabName]);
    if (activeContent) {
        activeContent.classList.add('active');
    }

    // Load borrowings data when switching to borrowings tab
    if (tabName === 'borrowings') {
        loadBorrowings();
    }
}

// ========================================
// BORROWINGS MANAGEMENT FUNCTIONS
// ========================================

let borrowingsData = [];
let filteredBorrowingsData = [];

/**
 * Load all borrowings from API
 */
async function loadBorrowings() {
    try {
        const response = await fetch('http://localhost:3000/api/borrowings', {
            credentials: 'include'
        });
        const data = await response.json();

        if (data.success) {
            borrowingsData = data.data || [];
            // Apply current filter (default excludes returned books)
            filterBorrowings();
            updateBorrowingsStats();
        } else {
            console.error('Failed to load borrowings:', data.message);
            borrowingsData = [];
            filteredBorrowingsData = [];
            renderBorrowingsTable();
        }
    } catch (error) {
        console.error('Error loading borrowings:', error);
        borrowingsData = [];
        filteredBorrowingsData = [];
        renderBorrowingsTable();
    }
}

/**
 * Refresh borrowings data
 */
function refreshBorrowings() {
    loadBorrowings();
}

/**
 * Filter borrowings by status
 * By default (All Status), shows only active borrowings (excludes returned)
 */
function filterBorrowings() {
    const statusFilter = document.getElementById('borrowingsStatusFilter')?.value || '';
    const searchTerm = document.getElementById('borrowingsSearch')?.value.toLowerCase() || '';
    const sortOption = document.getElementById('borrowingsSort')?.value || 'default';

    // Start with all borrowings
    let filtered = [...borrowingsData];

    // Apply status filter
    if (statusFilter === 'all') {
        // Show all borrowings
    } else if (!statusFilter) {
        // Default: show only active borrowings (Borrowed and Overdue), exclude Returned
        filtered = filtered.filter(borrowing => {
            const status = getBorrowingStatus(borrowing);
            return status !== 'Returned';
        });
    } else {
        filtered = filtered.filter(borrowing => {
            const status = getBorrowingStatus(borrowing);
            return status === statusFilter;
        });
    }

    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(borrowing => {
            const bookTitle = (borrowing.book_title || borrowing.bookTitle || '').toLowerCase();
            const customerName = (borrowing.customer_name || borrowing.customerName || '').toLowerCase();
            return bookTitle.includes(searchTerm) || customerName.includes(searchTerm);
        });
    }

    // Apply sorting
    if (sortOption !== 'default') {
        filtered.sort((a, b) => {
            switch (sortOption) {
                case 'borrow-asc':
                    return new Date(a.borrow_date || a.borrowDate) - new Date(b.borrow_date || b.borrowDate);
                case 'borrow-desc':
                    return new Date(b.borrow_date || b.borrowDate) - new Date(a.borrow_date || a.borrowDate);
                case 'due-asc':
                    return new Date(a.due_date || a.dueDate) - new Date(b.due_date || b.dueDate);
                case 'due-desc':
                    return new Date(b.due_date || b.dueDate) - new Date(a.due_date || a.dueDate);
                case 'book-asc':
                    return (a.book_title || a.bookTitle || '').localeCompare(b.book_title || b.bookTitle || '');
                case 'book-desc':
                    return (b.book_title || b.bookTitle || '').localeCompare(a.book_title || a.bookTitle || '');
                case 'customer-asc':
                    return (a.customer_name || a.customerName || '').localeCompare(b.customer_name || b.customerName || '');
                case 'customer-desc':
                    return (b.customer_name || b.customerName || '').localeCompare(a.customer_name || a.customerName || '');
                default:
                    return 0;
            }
        });
    }

    filteredBorrowingsData = filtered;
    renderBorrowingsTable();
}

/**
 * Clear all borrowing filters
 */
function clearBorrowingFilters() {
    const searchInput = document.getElementById('borrowingsSearch');
    const sortSelect = document.getElementById('borrowingsSort');
    const statusSelect = document.getElementById('borrowingsStatusFilter');

    if (searchInput) searchInput.value = '';
    if (sortSelect) sortSelect.value = 'default';
    if (statusSelect) statusSelect.value = '';

    filterBorrowings();
}

/**
 * Get borrowing status
 */
function getBorrowingStatus(borrowing) {
    if (borrowing.return_date || borrowing.returnDate) {
        return 'Returned';
    }

    const dueDate = new Date(borrowing.due_date || borrowing.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dueDate < today) {
        return 'Overdue';
    }

    return 'Borrowed';
}

/**
 * Update borrowings statistics
 */
function updateBorrowingsStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let borrowedCount = 0;
    let overdueCount = 0;
    let returnedThisMonth = 0;

    borrowingsData.forEach(borrowing => {
        const status = getBorrowingStatus(borrowing);

        if (status === 'Borrowed') {
            borrowedCount++;
        } else if (status === 'Overdue') {
            overdueCount++;
        } else if (status === 'Returned') {
            const returnDate = new Date(borrowing.return_date || borrowing.returnDate);
            if (returnDate.getMonth() === currentMonth && returnDate.getFullYear() === currentYear) {
                returnedThisMonth++;
            }
        }
    });

    const totalBorrowedEl = document.getElementById('totalBorrowedCount');
    if (totalBorrowedEl) totalBorrowedEl.textContent = borrowedCount;

    const overdueEl = document.getElementById('overdueCount');
    if (overdueEl) overdueEl.textContent = overdueCount;

    const returnedEl = document.getElementById('returnedCount');
    if (returnedEl) returnedEl.textContent = returnedThisMonth;
}

/**
 * Render borrowings table
 */
function renderBorrowingsTable() {
    const tableBody = document.getElementById('borrowingsTableBody');
    const emptyState = document.getElementById('borrowingsEmptyState');

    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (filteredBorrowingsData.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    filteredBorrowingsData.forEach(borrowing => {
        const row = createBorrowingRow(borrowing);
        tableBody.appendChild(row);
    });
}

/**
 * Create a borrowing table row
 */
function createBorrowingRow(borrowing) {
    const row = document.createElement('tr');

    const status = getBorrowingStatus(borrowing);
    const statusClass = status.toLowerCase().replace(' ', '-');

    const bookTitle = borrowing.book_title || borrowing.bookTitle || 'Unknown Book';
    const customerName = borrowing.member_name || borrowing.memberName ||
        `${borrowing.first_name || ''} ${borrowing.last_name || ''}`.trim() || 'Unknown Customer';
    const customerEmail = borrowing.member_email || borrowing.memberEmail || borrowing.email || '';

    const borrowDate = formatDate(borrowing.borrow_date || borrowing.borrowDate);
    const dueDate = formatDate(borrowing.due_date || borrowing.dueDate);
    const returnDate = borrowing.return_date || borrowing.returnDate
        ? formatDate(borrowing.return_date || borrowing.returnDate)
        : '-';

    // Calculate days overdue if applicable
    let overdueInfo = '';
    if (status === 'Overdue') {
        const dueDateObj = new Date(borrowing.due_date || borrowing.dueDate);
        const today = new Date();
        const diffDays = Math.ceil((today - dueDateObj) / (1000 * 60 * 60 * 24));
        overdueInfo = `<span class="overdue-days">(${diffDays} days)</span>`;
    }

    row.innerHTML = `
        <td>${borrowing.borrowing_id || borrowing.id}</td>
        <td>
            <div class="borrowing-book-info">
                <span class="book-title">${escapeHtml(bookTitle)}</span>
            </div>
        </td>
        <td>
            <div class="borrowing-customer-info">
                <span class="customer-name">${escapeHtml(customerName)}</span>
                ${customerEmail ? `<span class="customer-email">${escapeHtml(customerEmail)}</span>` : ''}
            </div>
        </td>
        <td>${borrowDate}</td>
        <td>${dueDate}</td>
        <td>${returnDate}</td>
        <td>
            <span class="status-badge status-${statusClass}">${status}</span>
            ${overdueInfo}
        </td>
        <td>
            <div class="action-buttons">
                ${status !== 'Returned' ? `
                    <button class="btn-action btn-return" onclick="returnBorrowedBook(${borrowing.borrowing_id || borrowing.id})" title="Mark as Returned">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </button>
                ` : ''}
                <button class="btn-action btn-view" onclick="viewBorrowingDetails(${borrowing.borrowing_id || borrowing.id})" title="View Details">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                </button>
            </div>
        </td>
    `;

    return row;
}

/**
 * Return a borrowed book
 */
async function returnBorrowedBook(borrowingId) {
    if (!confirm('Mark this book as returned?')) return;

    try {
        const response = await fetch(`http://localhost:3000/api/borrowings/${borrowingId}/return`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                returnDate: new Date().toISOString().split('T')[0]
            })
        });

        const data = await response.json();

        if (data.success) {
            alert('Book returned successfully!');
            await loadBorrowings();
            await loadBooks();
            renderBooksTable();
        } else {
            alert(data.message || 'Failed to return book');
        }
    } catch (error) {
        console.error('Error returning book:', error);
        alert('Error returning book. Please try again.');
    }
}

// Store current borrowing ID for return from details modal
let currentBorrowingId = null;

/**
 * View borrowing details in modal
 */
function viewBorrowingDetails(borrowingId) {
    const borrowing = borrowingsData.find(b => (b.borrowing_id || b.id) === borrowingId);
    if (!borrowing) return;

    currentBorrowingId = borrowingId;

    const status = getBorrowingStatus(borrowing);
    const statusClass = status.toLowerCase();
    const bookTitle = borrowing.book_title || borrowing.bookTitle || 'Unknown Book';
    const customerName = borrowing.member_name || borrowing.memberName ||
        `${borrowing.first_name || ''} ${borrowing.last_name || ''}`.trim() || 'Unknown Customer';
    const customerEmail = borrowing.member_email || borrowing.memberEmail || borrowing.email || 'N/A';

    const borrowDate = formatDate(borrowing.borrow_date || borrowing.borrowDate);
    const dueDate = formatDate(borrowing.due_date || borrowing.dueDate);
    const returnDate = borrowing.return_date || borrowing.returnDate
        ? formatDate(borrowing.return_date || borrowing.returnDate)
        : 'Not returned yet';
    const notes = borrowing.notes || 'No notes';

    // Populate modal fields
    const bookTitleEl = document.getElementById('detailBorrowingBookTitle');
    if (bookTitleEl) bookTitleEl.textContent = bookTitle;

    const customerNameEl = document.getElementById('detailBorrowingCustomerName');
    if (customerNameEl) customerNameEl.textContent = customerName;

    const customerEmailEl = document.getElementById('detailBorrowingCustomerEmail');
    if (customerEmailEl) customerEmailEl.textContent = customerEmail;

    const borrowDateEl = document.getElementById('detailBorrowingBorrowDate');
    if (borrowDateEl) borrowDateEl.textContent = borrowDate;

    const dueDateEl = document.getElementById('detailBorrowingDueDate');
    if (dueDateEl) {
        dueDateEl.textContent = dueDate;
        dueDateEl.className = 'detail-value';
        if (status === 'Overdue') {
            dueDateEl.classList.add('text-danger');
        }
    }

    const returnDateEl = document.getElementById('detailBorrowingReturnDate');
    if (returnDateEl) {
        returnDateEl.textContent = returnDate;
        returnDateEl.className = 'detail-value';
        if (status === 'Returned') {
            returnDateEl.classList.add('text-success');
        }
    }

    const statusEl = document.getElementById('detailBorrowingStatus');
    if (statusEl) {
        statusEl.innerHTML = `<span class="status-badge status-${statusClass}">${status}</span>`;
    }

    const notesEl = document.getElementById('detailBorrowingNotes');
    if (notesEl) notesEl.textContent = notes;

    // Show/hide return button based on status
    const returnBtn = document.getElementById('detailReturnBtn');
    if (returnBtn) {
        returnBtn.style.display = status !== 'Returned' ? 'inline-flex' : 'none';
    }

    // Show modal
    showModal('borrowingDetailsModal');
}

/**
 * Close borrowing details modal
 */
function closeBorrowingDetailsModal() {
    hideModal('borrowingDetailsModal');
    currentBorrowingId = null;
}

/**
 * Return book from details modal
 */
async function returnFromDetailsModal() {
    if (!currentBorrowingId) return;

    if (!confirm('Mark this book as returned?')) return;

    try {
        const response = await fetch(`http://localhost:3000/api/borrowings/${currentBorrowingId}/return`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                returnDate: new Date().toISOString().split('T')[0]
            })
        });

        const data = await response.json();

        if (data.success) {
            closeBorrowingDetailsModal();
            alert('Book returned successfully!');
            await loadBorrowings();
            await loadBooks();
            renderBooksTable();
        } else {
            alert(data.message || 'Failed to return book');
        }
    } catch (error) {
        console.error('Error returning book:', error);
        alert('Error returning book. Please try again.');
    }
}

/**
 * Render customers table
 */
function renderCustomersTable() {
    const tableBody = document.getElementById('customersTableBody');
    const emptyState = document.getElementById('customersEmptyState');

    if (!tableBody) return;

    tableBody.innerHTML = '';

    // Always use filtered data - it's initialized with all data on load
    const dataToRender = filteredCustomersData;

    if (dataToRender.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    dataToRender.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.id}</td>
            <td>${escapeHtml(customer.name)}</td>
            <td>${escapeHtml(customer.email)}</td>
            <td>${escapeHtml(customer.phone || 'N/A')}</td>
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
 * Render customers table for Admin Dashboard (Delete only - no Edit)
 */
function renderAdminCustomersTable() {
    const tableBody = document.getElementById('customersTableBody');
    const emptyState = document.getElementById('customersEmptyState');

    if (!tableBody) return;

    tableBody.innerHTML = '';

    // Always use filtered data - it's initialized with all data on load
    const dataToRender = filteredCustomersData;

    if (dataToRender.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    dataToRender.forEach(customer => {
        const row = document.createElement('tr');
        const statusBadge = customer.isActive !== false
            ? '<span class="badge badge-success">Active</span>'
            : '<span class="badge badge-secondary">Inactive</span>';
        row.innerHTML = `
            <td>${customer.id}</td>
            <td>${escapeHtml(customer.name)}</td>
            <td>${escapeHtml(customer.email)}</td>
            <td>${escapeHtml(customer.phone || 'N/A')}</td>
            <td>${formatDate(customer.joinedDate)}</td>
            <td>${statusBadge}</td>
            <td>
                <div class="action-buttons">
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
 * Filter and sort admin customers table
 */
function filterAdminCustomers() {
    const searchTerm = document.getElementById('adminCustomerSearch')?.value.toLowerCase() || '';
    const sortOption = document.getElementById('adminCustomerSort')?.value || 'default';

    // Start with all customers
    let filtered = [...customersData];

    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(customer => {
            const name = (customer.name || '').toLowerCase();
            const email = (customer.email || '').toLowerCase();
            const phone = (customer.phone || '').toLowerCase();
            return name.includes(searchTerm) ||
                   email.includes(searchTerm) ||
                   phone.includes(searchTerm);
        });
    }

    // Apply sorting
    if (sortOption !== 'default') {
        filtered.sort((a, b) => {
            switch (sortOption) {
                case 'name-asc':
                    return (a.name || '').localeCompare(b.name || '');
                case 'name-desc':
                    return (b.name || '').localeCompare(a.name || '');
                case 'email-asc':
                    return (a.email || '').localeCompare(b.email || '');
                case 'email-desc':
                    return (b.email || '').localeCompare(a.email || '');
                case 'date-asc':
                    return new Date(a.joinedDate || 0) - new Date(b.joinedDate || 0);
                case 'date-desc':
                    return new Date(b.joinedDate || 0) - new Date(a.joinedDate || 0);
                default:
                    return 0;
            }
        });
    }

    filteredCustomersData = filtered;
    // Render correct table based on page (admin vs superadmin)
    if (window.location.pathname.includes('superadmin')) {
        renderCustomersTable();
    } else {
        renderAdminCustomersTable();
    }
}

/**
 * Clear all admin customer filters
 */
function clearAdminCustomerFilters() {
    const searchInput = document.getElementById('adminCustomerSearch');
    const sortSelect = document.getElementById('adminCustomerSort');

    if (searchInput) searchInput.value = '';
    if (sortSelect) sortSelect.value = 'default';

    filteredCustomersData = [...customersData];
    // Render correct table based on page (admin vs superadmin)
    if (window.location.pathname.includes('superadmin')) {
        renderCustomersTable();
    } else {
        renderAdminCustomersTable();
    }
}

/**
 * Render admins table
 */
function renderAdminsTable() {
    const tableBody = document.getElementById('adminsTableBody');
    const emptyState = document.getElementById('adminsEmptyState');

    if (!tableBody) return;

    tableBody.innerHTML = '';

    // Always use filtered data - it's initialized with all data on load
    const dataToRender = filteredAdminsData;

    if (dataToRender.length === 0 && adminsData.length === 0) {
        if (emptyState) {
            emptyState.style.display = 'block';
            // Show error message if there was an issue loading
            if (adminsLoadError) {
                emptyState.innerHTML = `
                    <div class="empty-state-content">
                        <i class="empty-icon">⚠️</i>
                        <h3>${adminsLoadError}</h3>
                        <p>Please make sure you are logged in as a Super Admin to manage administrators.</p>
                        <button class="btn btn-primary" onclick="window.location.href='index.html'">Go to Login</button>
                    </div>
                `;
            } else {
                emptyState.innerHTML = `
                    <div class="empty-state-content">
                        <i class="empty-icon">👥</i>
                        <h3>No administrators found</h3>
                        <p>Click "Add New Admin" to get started.</p>
                    </div>
                `;
            }
        }
        return;
    }

    if (dataToRender.length === 0) {
        if (emptyState) {
            emptyState.style.display = 'block';
            emptyState.innerHTML = `
                <div class="empty-state-content">
                    <i class="empty-icon">🔍</i>
                    <h3>No results found</h3>
                    <p>Try adjusting your search or filters.</p>
                </div>
            `;
        }
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    dataToRender.forEach(admin => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${admin.id}</td>
            <td>${escapeHtml(admin.name)}</td>
            <td>${escapeHtml(admin.email)}</td>
            <td>${escapeHtml(admin.phone || 'N/A')}</td>
            <td><span class="badge badge-admin">${escapeHtml(admin.role)}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-edit" onclick="openEditUserModal(${admin.id}, 'admin', '${admin.adminType || 'regular'}')">
                        Edit
                    </button>
                    <button class="btn btn-sm btn-delete" onclick="openDeleteUserModal(${admin.id}, 'admin', '${admin.adminType || 'regular'}')">
                        Delete
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

/**
 * Filter and sort admin admins table
 */
function filterAdminAdmins() {
    const searchTerm = document.getElementById('adminAdminSearch')?.value.toLowerCase() || '';
    const sortOption = document.getElementById('adminAdminSort')?.value || 'default';
    const roleFilter = document.getElementById('adminRoleFilter')?.value || '';

    // Start with all admins
    let filtered = [...adminsData];

    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(admin => {
            const name = (admin.name || '').toLowerCase();
            const email = (admin.email || '').toLowerCase();
            const phone = (admin.phone || '').toLowerCase();
            return name.includes(searchTerm) ||
                   email.includes(searchTerm) ||
                   phone.includes(searchTerm);
        });
    }

    // Apply role filter
    if (roleFilter) {
        filtered = filtered.filter(admin => {
            const adminRole = (admin.role || '').toLowerCase();
            return adminRole === roleFilter.toLowerCase();
        });
    }

    // Apply sorting
    if (sortOption !== 'default') {
        filtered.sort((a, b) => {
            switch (sortOption) {
                case 'name-asc':
                    return (a.name || '').localeCompare(b.name || '');
                case 'name-desc':
                    return (b.name || '').localeCompare(a.name || '');
                case 'email-asc':
                    return (a.email || '').localeCompare(b.email || '');
                case 'email-desc':
                    return (b.email || '').localeCompare(a.email || '');
                default:
                    return 0;
            }
        });
    }

    filteredAdminsData = filtered;
    renderAdminsTable();
}

/**
 * Clear all admin admin filters
 */
function clearAdminAdminFilters() {
    const searchInput = document.getElementById('adminAdminSearch');
    const sortSelect = document.getElementById('adminAdminSort');
    const roleSelect = document.getElementById('adminRoleFilter');

    if (searchInput) searchInput.value = '';
    if (sortSelect) sortSelect.value = 'default';
    if (roleSelect) roleSelect.value = '';

    filteredAdminsData = [...adminsData];
    renderAdminsTable();
}

/**
 * Open add user modal
 */
function openAddUserModal(type) {
    userToEdit = null;
    
    const modalTitle = document.getElementById('userModalTitle');
    const saveBtn = document.getElementById('saveUserBtn');
    const roleGroup = document.getElementById('roleGroup');
    const adminFields = document.getElementById('adminFields');
    const customerFields = document.getElementById('customerFields');
    const passwordRequired = document.getElementById('passwordRequired');
    const passwordHint = document.getElementById('passwordHint');
    const userPassword = document.getElementById('userPassword');
    
    // Reset form
    const userForm = document.getElementById('userForm');
    if (userForm) userForm.reset();
    
    // Password is required for new users
    if (passwordRequired) passwordRequired.style.display = 'inline';
    if (passwordHint) passwordHint.style.display = 'none';
    if (userPassword) userPassword.required = true;
    
    if (type === 'customer') {
        if (modalTitle) modalTitle.textContent = 'Add New Customer';
        if (saveBtn) saveBtn.textContent = 'Save Customer';
        if (roleGroup) roleGroup.style.display = 'none';
        if (adminFields) adminFields.style.display = 'none';
        if (customerFields) customerFields.style.display = 'block';
    } else {
        if (modalTitle) modalTitle.textContent = 'Add New Administrator';
        if (saveBtn) saveBtn.textContent = 'Save Administrator';
        if (roleGroup) roleGroup.style.display = 'block';
        if (adminFields) adminFields.style.display = 'block';
        if (customerFields) customerFields.style.display = 'none';
    }
    
    const userId = document.getElementById('userId');
    if (userId) userId.value = '';
    
    const userType = document.getElementById('userType');
    if (userType) userType.value = type;
    
    const userAdminType = document.getElementById('userAdminType');
    if (userAdminType) userAdminType.value = '';
    
    showModal('userModal');
}

/**
 * Open edit user modal
 */
function openEditUserModal(userId, type, adminType = 'regular') {
    console.log('openEditUserModal called:', { userId, type, adminType });
    
    let userData;
    if (type === 'customer') {
        userData = customersData.find(u => u.id === userId);
    } else {
        // For admins, we need to match both ID and adminType to avoid conflicts
        // (since regular admins and super admins can have the same ID)
        userData = adminsData.find(u => u.id === userId && u.adminType === adminType);
        
        // If not found with adminType, try without it (for backward compatibility)
        if (!userData) {
            userData = adminsData.find(u => u.id === userId);
            if (userData) {
                console.warn('Found admin without adminType match, using found adminType:', userData.adminType);
                adminType = userData.adminType || adminType;
            }
        }
    }
    
    if (!userData) {
        console.error('User not found:', { userId, type, adminType, availableAdmins: adminsData.map(a => ({ id: a.id, adminType: a.adminType })) });
        alert('User not found. Please refresh the page and try again.');
        return;
    }
    
    console.log('Found userData:', userData);
    userToEdit = { ...userData, adminType };
    
    const modalTitle = document.getElementById('userModalTitle');
    const saveBtn = document.getElementById('saveUserBtn');
    const roleGroup = document.getElementById('roleGroup');
    const adminFields = document.getElementById('adminFields');
    const customerFields = document.getElementById('customerFields');
    const passwordRequired = document.getElementById('passwordRequired');
    const passwordHint = document.getElementById('passwordHint');
    const userPassword = document.getElementById('userPassword');
    
    // Password is optional for editing
    if (passwordRequired) passwordRequired.style.display = 'none';
    if (passwordHint) passwordHint.style.display = 'block';
    if (userPassword) userPassword.required = false;
    
    if (type === 'customer') {
        if (modalTitle) modalTitle.textContent = 'Edit Customer';
        if (saveBtn) saveBtn.textContent = 'Update Customer';
        if (roleGroup) roleGroup.style.display = 'none';
        if (adminFields) adminFields.style.display = 'none';
        if (customerFields) customerFields.style.display = 'block';
    } else {
        if (modalTitle) modalTitle.textContent = 'Edit Administrator';
        if (saveBtn) saveBtn.textContent = 'Update Administrator';
        if (roleGroup) roleGroup.style.display = 'block';
        if (adminFields) adminFields.style.display = 'block';
        if (customerFields) customerFields.style.display = 'none';
    }
    
    // Populate form fields
    const userIdField = document.getElementById('userId');
    if (userIdField) userIdField.value = userData.id;
    
    const userTypeField = document.getElementById('userType');
    if (userTypeField) userTypeField.value = type;
    
    const userAdminTypeField = document.getElementById('userAdminType');
    if (userAdminTypeField) userAdminTypeField.value = adminType;
    
    // Name fields - split if combined, or use separate first/last
    const userFirstName = document.getElementById('userFirstName');
    const userLastName = document.getElementById('userLastName');
    if (userFirstName && userLastName) {
        if (userData.firstName && userData.lastName) {
            userFirstName.value = userData.firstName;
            userLastName.value = userData.lastName;
        } else if (userData.name) {
            // Split full name if separate fields don't exist
            const nameParts = userData.name.split(' ');
            userFirstName.value = nameParts[0] || '';
            userLastName.value = nameParts.slice(1).join(' ') || '';
        }
    }
    
    const userEmail = document.getElementById('userEmail');
    if (userEmail) userEmail.value = userData.email || '';
    
    const userPhone = document.getElementById('userPhone');
    if (userPhone) userPhone.value = userData.phone || '';
    
    const userAddress = document.getElementById('userAddress');
    if (userAddress) userAddress.value = userData.address || '';
    
    const userDateOfBirth = document.getElementById('userDateOfBirth');
    if (userDateOfBirth && userData.dateOfBirth) {
        // Format date for input field (YYYY-MM-DD)
        const date = new Date(userData.dateOfBirth);
        userDateOfBirth.value = date.toISOString().split('T')[0];
    }
    
    const userNationalId = document.getElementById('userNationalId');
    if (userNationalId) userNationalId.value = userData.nationalId || '';
    
    const userPasswordField = document.getElementById('userPassword');
    if (userPasswordField) userPasswordField.value = '';
    
    // Set role for admin editing
    if (type === 'admin') {
        const userRole = document.getElementById('userRole');
        if (userRole) {
            // Map adminType to role display value
            if (userData.role) {
                userRole.value = userData.role;
            } else if (adminType === 'super') {
                userRole.value = 'Super Admin';
            } else {
                userRole.value = 'Admin';
            }
            console.log('Set role field to:', userRole.value);
        }
    }
    
    // Customer membership end date
    const userMembershipEnd = document.getElementById('userMembershipEnd');
    if (userMembershipEnd && userData.membershipEndDate) {
        const date = new Date(userData.membershipEndDate);
        userMembershipEnd.value = date.toISOString().split('T')[0];
    }
    
    showModal('userModal');
}

/**
 * Handle user form submission
 */
async function handleUserFormSubmit() {
    const userIdField = document.getElementById('userId');
    const userId = userIdField ? userIdField.value : '';
    
    const userType = document.getElementById('userType')?.value;
    const firstName = document.getElementById('userFirstName')?.value.trim();
    const lastName = document.getElementById('userLastName')?.value.trim();
    const email = document.getElementById('userEmail')?.value.trim();
    const phone = document.getElementById('userPhone')?.value.trim();
    const password = document.getElementById('userPassword')?.value;
    const address = document.getElementById('userAddress')?.value.trim();
    const dateOfBirth = document.getElementById('userDateOfBirth')?.value;
    const nationalId = document.getElementById('userNationalId')?.value.trim();
    const membershipEndDate = document.getElementById('userMembershipEnd')?.value;
    const adminType = document.getElementById('userAdminType')?.value;
    
    // Validation
    if (!firstName || !lastName) {
        alert('Please fill in first name and last name');
        return;
    }

    // Validate first name (letters only, no numbers)
    if (!Validators.isValidName(firstName)) {
        alert('First name can only contain letters, spaces, hyphens, and apostrophes (no numbers)');
        return;
    }

    // Validate last name (letters only, no numbers)
    if (!Validators.isValidName(lastName)) {
        alert('Last name can only contain letters, spaces, hyphens, and apostrophes (no numbers)');
        return;
    }

    if (!email) {
        alert('Please fill in email address');
        return;
    }

    if (!isValidEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }

    // Validate phone number (numbers only, no letters)
    if (phone && !Validators.isValidPhone(phone)) {
        alert('Phone number can only contain numbers, spaces, hyphens, +, and parentheses');
        return;
    }

    // Validate national ID (exactly 16 digits, numbers only)
    if (nationalId && !Validators.isValidNationalId(nationalId)) {
        alert('National ID must be exactly 16 digits (numbers only)');
        return;
    }

    // Validate date of birth
    if (dateOfBirth && !Validators.isValidDOB(dateOfBirth)) {
        alert('Date of birth must be in the past and user must be at least 13 years old');
        return;
    }

    // Validate membership end date (for customers)
    if (membershipEndDate && !Validators.isFutureOrToday(membershipEndDate)) {
        alert('Membership end date must be today or a future date');
        return;
    }

    // Password required for new users only
    if (!userId && !password) {
        alert('Password is required for new users');
        return;
    }

    if (password && password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
    }
    
    // Build user data object
    const userData = {
        firstName,
        lastName,
        email,
        phone: phone || null,
        address: address || null,
        dateOfBirth: dateOfBirth || null
    };
    
    // Only include password if provided
    if (password) {
        userData.password = password;
    }
    
    // Admin-specific fields
    if (userType === 'admin') {
        userData.role = document.getElementById('userRole')?.value || 'Admin';
        userData.nationalId = nationalId || null;
        
        // Use stored adminType for existing users, or determine from role for new users
        if (adminType) {
            userData.adminType = adminType;
        } else if (userToEdit && userToEdit.adminType) {
            userData.adminType = userToEdit.adminType;
        } else {
            // New admin - determine type from role
            userData.adminType = userData.role === 'Super Admin' ? 'super' : 'regular';
        }
    }
    
    // Customer-specific fields
    if (userType === 'customer') {
        if (membershipEndDate) {
            userData.membershipEndDate = membershipEndDate;
        }
    }
    
    try {
        let response;
        const endpoint = userType === 'customer' ? '/api/members' : '/api/admins';

        // Check if role changed for existing admin
        const newRole = document.getElementById('userRole')?.value;
        const originalRole = userToEdit?.role || (userToEdit?.adminType === 'super' ? 'Super Admin' : 'Admin');
        const roleChanged = userType === 'admin' && userId && newRole && originalRole !== newRole;

        if (userId) {
            // Update existing user
            response = await fetch(`http://localhost:3000${endpoint}/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(userData)
            });
        } else {
            // Create new user
            response = await fetch(`http://localhost:3000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(userData)
            });
        }

        const data = await response.json();

        if (data.success) {
            // If role changed, call the role change endpoint
            if (roleChanged) {
                console.log('Role changed detected, calling role change endpoint:', {
                    userId,
                    currentRole: originalRole,
                    newRole: newRole,
                    adminType: userData.adminType
                });
                
                const roleChangeResponse = await fetch(`http://localhost:3000/api/admins/${userId}/role`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        currentRole: originalRole,
                        newRole: newRole,
                        adminType: userData.adminType
                    })
                });

                const roleChangeData = await roleChangeResponse.json();

                if (!roleChangeData.success) {
                    alert(roleChangeData.message || 'Failed to change role');
                    return; // Don't reload if role change failed
                } else {
                    console.log('Role changed successfully:', roleChangeData);
                    // Update the new ID if role change returned one
                    if (roleChangeData.data && roleChangeData.data.newId) {
                        console.log('New admin ID after role change:', roleChangeData.data.newId);
                    }
                }
            }

            if (userType === 'customer') {
                await loadCustomers();
                renderCustomersTable();
            } else {
                await loadAdmins();
                renderAdminsTable();
            }
            closeUserModal();
            console.log(userId ? 'User updated' : 'User created', data);
        } else {
            alert(data.message || 'Failed to save user');
        }
    } catch (error) {
        console.error('Error saving user:', error);
        alert('Error saving user. Please try again.');
    }
}

/**
 * Open delete user modal
 */
function openDeleteUserModal(userId, type, adminType = 'regular') {
    console.log('openDeleteUserModal called:', { userId, type, adminType });

    const userData = type === 'customer'
        ? customersData.find(u => u.id === userId)
        : adminsData.find(u => u.id === userId);

    console.log('Found userData:', userData);

    if (!userData) {
        console.error('User not found in data array');
        return;
    }

    userToDelete = { ...userData, adminType };
    bookToDelete = null;
    deleteItemType = type;

    console.log('Set userToDelete:', userToDelete, 'deleteItemType:', deleteItemType);
    
    const deleteMessage = document.getElementById('deleteMessage');
    if (deleteMessage) {
        deleteMessage.textContent = `Are you sure you want to delete this ${type}?`;
    }
    
    const deleteItemName = document.getElementById('deleteItemName');
    if (deleteItemName) {
        deleteItemName.textContent = `${userData.name} (${userData.email})`;
    }
    
    showModal('deleteModal');
}

/**
 * Delete user from database
 */
async function deleteUser(userId, type) {
    try {
        if (!userId) {
            console.error('deleteUser: userId is missing');
            alert('Error: User ID is missing. Cannot delete.');
            return;
        }

        const adminType = userToDelete?.adminType || 'regular';
        const endpoint = type === 'customer'
            ? `/api/members/${userId}`
            : `/api/admins/${userId}?type=${adminType}`;

        console.log('deleteUser called:', { userId, type, endpoint, userToDelete });

        const response = await fetch(`http://localhost:3000${endpoint}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Delete response status:', response.status);

        // Check if response is ok before parsing JSON
        if (!response.ok) {
            let errorText;
            try {
                const errorData = await response.json();
                errorText = errorData.message || errorData.error || 'Unknown error';
            } catch (e) {
                errorText = await response.text();
            }
            console.error('Delete failed with status:', response.status, errorText);
            alert(`Failed to delete user: ${errorText}`);
            return;
        }

        const data = await response.json();
        console.log('Delete response data:', data);

        if (data.success) {
            if (type === 'customer') {
                // Reload customers from database
                await loadCustomers();
                // Update filtered data to match loaded data
                filteredCustomersData = [...customersData];
                // Render correct table based on page (admin vs superadmin)
                if (window.location.pathname.includes('superadmin')) {
                    renderCustomersTable();
                } else {
                    renderAdminCustomersTable();
                }
                console.log('Customer deleted successfully. Refreshed table.');
            } else {
                // Reload admins from database
                await loadAdmins();
                // Update filtered data to match loaded data
                filteredAdminsData = [...adminsData];
                renderAdminsTable();
                console.log('Admin deleted successfully. Refreshed table.');
            }
            // Show success message
            alert('User deleted successfully');
            console.log(`${type} deleted:`, userId);
        } else {
            alert(data.message || 'Failed to delete user');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user. Please try again.');
    }
}

function closeUserModal() {
    hideModal('userModal');
    const userForm = document.getElementById('userForm');
    if (userForm) userForm.reset();
    userToEdit = null;
}

// ========================================
// MODAL UTILITIES
// ========================================

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(date) {
    if (!date) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}

// ========================================
// PROFILE DROPDOWN & PAGE FUNCTIONS
// ========================================

// Toggle profile dropdown visibility
function toggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdownMenu');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('profileDropdownMenu');
    const profileBtn = e.target.closest('.profile-btn');

    if (dropdown && dropdown.classList.contains('show') && !profileBtn) {
        dropdown.classList.remove('show');
    }
});

// Initialize profile dropdown with user data
function initProfileDropdown() {
    const userType = sessionStorage.getItem('userType');
    const userName = sessionStorage.getItem('userName') || 'User';

    // Set user initials
    const initialsElement = document.getElementById('profileInitials');
    if (initialsElement) {
        const initials = userName.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
        initialsElement.textContent = initials || 'U';
    }

    // Set dropdown user name
    const dropdownNameElement = document.getElementById('dropdownUserName');
    if (dropdownNameElement) {
        dropdownNameElement.textContent = userName;
    }

    // Set dropdown user role
    const dropdownRoleElement = document.getElementById('dropdownUserRole');
    if (dropdownRoleElement) {
        let roleText = 'Member';
        if (userType === 'superadmin') roleText = 'Super Administrator';
        else if (userType === 'admin') roleText = 'Administrator';
        else if (userType === 'customer') roleText = 'Member';
        dropdownRoleElement.textContent = roleText;
    }
}

// Initialize profile page
async function initProfilePage() {
    const userType = sessionStorage.getItem('userType');
    const userId = sessionStorage.getItem('userId');

    if (!userType || !userId) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize dropdown
    initProfileDropdown();

    // Show/hide admin links based on user type
    const superAdminLink = document.getElementById('superAdminLink');
    const adminLink = document.getElementById('adminLink');

    // Super admins should only see Super Admin Dashboard link
    // Regular admins should only see Admin Dashboard link
    if (superAdminLink) {
        superAdminLink.style.display = userType === 'superadmin' ? 'block' : 'none';
    }
    if (adminLink) {
        // Only show admin link for regular admins, NOT for super admins
        adminLink.style.display = userType === 'admin' ? 'block' : 'none';
    }

    // Show/hide sections based on user type
    const nationalIdGroup = document.getElementById('nationalIdGroup');
    const memberInfoSection = document.getElementById('memberInfoSection');

    if (nationalIdGroup) {
        nationalIdGroup.style.display = (userType === 'admin' || userType === 'superadmin') ? 'block' : 'none';
    }
    if (memberInfoSection) {
        memberInfoSection.style.display = userType === 'customer' ? 'block' : 'none';
    }

    // Fetch profile data
    try {
        const response = await fetch('/api/profile', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        populateProfileForm(data);
    } catch (error) {
        console.error('Error fetching profile:', error);
        showToast('Failed to load profile data', 'error');
    }

    // Setup form handlers
    setupProfileFormHandlers();
}

// Populate profile form with data
function populateProfileForm(data) {
    const userType = sessionStorage.getItem('userType');

    // Header info
    const fullNameElement = document.getElementById('profileFullName');
    const largeInitialsElement = document.getElementById('profileLargeInitials');
    const roleBadgeElement = document.getElementById('profileRoleBadge');
    const emailDisplayElement = document.getElementById('profileEmailDisplay');

    const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'User';

    if (fullNameElement) fullNameElement.textContent = fullName;
    if (emailDisplayElement) emailDisplayElement.textContent = data.email || '';

    if (largeInitialsElement) {
        const initials = fullName.split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
        largeInitialsElement.textContent = initials || 'U';
    }

    if (roleBadgeElement) {
        let roleText = 'Member';
        if (userType === 'superadmin') roleText = 'Super Administrator';
        else if (userType === 'admin') roleText = 'Administrator';
        roleBadgeElement.textContent = roleText;
    }

    // Form fields
    document.getElementById('profileEmail').value = data.email || '';
    document.getElementById('profileFirstName').value = data.first_name || '';
    document.getElementById('profileLastName').value = data.last_name || '';
    document.getElementById('profilePhone').value = data.phone || '';
    document.getElementById('profileAddress').value = data.address || '';

    if (data.date_of_birth) {
        const dob = new Date(data.date_of_birth);
        document.getElementById('profileDOB').value = dob.toISOString().split('T')[0];
    }

    // Admin specific fields
    if (userType === 'admin' || userType === 'superadmin') {
        const nationalIdInput = document.getElementById('profileNationalId');
        if (nationalIdInput) {
            nationalIdInput.value = data.national_id || '';
        }
    }

    // Customer specific info
    if (userType === 'customer') {
        const memberSinceElement = document.getElementById('memberSince');
        const memberStatusElement = document.getElementById('memberStatus');

        if (memberSinceElement && data.membership_start_date) {
            const startDate = new Date(data.membership_start_date);
            memberSinceElement.textContent = startDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        if (memberStatusElement) {
            const isActive = data.is_active !== false && data.is_active !== 0;
            memberStatusElement.textContent = isActive ? 'Active' : 'Inactive';
            memberStatusElement.className = `profile-info-value ${isActive ? 'status-active' : 'status-inactive'}`;
        }
    }

    // Store original data for reset
    window.originalProfileData = { ...data };
}

// Setup profile form handlers
function setupProfileFormHandlers() {
    const profileForm = document.getElementById('profileForm');
    const passwordForm = document.getElementById('passwordForm');

    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }

    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
    }
}

// Handle profile update
async function handleProfileUpdate(e) {
    e.preventDefault();

    const userType = sessionStorage.getItem('userType');

    const formData = {
        first_name: document.getElementById('profileFirstName').value.trim(),
        last_name: document.getElementById('profileLastName').value.trim(),
        phone: document.getElementById('profilePhone').value.trim(),
        address: document.getElementById('profileAddress').value.trim(),
        date_of_birth: document.getElementById('profileDOB').value || null
    };

    // Add national ID for admins
    if (userType === 'admin' || userType === 'superadmin') {
        const nationalIdInput = document.getElementById('profileNationalId');
        if (nationalIdInput) {
            formData.national_id = nationalIdInput.value.trim();
        }
    }

    try {
        const response = await fetch('/api/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update profile');
        }

        const result = await response.json();

        // Update session storage with new name
        const newName = `${formData.first_name} ${formData.last_name}`.trim();
        sessionStorage.setItem('userName', newName);

        // Update dropdown
        initProfileDropdown();

        // Update header
        const fullNameElement = document.getElementById('profileFullName');
        if (fullNameElement) fullNameElement.textContent = newName;

        const largeInitialsElement = document.getElementById('profileLargeInitials');
        if (largeInitialsElement) {
            const initials = newName.split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .substring(0, 2);
            largeInitialsElement.textContent = initials || 'U';
        }

        showToast('Profile updated successfully', 'success');
    } catch (error) {
        console.error('Error updating profile:', error);
        showToast(error.message || 'Failed to update profile', 'error');
    }
}

// Handle password change
async function handlePasswordChange(e) {
    e.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate passwords match
    if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
    }

    // Validate password length
    if (newPassword.length < 6) {
        showToast('New password must be at least 6 characters', 'error');
        return;
    }

    try {
        const response = await fetch('/api/profile/password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to change password');
        }

        // Clear form
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';

        showToast('Password changed successfully', 'success');
    } catch (error) {
        console.error('Error changing password:', error);
        showToast(error.message || 'Failed to change password', 'error');
    }
}

// Reset profile form to original values
function resetProfileForm() {
    if (window.originalProfileData) {
        populateProfileForm(window.originalProfileData);
        showToast('Form reset to original values', 'info');
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        const modal = e.target.closest('.modal');
        if (modal) {
            hideModal(modal.id);
        }
    }
});

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

console.log('SAIB Library System - Database-driven Frontend Initialized');
