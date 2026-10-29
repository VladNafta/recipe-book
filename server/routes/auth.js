// Реєстрація, вхід, вихід і поточний користувач
import { Router } from 'express';
import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';
import { body } from 'express-validator';
import { pool } from '../db.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Не більше 5 невдалих спроб входу за 15 хвилин з однієї адреси (захист від підбору пароля)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  message: { error: 'Забагато спроб входу, спробуйте пізніше' },
});

const registerRules = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage("Ім'я — від 2 до 50 символів"),
  body('email').trim().isEmail().withMessage('Некоректний email').normalizeEmail(),
  body('password')
    .isLength({ min: 8, max: 64 }).withMessage('Пароль — від 8 до 64 символів')
    .matches(/\d/).withMessage('Пароль має містити цифру')
    .matches(/[a-zа-яіїєґ]/i).withMessage('Пароль має містити літеру'),
];

// Нова сесія після входу (захист від фіксації сесії)
function startSession(req, user) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err);
      req.session.userId = user.id;
      req.session.name = user.name;
      resolve();
    });
  });
}

router.post('/register', registerRules, validate, async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await pool.query('SELECT 1 FROM users WHERE email = $1', [email]);
  if (exists.rowCount) return res.status(409).json({ error: 'Користувач з таким email вже існує' });

  const hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
    [name, email, hash]
  );
  await startSession(req, rows[0]);
  res.status(201).json(rows[0]);
});

router.post('/login', loginLimiter, body('email').trim().normalizeEmail(), async (req, res) => {
  const { email, password } = req.body;
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [String(email ?? '')]);
  const ok = rows.length > 0 && await bcrypt.compare(String(password ?? ''), rows[0].password_hash);
  // однакова відповідь для неіснуючого email і неправильного пароля
  if (!ok) return res.status(401).json({ error: 'Невірний email або пароль' });

  await startSession(req, rows[0]);
  res.json({ id: rows[0].id, name: rows[0].name, email: rows[0].email });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.status(204).end();
  });
});

router.get('/me', (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'Не авторизовано' });
  res.json({ id: req.session.userId, name: req.session.name });
});

export default router;
