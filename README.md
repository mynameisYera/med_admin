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
- `/admin/parse` — запуск парсинга + статус + превью
- `/admin/data` — CRUD таблица цен (только role=admin)

## CRUD (экран «Данные»)

| Действие | API |
|----------|-----|
| Список + фильтры | `GET /parser/data/prices` |
| Создать | `POST /parser/data/prices` |
| Редактировать | `PATCH /parser/data/prices/{id}` |
| Скрыть | `DELETE /parser/data/prices/{id}` |
| Удалить навсегда | `DELETE /parser/data/prices/{id}?hard=true` |

При `403` показывается подсказка: нужен `role=admin` в БД и перелогин.

## Функции

- Выбор лаборатории, города, лимита услуг
- Запуск `POST /parser/{source}/run`
- Polling `GET /parser/status` (10 с первые 2 мин, затем 30 с)
- Таблица спарсенных городов и превью цен
- Таблица CRUD с фильтрами, пагинацией, созданием и редактированием
- Скрытие и жёсткое удаление записей
- Авто-refresh JWT при 401
