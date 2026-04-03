# CLO Platform — Билайн×НСПК

Card-Linked Offers MVP. Платформа партнёрских предложений с кэшбэком через СБП для приложения «Мой Билайн».

## Архитектура

| Модуль | Описание | URL |
|--------|----------|-----|
| Клиентский web-view | Каталог офферов, активация, кэшбэк | `/client/{phone_hash}` |
| Кабинет партнёра | Создание офферов, аналитика, биллинг | `/partner` |
| Админ-панель оператора | Управление партнёрами, реестры, финансы | `/admin` |
| Backend API | FastAPI, процессинг, matching | `localhost:8000/api/v1` |

## Стек

- **Backend:** Python 3.12, FastAPI, SQLAlchemy 2.0, Alembic
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS
- **БД:** PostgreSQL 16, Redis 7
- **Деплой:** Docker Compose

## Быстрый старт

```bash
# 1. Запустить все сервисы
docker compose up -d

# 2. Применить миграции
docker compose exec backend alembic upgrade head

# 3. Загрузить демо-данные
docker compose exec backend python seed.py

# 4. Открыть в браузере
# Фронтенд: http://localhost:3000
# API docs: http://localhost:8000/docs
```

## Демо-аккаунты

| Роль | Email | Пароль |
|------|-------|--------|
| Оператор | admin@beeline.ru | admin123 |
| Партнёр (Пятёрочка) | partner@pyaterochka.ru | partner123 |
| Партнёр (Магнит) | partner@magnit.ru | partner123 |

**Тестовый клиент:** `/client/a1b2c3d4e5f6789012345678901234567890123456789012345678901234`

## API Endpoints

### Auth
- `POST /api/v1/auth/login` — авторизация
- `POST /api/v1/auth/refresh` — обновление токена

### Партнёрский API
- `POST /api/v1/offers` — создать оффер
- `GET /api/v1/offers` — список офферов
- `PUT /api/v1/offers/{id}` — обновить
- `PUT /api/v1/offers/{id}/status` — изменить статус
- `POST /api/v1/offers/{id}/terminals` — загрузить терминалы
- `POST /api/v1/offers/{id}/placements` — настроить плейсменты
- `GET /api/v1/offers/{id}/stats` — аналитика
- `GET /api/v1/billing/balance` — баланс
- `GET /api/v1/billing/transactions` — история

### Процессинг
- `POST /api/v1/transactions/batch` — загрузить реестр НСПК
- `GET /api/v1/transactions/batch/{id}/status` — статус обработки
- `GET /api/v1/transactions/batch/{id}/results` — результаты matching

### Клиентский API
- `GET /api/v1/client/{phone_hash}/offers` — каталог
- `POST /api/v1/client/{phone_hash}/activate/{offer_id}` — активация
- `GET /api/v1/client/{phone_hash}/cashback` — история кэшбэка

### Админ API
- `GET /api/v1/admin/dashboard` — дашборд
- `GET/POST /api/v1/admin/partners` — партнёры
- `PUT /api/v1/admin/partners/{id}/balance` — пополнить баланс
- `PUT /api/v1/admin/offers/{id}/moderate` — модерация
- `POST /api/v1/admin/registry/upload` — загрузить реестр
- `GET /api/v1/admin/finance/revshare` — rev share
- `GET /api/v1/admin/finance/pnl` — P&L

## Бизнес-логика

### Matching (атрибуция)
1. Транзакция из реестра НСПК → поиск активных офферов по terminal_id/MCC
2. Проверка: клиент активировал оффер, сумма ≥ min_check, бюджет не исчерпан
3. При нескольких match → выбор с максимальным кэшбэком
4. Антифрод: ≤3 начислений/день, лимит на клиента, дедупликация

### Расчёт вознаграждения
- **Кэшбэк:** amount × rate (≤ max per tx)
- **Комиссия:** 3.6% от GMV
- **Rev share:** Билайн 20%, НСПК 17%, Билайн инвест 10%
