const pg = require('pg');
const Pool = pg.Pool;

const pool = new Pool({
    user: "postgres",
    password: "",
    host: "iaeround.caobdpope0dw.eu-west-2.rds.amazonaws.com",
    port: 5432,
    database: "postgres",
});

module.exports = pool;