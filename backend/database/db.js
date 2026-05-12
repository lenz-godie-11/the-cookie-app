
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        count INTEGER DEFAULT 0,
        image_url TEXT
      );
    `);

    const items = ['cookies', 'teabags', 'coffee', 'mint ratomilk', 'salt'];
    for (const item of items) {
      await pool.query(`
        INSERT INTO products (name, count) 
        VALUES ($1, 10) 
        ON CONFLICT (name) DO NOTHING;
      `, [item]);
    }
    console.log("PostgreSQL Tables initialized.");
  } catch (err) {
    console.error("Database initialization failed:", err);
  }
};

initializeDatabase();

module.exports = pool;