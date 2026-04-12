import pool from "./client";

const init = async () => {
  await pool.query("SELECT 1");
  console.log("DB ready");
  process.exit(0);
};

init();
