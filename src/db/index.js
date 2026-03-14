//this import is used to connect to our PostgreSQL database
import { drizzle } from "drizzle-orm/node-postgres";
//this import is used to interact with our PostgreSQL database
import pkg from "pg";
//this import is used to load environment variables from a .env file
import "dotenv/config";

//Pool is used to manage a pool of database connections
// meaning it creates and manages a set of connections to the database
// through which queries can be executed efficiently
// as each connection is reused rather than creating a new one for each query
const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);
