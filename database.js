const pg = require('pg');
const Pool = pg.Pool;

const pool = new Pool({
    user: "postgres",
    password: process.env.DBPASS,
    host: process.env.DBURL,
    port: 5432,
    database: "postgres",
});

module.exports = pool;