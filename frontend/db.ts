const { Pool } = require('pg');
// require ('dotenv').config();


const ConnectionPool = new Pool({
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    database: process.env.PG_NAME,
    max: 30,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
    ssl: {
        rejectUnauthorized: false
    }
})

export default ConnectionPool;