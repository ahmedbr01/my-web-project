const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ Connecté à MySQL - Base: ${process.env.DB_NAME}`);
    
    const [tables] = await connection.execute("SHOW TABLES");
    console.log(`📊 Tables: ${tables.map(t => Object.values(t)[0]).join(', ')}`);
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Erreur MySQL:', error.message);
    return false;
  }
}

module.exports = { pool, testConnection };