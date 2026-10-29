// REST API ресурсу «рецепти» з валідацією і перевіркою прав
import { Router } from 'express';
import { body, param } from 'express-validator';
import { pool } from '../db.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const CATEGORIES = ['Перші страви', 'Другі страви', 'Салати', 'Десерти'];

const idRule = [param('id').isInt({ min: 1 }).withMessage('id має бути додатним цілим числом')];

const recipeRules = [
  body('title').trim().isLength({ min: 2, max: 100 }).withMessage('Назва — від 2 до 100 символів'),
  body('category').isIn(CATEGORIES).withMessage('Невідома категорія'),
  body('cook_time').isInt({ min: 1, max: 1440 }).withMessage('Час — ціле число від 1 до 1440 хв').toInt(),
  body('servings').isInt({ min: 1, max: 50 }).withMessage('Порцій — від 1 до 50').toInt(),
  body('ingredients').isArray({ min: 1, max: 30 }).withMessage('Потрібен хоча б один інгредієнт'),
  body('ingredients.*').isString().trim().isLength({ min: 1, max: 50 }).withMessage('Інгредієнт — до 50 символів'),
  body('steps').trim().isLength({ min: 10, max: 2000 }).withMessage('Опис — від 10 до 2000 символів'),
];

// Змінювати й видаляти рецепт може лише його автор
async function ownRecipe(req, res, next) {
  const { rows } = await pool.query('SELECT user_id FROM recipes WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Рецепт не знайдено' });
  if (rows[0].user_id !== req.session.userId) {
    return res.status(403).json({ error: 'Можна змінювати лише власні рецепти' });
  }
  next();
}

router.get('/', async (req, res) => {
  const { category } = req.query;
  const { rows } = category
    ? await pool.query('SELECT * FROM recipes WHERE category = $1 ORDER BY id', [category])
    : await pool.query('SELECT * FROM recipes ORDER BY id');
  res.json(rows);
});

router.get('/:id', idRule, validate, async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM recipes WHERE id = $1', [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: 'Рецепт не знайдено' });
  res.json(rows[0]);
});

router.post('/', requireAuth, recipeRules, validate, async (req, res) => {
  const { title, category, cook_time, servings, ingredients, steps } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO recipes (title, category, cook_time, servings, ingredients, steps, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [title, category, cook_time, servings, ingredients, steps, req.session.userId]
  );
  res.status(201).json(rows[0]);
});

router.put('/:id', requireAuth, idRule, recipeRules, validate, ownRecipe, async (req, res) => {
  const { title, category, cook_time, servings, ingredients, steps } = req.body;
  const { rows } = await pool.query(
    `UPDATE recipes SET title = $1, category = $2, cook_time = $3, servings = $4,
     ingredients = $5, steps = $6 WHERE id = $7 RETURNING *`,
    [title, category, cook_time, servings, ingredients, steps, req.params.id]
  );
  res.json(rows[0]);
});

router.delete('/:id', requireAuth, idRule, validate, ownRecipe, async (req, res) => {
  await pool.query('DELETE FROM recipes WHERE id = $1', [req.params.id]);
  res.status(204).end();
});

export default router;
