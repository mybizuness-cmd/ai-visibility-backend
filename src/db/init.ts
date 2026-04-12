import pool from "./client";

const init = async () => {
  await pool.query("SELECT 1");
  console.log("DB ready");
  await pool.query(`
  CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    stripe_session_id TEXT UNIQUE NOT NULL,
    customer_email TEXT,
    amount_total INTEGER,
    currency TEXT,
    payment_status TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );
`);
  await pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
  );
`);
  process.exit(0);
};

init();
