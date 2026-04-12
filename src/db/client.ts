import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const testConnection = async () => {
  await pool.query("SELECT 1");
};

export default pool;
