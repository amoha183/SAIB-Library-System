# 🚀 SAIB Library System - Setup Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Database Setup](#database-setup)
4. [Running the Application](#running-the-application)
5. [Login Credentials](#login-credentials)
6. [Testing the System](#testing-the-system)
7. [Project Structure](#project-structure)

---

## 1️⃣ Prerequisites

Make sure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v5.7 or higher) - Running on port **3307**
- **Git** (optional)

---

## 2️⃣ Installation

### Step 1: Navigate to Project Directory
```bash
cd A:\download\SAIB-Library-System
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install:
- `express` - Web framework
- `mysql2` - Database driver
- `cors` - Cross-origin resource sharing
- `bcryptjs` - Password hashing
- `express-session` - Session management

---

## 3️⃣ Database Setup

### Step 1: Start MySQL Server
Make sure your MySQL server is running on **port 3307**

### Step 2: Create Database and Tables
Open MySQL CLI or MySQL Workbench and run:
```bash
mysql -u root -p -P 3307 < Database/library_schema1.sql
```

Or manually:
1. Open `Database/library_schema1.sql`
2. Execute all SQL commands in your MySQL client

### Step 3: Add User Accounts

#### Option A: Generate Password Hashes First (Recommended)
```bash
# Generate hash for SuperAdmin password
node Backend/hashPassword.js "SuperAdmin@123"

# Generate hash for Admin password
node Backend/hashPassword.js "Admin@123"

# Generate hash for Customer password
node Backend/hashPassword.js "Customer@123"
```

Then manually update the `Database/add_super_admin.sql` file with generated hashes.

#### Option B: Use the Quick Setup Script
Update the hashes in `Database/add_super_admin.sql` and run:
```bash
mysql -u root -p -P 3307 < Database/add_super_admin.sql
```

---

## 4️⃣ Running the Application

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

You should see:
```
🚀 Starting SAIB Library System...

✅ Database connected successfully!
   Host: localhost
   Database: library_db_1
   Port: 3307

📚 SAIB Library System is running!
   Server: http://localhost:3000
   Health Check: http://localhost:3000/api/health
```

---

## 5️⃣ Login Credentials

### 🔐 Default Test Accounts

After running the `add_super_admin.sql` script:

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | superadmin@saib.com | SuperAdmin@123 |
| **Admin** | admin@saib.com | Admin@123 |
| **Customer** | customer@test.com | Customer@123 |

⚠️ **Important:** Change these passwords in production!

---

## 6️⃣ Testing the System

### Test 1: Health Check
Open browser: `http://localhost:3000/api/health`

Expected response:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### Test 2: Login Flow

1. **Open Application**
   - Navigate to: `http://localhost:3000`

2. **Login as Super Admin**
   - Email: `superadmin@saib.com`
   - Password: `SuperAdmin@123`
   - Should redirect to: `/superadmin.html`
   - Access: Books, Customers, Administrators management

3. **Login as Admin**
   - Email: `admin@saib.com`
   - Password: `Admin@123`
   - Should redirect to: `/admin.html`
   - Access: Books management only

4. **Login as Customer**
   - Email: `customer@test.com`
   - Password: `Customer@123`
   - Should redirect to: `/customer.html`
   - Access: Browse books (read-only)

### Test 3: Role-Based Access

**Super Admin Can:**
- ✅ Manage all books
- ✅ Manage customers
- ✅ Manage administrators
- ✅ View all tabs

**Admin Can:**
- ✅ Manage books
- ❌ Cannot manage customers
- ❌ Cannot manage administrators

**Customer Can:**
- ✅ Browse and search books
- ✅ View book details
- ❌ Cannot edit anything

---

## 7️⃣ Project Structure

```
SAIB-Library-System/
├── Backend/
│   ├── authRoutes.js          # Authentication API routes
│   ├── authMiddleware.js      # Auth & authorization middleware
│   └── hashPassword.js        # Password hash generator utility
├── Database/
│   ├── library_schema1.sql    # Main database schema
│   └── add_super_admin.sql    # Add default user accounts
├── frontend/
│   ├── index.html             # Login page
│   ├── superadmin.html        # Super admin dashboard
│   ├── admin.html             # Admin dashboard
│   ├── customer.html          # Customer view
│   └── assets/
│       ├── css/
│       │   └── style.css      # All styles
│       └── js/
│           └── app.js         # Frontend logic with API calls
├── db.js                       # Database connection pool
├── index.js                    # Main server file
├── package.json               # Dependencies
└── SETUP_GUIDE.md             # This file
```

---

## 🔧 Troubleshooting

### Issue: Cannot connect to database
**Solution:**
- Check if MySQL is running on port 3307
- Verify credentials in `db.js`
- Test connection: `mysql -u root -p -P 3307`

### Issue: Module not found
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Login not working
**Solution:**
- Check browser console for errors
- Verify backend is running
- Check if password hashes are properly set in database:
  ```sql
  SELECT email, password FROM super_admins;
  ```
- Regenerate password hashes if needed

### Issue: CORS errors
**Solution:**
- Ensure both frontend and backend use `http://localhost:3000`
- Check CORS configuration in `index.js`

---

## 📝 Notes

1. **Security**: In production:
   - Change default passwords
   - Use environment variables for secrets
   - Enable HTTPS
   - Set `cookie.secure = true` in session config

2. **Database**: Password column in all user tables stores bcrypt hashes

3. **Sessions**: Expire after 24 hours of inactivity

4. **API Endpoints**:
   - `POST /api/auth/login` - Login
   - `POST /api/auth/logout` - Logout
   - `GET /api/auth/verify` - Check authentication
   - `POST /api/auth/register` - Register new customer

---

## 🎉 You're All Set!

The SAIB Library System is now configured and ready to use. Login with the super admin account to get started!

For questions or issues, check the console logs or contact the development team.





