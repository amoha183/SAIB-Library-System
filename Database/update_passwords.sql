-- Update Passwords for Test Accounts
-- Run this script to fix password hashes in existing database
--
-- Credentials after running:
--   Super Admin: superadmin@saib.com / SuperAdmin@123
--   Super Admin: superadmin2@saib.com / SuperAdmin@123
--   Admin: admin@saib.com / Admin@123
--   Customer: customer@test.com / Customer@123

USE library_db_1;

-- Update Super Admin password (SuperAdmin@123)
UPDATE super_admins
SET password = '$2a$10$saH1I63NWyvyPRyM3tlaV.7w2yzzg2c/RAUrAKQhVHN4p8.OdRjz2'
WHERE email = 'superadmin@saib.com';

-- Also update superadmin2 if it exists
UPDATE super_admins
SET password = '$2a$10$saH1I63NWyvyPRyM3tlaV.7w2yzzg2c/RAUrAKQhVHN4p8.OdRjz2'
WHERE email = 'superadmin2@saib.com';

-- Update Admin password (Admin@123)
UPDATE admins
SET password = '$2a$10$.oUmycrx/BQXiDjTodJ3YuWuNMNreVDCpqCO5hZmsPHtSg7r0Ywly'
WHERE email = 'admin@saib.com';

-- Update all other admins to use Admin@123 password for testing
UPDATE admins
SET password = '$2a$10$.oUmycrx/BQXiDjTodJ3YuWuNMNreVDCpqCO5hZmsPHtSg7r0Ywly';

-- Update Customer password (Customer@123)
UPDATE members
SET password = '$2a$10$ziQwjZN74PmDPULSHPGoIuPQz8SpGTlTBCveYGe2U9YktnGr8VlbW'
WHERE email = 'customer@test.com';

-- Show updated accounts
SELECT 'Updated Super Admins:' as 'Status';
SELECT super_admin_id as ID, email, SUBSTRING(password, 1, 20) as password_prefix FROM super_admins;

SELECT 'Updated Admins:' as 'Status';
SELECT admin_id as ID, email, SUBSTRING(password, 1, 20) as password_prefix FROM admins;

SELECT 'Updated Members (first 5):' as 'Status';
SELECT member_id as ID, email, SUBSTRING(password, 1, 20) as password_prefix FROM members;



