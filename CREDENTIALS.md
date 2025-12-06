# 🔐 Login Credentials for SAIB Library System

## Test Accounts

After setting up the database with the provided SQL scripts, use these credentials to login:

---

### 🔴 Super Admin Account
- **Email**: `superadmin@saib.com`
- **Password**: `SuperAdmin@123`
- **Access Level**: Full system access
- **Permissions**:
  - ✅ Manage all books (Add, Edit, Delete)
  - ✅ Manage all customers (Add, Edit, Delete)
  - ✅ Manage all administrators (Add, Edit, Delete)
  - ✅ View all system data
  - ✅ Borrow/Return books

**Dashboard**: After login, you'll be redirected to `/superadmin.html`

---

### 🟡 Regular Admin Account
- **Email**: `admin@saib.com`
- **Password**: `Admin@123`
- **Access Level**: Admin access
- **Permissions**:
  - ✅ Manage books (Add, Edit, Delete)
  - ✅ Borrow/Return books
  - ❌ Cannot manage customers
  - ❌ Cannot manage administrators

**Dashboard**: After login, you'll be redirected to `/admin.html`

---

### 🟢 Customer/Member Account
- **Email**: `customer@test.com`
- **Password**: `Customer@123`
- **Access Level**: Read-only access
- **Permissions**:
  - ✅ Browse and search books
  - ✅ View book details
  - ✅ See book availability
  - ❌ Cannot edit anything

**Dashboard**: After login, you'll be redirected to `/customer.html`

---

## 🔧 How to Setup

### Step 1: Generate Password Hashes
Before inserting users into the database, generate proper bcrypt hashes:

```bash
# Generate hash for Super Admin password
node Backend/hashPassword.js "SuperAdmin@123"

# Generate hash for Admin password  
node Backend/hashPassword.js "Admin@123"

# Generate hash for Customer password
node Backend/hashPassword.js "Customer@123"
```

### Step 2: Update SQL Script
Copy the generated hashes and update them in:
- `Database/add_super_admin.sql` OR
- `Database/update_passwords.sql`

### Step 3: Run SQL Script
```bash
mysql -u root -p -P 3307 < Database/add_super_admin.sql
```

---

## 🚨 Security Warning

⚠️ **IMPORTANT**: These are TEST credentials only!

**Before deploying to production:**
1. ✅ Change all default passwords
2. ✅ Use strong passwords (12+ characters, mixed case, numbers, symbols)
3. ✅ Store credentials in environment variables
4. ✅ Enable HTTPS
5. ✅ Implement password reset functionality
6. ✅ Add rate limiting for login attempts
7. ✅ Enable 2FA for admin accounts

---

## 📊 Testing the Login Flow

### Test Case 1: Super Admin Login
1. Navigate to `http://localhost:3000`
2. Enter: `superadmin@saib.com` / `SuperAdmin@123`
3. Click Login
4. ✅ Should redirect to Super Admin Dashboard
5. ✅ Should see 3 tabs: Books, Customers, Administrators

### Test Case 2: Regular Admin Login
1. Logout (if logged in)
2. Enter: `admin@saib.com` / `Admin@123`
3. Click Login
4. ✅ Should redirect to Admin Dashboard
5. ✅ Should only see Books management

### Test Case 3: Customer Login
1. Logout (if logged in)
2. Enter: `customer@test.com` / `Customer@123`
3. Click Login
4. ✅ Should redirect to Customer View
5. ✅ Should see books in card layout (read-only)

### Test Case 4: Invalid Credentials
1. Try logging in with wrong password
2. ✅ Should show error message
3. ✅ Should NOT redirect

---

## 🔄 Resetting Passwords

If you need to reset a password in the database:

```sql
-- 1. Generate new hash
node Backend/hashPassword.js "NewPassword123"

-- 2. Update in database
UPDATE super_admins SET password = 'NEW_HASH_HERE' WHERE email = 'superadmin@saib.com';
-- OR
UPDATE admins SET password = 'NEW_HASH_HERE' WHERE email = 'admin@saib.com';
-- OR
UPDATE members SET password = 'NEW_HASH_HERE' WHERE email = 'customer@test.com';
```

---

## 📞 Support

If you encounter any issues with authentication:
1. Check browser console for errors (F12)
2. Verify backend is running on port 3000
3. Check database connection
4. Verify password hashes are correct
5. Review `SETUP_GUIDE.md` for detailed troubleshooting

---

**Last Updated**: December 2025






