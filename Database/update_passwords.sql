-- Update User Passwords with Proper Bcrypt Hashes
-- Run this script AFTER generating hashes using: node Backend/hashPassword.js "password"

USE library_db_1;

-- INSTRUCTIONS:
-- 1. Run: node Backend/hashPassword.js "SuperAdmin@123"
-- 2. Copy the hash and replace the value below
-- 3. Repeat for other passwords
-- 4. Execute this SQL script

-- Update Super Admin Password
-- Hash for: SuperAdmin@123
UPDATE super_admins 
SET password = '$2a$10$rZQ5XQKq8K8V3Y9P5h3J3.uX8V3Y9P5h3J3K8V3uX8V3Y9P5h3J3K8'
WHERE email = 'superadmin@saib.com';

-- Update Admin Password  
-- Hash for: Admin@123
UPDATE admins 
SET password = '$2a$10$rZQ5XQKq8K8V3Y9P5h3J3.uX8V3Y9P5h3J3K8V3uX8V3Y9P5h3J3K8'
WHERE email = 'admin@saib.com';

-- Update Customer Password
-- Hash for: Customer@123
UPDATE members 
SET password = '$2a$10$rZQ5XQKq8K8V3Y9P5h3J3.uX8V3Y9P5h3J3K8V3uX8V3Y9P5h3J3K8'
WHERE email = 'customer@test.com';

-- Verify updates
SELECT 'Super Admins:' as Type;
SELECT super_admin_id, first_name, last_name, email, LEFT(password, 20) as 'Password (truncated)' FROM super_admins;

SELECT 'Admins:' as Type;
SELECT admin_id, first_name, last_name, email, LEFT(password, 20) as 'Password (truncated)' FROM admins;

SELECT 'Members:' as Type;
SELECT member_id, first_name, last_name, email, LEFT(password, 20) as 'Password (truncated)' FROM members;

-- Note: Passwords are bcrypt hashed. You need to generate the hash first before updating.
-- Use: node Backend/hashPassword.js "YourPasswordHere"





