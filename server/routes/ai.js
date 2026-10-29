// Інтелектуальні функції: чат-помічник і аналіз рецепта через мовну модель (Groq API)
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { body, param } from 'express-validator';
import { pool } from '../db.js';
import { validate } from '../middleware/validate.js';
import { generate, AiError } from '../ai/llm.js';

const router = Router();

// Запити до AI витрачають квоту, тому не більше 10 на хвилину з однієї адреси
router.use(rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  message: { error: 'Забагато запитів до помічника, зачекайте хвилину' },
}));

const chatRules = [
  body('message').isString().trim().isLength({ min: 1, max: 500 })
    .withMessage('Повідомлення – від 1 до 500 символів'),
  body('history').optional().isArray({ max: 10 }).withMessage('Історія – не більше 10 повідомлень'),
  body('history.*.role').isIn(['user', 'model']).withMessage('Невідома роль у історії'),
  body('history.*.text').isString().isLength({ max: 1000 }).withMessage('Задовге повідомлення в історії'),
];

const chatSchema = {
  type: 'object',
  properties: {
    reply: { type: 'string', description: 'Відповідь користувачу українською' },
    recipeIds: { type: 'array', items: { type: 'integer' }, description: 'id рекомендованих рецептів зі списку' },
  },
  required: ['reply', 'recipeIds'],
  additionalProperties: false,
};

// Чат: модель отримує список рецептів з бази і радить насамперед їх
router.post('/chat', chatRules, validate, async (req, res) => {
  const { rows } = await pool.query('SELECT id, title, category, cook_time, ingredients FROM recipes ORDER BY id');
  const list = rows.map((r) => `id=${r.id}; ${r.title}; ${r.category}; ${r.cook_time} хв; ${r.ingredients.join(', ')}`);

  const system = [
    'Ти – кулінарний помічник у веб-застосунку «Записник рецептів».',
    'Відповідай українською, дружньо і коротко (до 80 слів).',
    'Якщо питають, що приготувати, спершу пропонуй рецепти з цього списку і вкажи їхні id у recipeIds',
    '(у тексті відповіді id не згадуй):',
    ...list,
    'Якщо в списку немає нічого схожого, порадь страву своїми словами, а recipeIds залиш порожнім.',
    'На питання не про їжу та кулінарію ввічливо відмов.',
    'Відповідь – лише JSON вигляду {"reply": "...", "recipeIds": [...]}.',
  ].join('\n');

  // у клієнті відповіді моделі мають роль 'model', в API – 'assistant'
  const messages = [
    ...(req.body.history ?? []).map((m) => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.text })),
    { role: 'user', content: req.body.message },
  ];

  const answer = await generate({ system, messages, schema: chatSchema });
  // лишаємо тільки id, які справді є в базі
  const ids = new Set(rows.map((r) => r.id));
  const recipeIds = [...new Set(answer.recipeIds ?? [])].map(Number).filter((id) => ids.has(id)).slice(0, 3);
  res.json({ reply: String(answer.reply ?? ''), recipeIds });
});

const analyzeSchema = {
  type: 'object',
  properties: {
    difficulty: { type: 'string', enum: ['легка', 'середня', 'складна'] },
    calories: { type: 'integer', description: 'Приблизна калорійність однієї порції, ккал' },
    tags: { type: 'array', items: { type: 'string' }, description: '2–4 короткі теги українською' },
    tip: { type: 'string', description: 'Одна практична порада до рецепта, до 25 слів' },
  },
  required: ['difficulty', 'calories', 'tags', 'tip'],
  additionalProperties: false,
};

// Результати аналізу зберігаються в пам'яті, щоб не питати AI про той самий рецепт двічі
const cache = new Map();

router.post('/analyze/:id', param('id').isInt({ min: 1 }).withMessage('id має бути додатним цілим числом'),
  validate, async (req, res) => {
    const id = Number(req.params.id);
    if (cache.has(id)) return res.json(cache.get(id));

    const { rows } = await pool.query('SELECT * FROM recipes WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Рецепт не знайдено' });
    const r = rows[0];

    const text = `Назва: ${r.title}\nКатегорія: ${r.category}\nЧас: ${r.cook_time} хв\n` +
      `Порцій: ${r.servings}\nІнгредієнти: ${r.ingredients.join(', ')}\nПриготування: ${r.steps}`;
    const answer = await generate({
      system: 'Ти – дієтолог і кухар. Проаналізуй рецепт і дай оцінку українською лише у форматі JSON ' +
        'з полями difficulty (легка, середня або складна), calories (ккал на одну порцію), ' +
        'tags (2–4 короткі теги) і tip (одна порада до 25 слів).',
      messages: [{ role: 'user', content: text }],
      schema: analyzeSchema,
    });

    // перевірка і нормалізація відповіді моделі перед відправкою клієнту
    const result = {
      difficulty: ['легка', 'середня', 'складна'].includes(answer.difficulty) ? answer.difficulty : 'середня',
      calories: Math.min(Math.max(Math.round(Number(answer.calories) || 0), 0), 3000),
      tags: (answer.tags ?? []).map(String).slice(0, 4),
      tip: String(answer.tip ?? ''),
    };
    cache.set(id, result);
    res.json(result);
  });

// Помилки AI-сервісу – зрозуміле повідомлення клієнту
router.use((err, req, res, next) => {
  if (err instanceof AiError) return res.status(err.status).json({ error: err.message });
  if (err.name === 'TimeoutError') return res.status(504).json({ error: 'AI не відповів вчасно' });
  next(err);
});

export default router;
