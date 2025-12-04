# 📚 SAIB Library System

A comprehensive library management system with role-based access control built with Node.js, Express, MySQL, and vanilla JavaScript.

## ✨ Features

- **Role-Based Authentication**: Super Admin, Admin, and Customer roles
- **Books Management**: Add, edit, delete, and track books
- **User Management**: Manage customers and administrators (Super Admin only)
- **Borrowing System**: Track book borrowing and returns
- **Secure Authentication**: Bcrypt password hashing and session management
- **Responsive Design**: Modern, user-friendly interface

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
# Make sure MySQL is running on port 3307
mysql -u root -p -P 3307 < Database/library_schema1.sql
```

### 3. Generate Password Hashes
```bash
node Backend/hashPassword.js "SuperAdmin@123"
node Backend/hashPassword.js "Admin@123"
node Backend/hashPassword.js "Customer@123"
```

### 4. Add User Accounts
Update the hashes in `Database/add_super_admin.sql` and run:
```bash
mysql -u root -p -P 3307 < Database/add_super_admin.sql
```

### 5. Start the Server
```bash
npm start
```

### 6. Open Browser
Navigate to: `http://localhost:3000`

## 🔐 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@saib.com | SuperAdmin@123 |
| Admin | admin@saib.com | Admin@123 |
| Customer | customer@test.com | Customer@123 |

## 📖 Full Documentation

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup instructions and troubleshooting.

## 🏗️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: bcryptjs, express-session
- **Frontend**: HTML, CSS, Vanilla JavaScript

## 📂 Project Structure

```
SAIB-Library-System/
├── Backend/           # API routes and middleware
├── Database/          # SQL schemas and scripts
├── frontend/          # HTML, CSS, JS files
├── db.js             # Database connection
├── index.js          # Main server file
└── package.json      # Dependencies
```

## 🛡️ Security Features

- Bcrypt password hashing
- Session-based authentication
- SQL injection protection with prepared statements
- Role-based access control
- XSS protection with HTML escaping

## 📝 License

This project is part of the SAIB Library System.