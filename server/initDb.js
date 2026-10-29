// Створення таблиць і початкових даних у порожній базі (потрібно на хостингу,
// де немає Docker, який сам виконує файли з папки db)
import fs from 'node:fs';
import { pool } from './db.js';

const DB_DIR = new URL('../db/', import.meta.url);

export async function initDb() {
  const { rows } = await pool.query("SELECT to_regclass('public.recipes') AS t");
  if (rows[0].t) return; // таблиці вже є

  for (const file of fs.readdirSync(DB_DIR).filter((f) => f.endsWith('.sql')).sort()) {
    await pool.query(fs.readFileSync(new URL(file, DB_DIR), 'utf8'));
    console.log('Виконано', file);
  }
}
