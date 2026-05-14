const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL?.trim();

const pool = new Pool({
  connectionString,
});

module.exports = { pool };
