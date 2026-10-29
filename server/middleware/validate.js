import { validationResult } from 'express-validator';

// Якщо правила валідації не пройдено — відповідь 400 зі списком помилок
export function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const errors = result.array().map((e) => ({ field: e.path, message: e.msg }));
  res.status(400).json({ errors });
}
