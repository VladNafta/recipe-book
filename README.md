# Записник рецептів

Навчальний веб-застосунок: клієнт на React (Vite), сервер на Node.js (Express), база даних PostgreSQL у Docker.

## Запуск

```
docker compose up -d          # база даних PostgreSQL (порт 5433)
cd server && npm install && cp .env.example .env && npm start   # API: http://localhost:4000/api/recipes, документація: /api-docs
cd client && npm install && npm run dev # клієнт: http://localhost:5173
```

## Розгортання на Render

У файлі `render.yaml` описано базу PostgreSQL і веб-сервіс. На render.com: New → Blueprint → вибрати репозиторій → Apply.
Під час збирання будується клієнт React, сервер віддає його разом з API на одній адресі. Таблиці й початкові рецепти
створюються з файлів `db/*.sql` під час першого запуску сервера.

## Лабораторні роботи

- `lab2` — інтерактивний клієнт на React, дані з PostgreSQL
- `lab3` — REST API на Express (CRUD), OpenAPI-специфікація, тестування в Postman
- `lab4` — форми, localStorage/sessionStorage, сесії користувачів, валідація і захист даних
