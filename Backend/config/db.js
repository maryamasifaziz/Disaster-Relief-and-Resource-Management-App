// const mysql = require('mysql2/promise');
// require('dotenv').config();

// const pool = mysql.createPool({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || '',
//   database: process.env.DB_NAME || 'DisasterReliefDB',
//   port: process.env.DB_PORT || 3306,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// // Test database connection
// pool.getConnection()
//   .then(connection => {
//     console.log('✅ Database connected successfully');
//     connection.release();
//   })
//   .catch(err => {
//     console.error('❌ Database connection failed:', err.message);
//   });

// module.exports = pool;

// Backend/config/db.js
// PATTERN: Singleton - ensures only one database pool instance exists

const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance; // Return existing instance
    }

    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'DisasterReliefDB',
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Test connection
    this.pool.getConnection()
      .then(connection => {
        console.log('✅ Database connected successfully');
        connection.release();
      })
      .catch(err => {
        console.error('❌ Database connection failed:', err.message);
      });

    Database.instance = this; // Save the single instance
  }

  getPool() {
    return this.pool;
  }
}

// Export the single pool instance
const db = new Database();
module.exports = db.getPool();
