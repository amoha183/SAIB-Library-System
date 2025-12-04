-- Add Second Super Admin Account to the Database
-- Email: superadmin2@saib.com
-- Password: admin123 (normal/simple password)

USE library_db_1;

-- Insert Second Super Admin
INSERT INTO super_admins (first_name, last_name, email, national_id, password, phone, address, date_of_birth) 
VALUES (
    'Super',
    'Admin2',
    'superadmin2@saib.com',
    NULL,
    '$2a$10$ZZZGT2VKoBn/1q0.geGKhu8YITIyxqq3ieXGCFinwFezQU2m7GWKy', -- Hash for: admin123
    '+966-50-123-4568',
    'SAIB Library Headquarters, Riyadh',
    '1985-01-15'
);

-- Display all super admins
SELECT 'Super Admin Accounts:' as 'Account Type';
SELECT 
    super_admin_id as ID, 
    first_name, 
    last_name, 
    email, 
    phone,
    created_at
FROM super_admins
ORDER BY super_admin_id;

-- Verify the new account was added
SELECT 
    CONCAT(first_name, ' ', last_name) as 'Full Name',
    email,
    'admin123' as 'Password (plain text for reference)',
    'Super Admin' as 'Role'
FROM super_admins 
WHERE email = 'superadmin2@saib.com';


