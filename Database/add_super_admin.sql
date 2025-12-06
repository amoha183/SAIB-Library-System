-- Add Super Admin User to the Database
-- This script inserts default test accounts
--
-- Credentials:
--   Super Admin: superadmin@saib.com / SuperAdmin@123
--   Admin: admin@saib.com / Admin@123
--   Customer: customer@test.com / Customer@123

USE library_db_1;

-- Clear existing test users (optional - uncomment if needed)
-- DELETE FROM super_admins WHERE email = 'superadmin@saib.com';
-- DELETE FROM admins WHERE email = 'admin@saib.com';
-- DELETE FROM members WHERE email = 'customer@test.com';

-- Insert Super Admin
-- Password: SuperAdmin@123
INSERT INTO super_admins (first_name, last_name, email, national_id, password, phone, address, date_of_birth)
VALUES (
    'Super',
    'Admin',
    'superadmin@saib.com',
    NULL,
    '$2a$10$saH1I63NWyvyPRyM3tlaV.7w2yzzg2c/RAUrAKQhVHN4p8.OdRjz2',
    '+966-50-123-4567',
    'SAIB Library Headquarters, Riyadh',
    '1985-01-15'
) ON DUPLICATE KEY UPDATE
    password = '$2a$10$saH1I63NWyvyPRyM3tlaV.7w2yzzg2c/RAUrAKQhVHN4p8.OdRjz2';

-- Insert Regular Admin for testing
-- Password: Admin@123
INSERT INTO admins (first_name, last_name, email, national_id, password, phone, address, date_of_birth)
VALUES (
    'Regular',
    'Admin',
    'admin@saib.com',
    NULL,
    '$2a$10$.oUmycrx/BQXiDjTodJ3YuWuNMNreVDCpqCO5hZmsPHtSg7r0Ywly',
    '+966-50-123-4568',
    'SAIB Library Branch, Jeddah',
    '1990-05-20'
) ON DUPLICATE KEY UPDATE
    password = '$2a$10$.oUmycrx/BQXiDjTodJ3YuWuNMNreVDCpqCO5hZmsPHtSg7r0Ywly';

-- Insert a test member/customer
-- Password: Customer@123
INSERT INTO members (first_name, last_name, email, password, phone, address, date_of_birth, membership_start_date)
VALUES (
    'Test',
    'Customer',
    'customer@test.com',
    '$2a$10$ziQwjZN74PmDPULSHPGoIuPQz8SpGTlTBCveYGe2U9YktnGr8VlbW',
    '+966-50-123-4569',
    'Riyadh, Saudi Arabia',
    '1995-08-10',
    CURDATE()
) ON DUPLICATE KEY UPDATE
    password = '$2a$10$ziQwjZN74PmDPULSHPGoIuPQz8SpGTlTBCveYGe2U9YktnGr8VlbW';

-- Display the created accounts
SELECT 'Super Admins:' as 'Account Type';
SELECT super_admin_id as ID, first_name, last_name, email, phone FROM super_admins;

SELECT 'Admins:' as 'Account Type';
SELECT admin_id as ID, first_name, last_name, email, phone FROM admins;

SELECT 'Members:' as 'Account Type';
SELECT member_id as ID, first_name, last_name, email, phone FROM members;
