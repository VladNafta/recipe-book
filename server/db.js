// Пул підключень до PostgreSQL: на хостингу за адресою з DATABASE_URL,
// локально до бази в Docker-контейнері
import pg from 'pg';

export const pool = process.env.DATABASE_URL
  ? new pg.Pool({ connectionString: process.env.DATABASE_URL })
  : new pg.Pool({
      host: 'localhost',
      port: 5433,
      user: 'recipes',
      password: 'recipes',
      database: 'recipes',
    });
