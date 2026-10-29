// Бекенд записника рецептів на Express
import express from 'express';
import fs from 'node:fs';
import YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';
import recipesRouter from './routes/recipes.js';

const app = express();
const PORT = 4000;

app.use(express.json()); // розбір JSON у тілі запиту

// Журнал запитів у консоль
app.use((req, res, next) => {
  console.log(req.method, req.originalUrl);
  next();
});

app.use('/api/recipes', recipesRouter);

// OpenAPI-специфікація і її інтерактивна документація
const spec = YAML.parse(fs.readFileSync('./openapi.yaml', 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));

// Невідомі адреси
app.use((req, res) => res.status(404).json({ error: 'Не знайдено' }));

// Помилки (зокрема помилки бази даних)
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: 'Помилка сервера' });
});

app.listen(PORT, () => {
  console.log(`API: http://localhost:${PORT}/api/recipes`);
  console.log(`Документація: http://localhost:${PORT}/api-docs`);
});
