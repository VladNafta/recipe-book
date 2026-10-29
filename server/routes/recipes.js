// REST API ресурсу «рецепти»: отримання, створення, зміна, видалення
import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// GET /api/recipes?category=Салати — список (з фільтром за категорією)
router.get('/', async (req, res) => {
  const { category } = req.query;
  const { rows } = category
    ? await pool.query('SELECT * FROM recipes WHERE category = $1 ORDER BY id', [category])
    : await pool.query('SELECT * FROM recipes ORDER BY id');
  res.json(rows);
});

// GET /api/recipes/:id — один рецепт
router.get('/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM recipes WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Рецепт не знайдено' });
  res.json(rows[0]);
});

// POST /api/recipes — створити рецепт
router.post('/', async (req, res) => {
  const { title, category, cook_time, servings, ingredients, steps } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO recipes (title, category, cook_time, servings, ingredients, steps)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [title, category, cook_time, servings, ingredients, steps]
  );
  res.status(201).json(rows[0]);
});

// PUT /api/recipes/:id — оновити рецепт повністю
router.put('/:id', async (req, res) => {
  const { title, category, cook_time, servings, ingredients, steps } = req.body;
  const { rows } = await pool.query(
    `UPDATE recipes SET title = $1, category = $2, cook_time = $3, servings = $4,
     ingredients = $5, steps = $6 WHERE id = $7 RETURNING *`,
    [title, category, cook_time, servings, ingredients, steps, req.params.id]
  );
  if (rows.length === 0) return res.status(404).json({ error: 'Рецепт не знайдено' });
  res.json(rows[0]);
});

// DELETE /api/recipes/:id — видалити рецепт
router.delete('/:id', async (req, res) => {
  const { rowCount } = await pool.query('DELETE FROM recipes WHERE id = $1', [req.params.id]);
  if (rowCount === 0) return res.status(404).json({ error: 'Рецепт не знайдено' });
  res.status(204).end();
});

export default router;
