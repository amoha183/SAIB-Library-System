import mysql from 'mysql2/promise';

// Create and export the database pool
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'l8O3.nZtr42!0q1/',
  database: 'library_db_1',
  port: 3307,
});

export default db;

