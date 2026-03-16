import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure .env is resolved from the project root, regardless of CWD
dotenv.config({ path: resolve(__dirname, "..", "..", ".env") });
