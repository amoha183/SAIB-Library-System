/**
 * Password Hash Generator
 * Run this script to generate bcrypt hashes for passwords
 * Usage: node Backend/hashPassword.js "your_password_here"
 */

import bcrypt from 'bcryptjs';

const password = process.argv[2] || 'SuperAdmin@123';

if (!process.argv[2]) {
  console.log('⚠️  No password provided, using default: SuperAdmin@123');
  console.log('Usage: node Backend/hashPassword.js "your_password_here"\n');
}

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    process.exit(1);
  }
  
  console.log('✅ Password Hash Generated:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Plain Password: ${password}`);
  console.log(`Hashed Password: ${hash}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('Copy the hashed password and use it in your SQL INSERT statements.\n');
  
  process.exit(0);
});





