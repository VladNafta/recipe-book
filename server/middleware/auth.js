// Доступ лише для користувача, який увійшов (є userId у сесії)
export function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Потрібно увійти в систему' });
  }
  next();
}
