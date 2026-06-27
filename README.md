# Med Admin — парсинг цен лабораторий

React-админка для запуска парсинга цен (KDL, Olymp, Helix, Invitro).

## Архитектура

```
src/
  domain/           — сущности и интерфейсы репозиториев
  application/      — сервисы и хуки (use cases)
  infrastructure/   — HTTP-клиент, localStorage, реализации API
  presentation/     — страницы, компоненты, роутинг
  shared/           — конфиг и утилиты
```

## Запуск

```bash
npm install
cp .env.example .env   # при необходимости смените VITE_API_URL
npm run dev
```

Откройте http://localhost:5173/admin/login

## Переменные

| Переменная      | По умолчанию                              |
|-----------------|-------------------------------------------|
| `VITE_API_URL`  | `https://uiren-backend.onrender.com/api`  |

Локальный бэкенд: `http://127.0.0.1:8000/api`

## Маршруты

- `/admin/login` — вход (JWT)
- `/admin` — панель парсинга (защищённый маршрут)

## Функции

- Выбор лаборатории, города, лимита услуг
- Запуск `POST /parser/{source}/run`
- Polling `GET /parser/status` (10 с первые 2 мин, затем 30 с)
- Таблица спарсенных городов и превью цен
- Авто-refresh JWT при 401
