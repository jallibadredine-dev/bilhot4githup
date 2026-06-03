import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

function loadDotEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    const raw = fs.readFileSync(envPath, 'utf8');
    const lines = raw.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx < 0) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx+1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  } catch (err) {
    // ignore
  }
}

async function run() {
  loadDotEnv();
  const sqlPath = path.resolve(process.cwd(), 'scripts/sql/create_notifications_table.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('SQL file not found:', sqlPath);
    process.exit(1);
  }
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.DATABASEURL;
  if (!connectionString) {
    console.error('DATABASE_URL not set in environment or .env');
    process.exit(1);
  }

  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to DB, executing SQL...');
    await client.query(sql);
    console.log('Notifications table created or already exists.');
  } catch (err) {
    console.error('Error executing SQL:', err.message || err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
