// Простий сервер, який віддає рецепти з бази даних клієнту React
import express from 'express';
import { pool } from './db.js';

const app = express();
const PORT = 4000;

// Список усіх рецептів з таблиці recipes
app.get('/api/recipes', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM recipes ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Помилка бази даних' });
  }
});

app.listen(PORT, () => {
  console.log(`API запущено: http://localhost:${PORT}/api/recipes`);
});
