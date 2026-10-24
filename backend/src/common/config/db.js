import mysql from "mysql2/promise";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const caPath = path.resolve(__dirname, "../../../ca.pem");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    ca: fs.readFileSync(caPath),
    rejectUnauthorized: true,
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function connectDB() {
  try {
    const connection = await pool.getConnection();

    await connection.ping();

    connection.release();

    console.log("Connected to Aiven MySQL successfully!");
  } catch (error) {
    console.error("MySQL connection failed:", error.message);
    throw error;
  }
}

// Export the pool for queries in services
export default pool;

