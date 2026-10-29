// Бекенд записника рецептів на Express
import express from 'express';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';
import helmet from 'helmet';
import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { pool } from './db.js';
import { initDb } from './initDb.js';
import recipesRouter from './routes/recipes.js';
import authRouter from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_DIR = fileURLToPath(new URL('../client/dist', import.meta.url));
const PgStore = pgSession(session);

// Документація OpenAPI (до helmet, бо Swagger UI потребує власних скриптів)
const spec = YAML.parse(fs.readFileSync('./openapi.yaml', 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec));

app.set('trust proxy', 1);                 // на хостингу запити приходять через проксі
app.use(helmet());                         // захисні HTTP-заголовки
app.use(express.json({ limit: '10kb' }));  // JSON у тілі запиту, не більше 10 КБ

// Сесії: у браузері лише id сесії в cookie, самі дані — у таблиці session
app.use(session({
  store: new PgStore({ pool, createTableIfMissing: true }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: 'auto', maxAge: 24 * 60 * 60 * 1000 },
}));

app.use((req, res, next) => {
  console.log(req.method, req.originalUrl);
  next();
});

app.use('/api/auth', authRouter);
app.use('/api/recipes', recipesRouter);

// Зібраний клієнт React (npm run build): сайт і API на одній адресі
if (fs.existsSync(CLIENT_DIR)) {
  app.use(express.static(CLIENT_DIR));
}

app.use((req, res) => res.status(404).json({ error: 'Не знайдено' }));

// Помилки: деталі лише в консоль сервера, клієнту — загальне повідомлення
app.use((err, req, res, next) => {
  console.error(err.message);
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Занадто великий запит' });
  res.status(500).json({ error: 'Помилка сервера' });
});

await initDb();
app.listen(PORT, () => {
  console.log(`API: http://localhost:${PORT}/api/recipes`);
});
