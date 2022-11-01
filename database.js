const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: process.env.DBURL,
  database: 'postgres',
  password: process.env.DBPASS,
  port: 5432,
})

module.exports = pool;