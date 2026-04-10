const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log("PostgreSQL conectado correctamente (Supabase)");
    client.release();
  } catch (error) {
    console.error("Error conectando a PostgreSQL:", error.message);
    process.exit(1);
  }
};

module.exports = { pool, connectDB };