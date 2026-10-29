-- ЛР4: користувачі та власник рецепта
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(50)  NOT NULL,
  email         VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(100) NOT NULL,   -- пароль зберігається лише як bcrypt-хеш
  created_at    TIMESTAMP    DEFAULT NOW()
);

ALTER TABLE recipes ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;
