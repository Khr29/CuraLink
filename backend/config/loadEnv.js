import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

// Single place that loads backend environment variables, with a fixed
// precedence (first value found wins, nothing is ever overwritten):
//
//   1. the real process environment (Render dashboard, shell, CI)
//   2. backend/.env.local — per-machine local overrides (gitignored)
//   3. backend/.env       — the shared/default values
//
// .env.local lets a developer point their machine at a local MongoDB (or
// other local services) without editing .env. Hosted environments never
// have a .env.local, so production behaviour is unchanged.
//
// Paths are resolved from this file rather than process.cwd(), so scripts
// run from another directory (e.g. `node backend/seed/seedDemoData.js`)
// load the same files as the server.
const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

dotenv.config({
  path: [path.join(backendRoot, ".env.local"), path.join(backendRoot, ".env")],
  quiet: true,
});
