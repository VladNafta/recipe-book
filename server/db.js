// Пул підключень до PostgreSQL, що працює в Docker-контейнері
import pg from 'pg';

export const pool = new pg.Pool({
  host: 'localhost',
  port: 5433,
  user: 'recipes',
  password: 'recipes',
  database: 'recipes',
});
