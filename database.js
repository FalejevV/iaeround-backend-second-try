const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();


const pool = new Pool({
  user: 'postgres',
  host: process.env.DBURL,
  database: 'postgres',
  password: process.env.DBPASS,
  port: 5432,
  ssl: true
})

module.exports = pool;