const { Pool } = require('pg');
// require ('dotenv').config();

// 1. Check if environment variables are loaded
console.log('--- DB Connection Debug ---');
console.log('PG_HOST:', process.env.PG_HOST);
console.log('PG_USER:', process.env.PG_USER);
console.log('PG_NAME:', process.env.PG_NAME);
console.log('PG_PORT:', process.env.PG_PORT);
console.log('---------------------------');

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