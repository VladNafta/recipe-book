# Записник рецептів

Навчальний веб-застосунок: клієнт на React (Vite), сервер на Node.js, база даних PostgreSQL у Docker.

## Запуск

```
docker compose up -d          # база даних PostgreSQL (порт 5433)
cd server && npm install && npm start   # дані: http://localhost:4000/api/recipes
cd client && npm install && npm run dev # клієнт: http://localhost:5173
```

## Лабораторні роботи

- `lab2` — інтерактивний клієнт на React, дані з PostgreSQL
