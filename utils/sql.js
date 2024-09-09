const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

// MySQL 연결 설정
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: process.env.DB_PW,
  database: 'consulting_web',
});

module.exports = pool;
