// Мінімальний сервер на вбудованому модулі http: віддає рецепти з PostgreSQL клієнту React
import http from 'node:http';
import { pool } from './db.js';

const PORT = 4000;

const server = http.createServer(async (req, res) => {
  console.log(req.method, req.url);

  if (req.method === 'GET' && req.url === '/api/recipes') {
    try {
      const { rows } = await pool.query('SELECT * FROM recipes ORDER BY id');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(rows));
    } catch (err) {
      console.error(err.message);
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Помилка бази даних' }));
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({ error: 'Не знайдено' }));
});

server.listen(PORT, () => {
  console.log(`Сервер даних запущено: http://localhost:${PORT}/api/recipes`);
});
