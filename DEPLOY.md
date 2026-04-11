# Развёртывание CLO на Yandex Cloud

Полная пошаговая инструкция по первому деплою. Все команды выполняете вы, код уже готов в репозитории.

## Что получится в итоге

```
┌───────────────────────────────────────────┐
│  Frontend (React SPA)                     │
│  → bucket beeline-clo-static              │
│  → serve через static website hosting     │
└──────────────────┬────────────────────────┘
                   │ HTTPS fetch
┌──────────────────▼────────────────────────┐
│  Backend (FastAPI) на Compute Cloud VM    │
│  → Nginx :80 → FastAPI :8000 (Docker)     │
└────┬──────────────┬──────────────┬────────┘
     │              │              │
     ▼              ▼              ▼
┌─────────┐  ┌─────────┐  ┌────────────────┐
│ Managed │  │ Managed │  │ Object Storage │
│ Postgres│  │ Valkey  │  │ uploads bucket │
└─────────┘  └─────────┘  └────────────────┘
```

---

## Предусловия

- Ресурсы Yandex Cloud созданы (шаги 1-8 из вашего чек-листа) ✅
- SSH-доступ к ВМ работает: `ssh yuphiil@111.88.146.100`
- Есть доступ в Яндекс Cloud Console и CLI (`yc`) на локальной машине — опционально

---

## Часть I — Создание Container Registry

### 1. Создайте реестр контейнеров

1. Консоль → **Container Registry** → **Создать реестр**
2. Имя: `clo-beeline`
3. После создания скопируйте **Идентификатор реестра** (вида `crp1abc234de5f6ghi7jk`)

### 2. Дайте сервисному аккаунту права на push

1. **IAM** → **Сервисные аккаунты** → `beeline-clo-app`
2. **Назначить роль** → `container-registry.images.pusher`

### 3. Скачайте JSON-ключ сервисного аккаунта

Для GitHub Actions нужен JSON-ключ (не статический как для S3):

**Вариант A — через CLI** (если установлен `yc`):
```bash
yc iam key create --service-account-name beeline-clo-app -o sa-key.json
```

**Вариант B — через Консоль**:
1. Сервисный аккаунт `beeline-clo-app` → **Создать новый ключ** → **Создать авторизованный ключ**
2. Алгоритм: `RSA 4096`
3. Скачайте файл `authorized_key.json`
4. **Не теряйте** — показывается один раз

---

## Часть II — GitHub Secrets

Зайдите в ваш репозиторий на GitHub → **Settings → Secrets and variables → Actions → New repository secret**.

Добавьте следующие secrets:

| Имя | Значение | Откуда |
|-----|----------|--------|
| `YC_REGISTRY_ID` | `crp1abc234de5f6ghi7jk` | Из части I.1 |
| `YC_SA_JSON_KEY` | содержимое `authorized_key.json` целиком | Из части I.3 |
| `VM_IP` | `111.88.146.100` | Ваш IP ВМ |
| `VM_SSH_USER` | `yuphiil` | Ваш SSH user |
| `VM_SSH_KEY` | приватный SSH-ключ (`~/.ssh/id_rsa` целиком) | Тот же что используете для `ssh` на ВМ |

⚠️ **Важно**: `VM_SSH_KEY` должен быть именно **приватный** ключ (`-----BEGIN OPENSSH PRIVATE KEY-----`). Вставляется целиком, включая строки BEGIN/END.

---

## Часть III — Bootstrap ВМ

Подключитесь к ВМ и запустите установку зависимостей.

```bash
ssh yuphiil@111.88.146.100
```

Скачайте и запустите bootstrap-скрипт:

```bash
curl -fsSL https://raw.githubusercontent.com/<OWNER>/<REPO>/claude/beeline-clo-mvp-xH14B/deploy/vm-bootstrap.sh -o /tmp/bootstrap.sh
bash /tmp/bootstrap.sh
```

После успеха скрипт выведет следующие шаги. **Выйдите и перезайдите по SSH**, чтобы применились права docker:

```bash
exit
ssh yuphiil@111.88.146.100
docker --version  # проверка
```

---

## Часть IV — Первичный деплой

### 1. Подготовьте `.env` на ВМ

Загрузите шаблон с локальной машины:

```bash
# на локальной машине:
scp .env.example yuphiil@111.88.146.100:/opt/clo/.env
```

На ВМ отредактируйте:

```bash
ssh yuphiil@111.88.146.100
cd /opt/clo
nano .env
```

Заполните **реальными** значениями (перечитайте раздел с безопасностью — не используйте `admin123`!):

```env
BACKEND_IMAGE=cr.yandex/<YC_REGISTRY_ID>/clo-backend:latest

DATABASE_URL=postgresql+asyncpg://clo_user:<STRONG_PASSWORD>@rc1b-29jmnpgtqtfaart1.mdb.yandexcloud.net:6432/clo_beeline?ssl=require

REDIS_URL=redis://default:<STRONG_REDIS_PASSWORD>@rc1b-q8r9tqlsil6mpbtj.mdb.yandexcloud.net:6379/0

JWT_SECRET=<openssl rand -hex 32>

STORAGE_BACKEND=s3
S3_BUCKET_UPLOADS=beeline-clo-uploads
YC_ACCESS_KEY=<ACCESS_KEY_FROM_STATIC_KEYS>
YC_SECRET_KEY=<SECRET_KEY_FROM_STATIC_KEYS>

CORS_ORIGINS=http://111.88.146.100,https://beeline-clo-static.website.yandexcloud.net
```

### 2. Загрузите compose + nginx config

```bash
# на локальной машине:
scp docker-compose.prod.yml yuphiil@111.88.146.100:/opt/clo/
ssh yuphiil@111.88.146.100 'mkdir -p /opt/clo/deploy/nginx'
scp deploy/nginx/clo.conf yuphiil@111.88.146.100:/opt/clo/deploy/nginx/
```

### 3. Запустите workflow в GitHub Actions вручную

1. GitHub → ваш репозиторий → **Actions**
2. Выберите **Deploy Backend to Yandex Cloud**
3. **Run workflow** → выберите ветку `claude/beeline-clo-mvp-xH14B` → **Run**
4. Смотрите логи — должна:
   - Собраться Docker-image
   - Пушнуться в `cr.yandex/.../clo-backend:sha-xxxxxxx`
   - Через SSH на ВМ обновиться `.env` с новым image tag
   - Запуститься `alembic upgrade head` (первая миграция создаст таблицы)
   - Запуститься контейнеры `api` и `nginx`

### 4. Создайте начальную миграцию (один раз)

Таблицы сейчас создаются через `Base.metadata.create_all()`. При первом деплое нужно сгенерировать первую Alembic-миграцию. Сделайте это ДО первого запуска workflow:

**Локально** (с работающим Python env):

```bash
cd backend
# временно указать production DB_URL в .env.local или через переменную
export DATABASE_URL="postgresql+asyncpg://clo_user:<pass>@rc1b-xxxx.mdb.yandexcloud.net:6432/clo_beeline?ssl=require"
alembic revision --autogenerate -m "initial schema"
git add alembic/versions/
git commit -m "feat: initial db migration"
git push
```

**ВНИМАНИЕ**: alembic autogenerate сравнит локальную модель с (пустой) базой и создаст миграцию «с нуля». После этого workflow автоматически запустит `alembic upgrade head` и заполнит схему.

**Альтернатива**: можно SSH на ВМ и вручную:
```bash
cd /opt/clo
docker compose -f docker-compose.prod.yml --env-file .env run --rm api alembic revision --autogenerate -m "initial schema"
# Результат скопировать обратно в репо (через scp или просто закоммитить)
```

### 5. Заполнить демо-данные

После того как схема создана:

```bash
ssh yuphiil@111.88.146.100
cd /opt/clo
docker compose -f docker-compose.prod.yml --env-file .env run --rm api python seed.py
```

Посмотрите вывод — должны появиться логины:
```
Admin:   admin@beeline.ru / admin123
Partner: partner@pyaterochka.ru / partner123
```

### 6. Проверка

```bash
# На ВМ
curl http://localhost/api/health
# → {"status":"ok","storage":"s3","cache":true}

# С вашей машины
curl http://111.88.146.100/api/health

# Попробуйте логин
curl -X POST http://111.88.146.100/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@beeline.ru","password":"admin123"}'
```

Должен вернуться JSON с `access_token` и `refresh_token`.

---

## Часть V — Деплой фронтенда в Object Storage

### 1. Создайте workflow для фронтенда

Обновите `.github/workflows/deploy.yml` (он уже существует для GitHub Pages) — добавим новый или замените.

Упрощённый вариант — через `s3cmd`:

```yaml
name: Deploy Frontend to YC Object Storage

on:
  push:
    branches: [claude/beeline-clo-mvp-xH14B]
    paths:
      - 'frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Build
        working-directory: frontend
        run: |
          npm ci
          npm run build
        env:
          VITE_API_URL: http://111.88.146.100

      - name: Upload to YC Object Storage
        uses: povetek/yandex-object-storage-action@v4
        with:
          bucket: beeline-clo-static
          access-key-id: ${{ secrets.YC_ACCESS_KEY }}
          secret-access-key: ${{ secrets.YC_SECRET_KEY }}
          path: frontend/dist
          clear: true
```

Добавьте `YC_ACCESS_KEY` и `YC_SECRET_KEY` в GitHub Secrets.

### 2. Ручная загрузка (если workflow не нужен)

```bash
cd frontend
VITE_API_URL=http://111.88.146.100 npm run build

# Настройте aws CLI на endpoint Яндекса (один раз)
aws configure set region ru-central1
aws configure set aws_access_key_id <YC_ACCESS_KEY>
aws configure set aws_secret_access_key <YC_SECRET_KEY>

aws --endpoint-url=https://storage.yandexcloud.net s3 sync dist/ s3://beeline-clo-static/ --delete
```

### 3. Откройте сайт

`http://beeline-clo-static.website.yandexcloud.net`

Должен открыться каталог. Логин:
`http://beeline-clo-static.website.yandexcloud.net/login`

---

## Часть VI — Продакшен-финишинг (опционально, но рекомендую)

### 1. Ограничьте CORS

В `.env` на ВМ:
```
CORS_ORIGINS=https://beeline-clo-static.website.yandexcloud.net,https://your-domain.ru
```

Перезапустите:
```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d
```

### 2. Ограничьте публичный доступ к Postgres

Консоль → PostgreSQL кластер → **Редактировать** → **Публичный доступ**: выключить.

### 3. Настройте backup Postgres

Кластер → **Резервные копии** → Автоматически каждые сутки → Хранить 7 дней. Уже включено по умолчанию.

### 4. SSL через Let's Encrypt (когда будет домен)

Когда будет домен (например `api.beeline-clo.ru`):
```bash
ssh yuphiil@111.88.146.100
sudo apt install -y certbot python3-certbot-nginx

# остановить nginx в docker (certbot возьмёт :80 временно)
cd /opt/clo && docker compose -f docker-compose.prod.yml stop nginx

# получить сертификат
sudo certbot certonly --standalone -d api.beeline-clo.ru

# в deploy/nginx/clo.conf добавить server блок с listen 443 ssl
# пути: /etc/letsencrypt/live/api.beeline-clo.ru/fullchain.pem и privkey.pem
# смонтировать /etc/letsencrypt в docker-compose.prod.yml

docker compose -f docker-compose.prod.yml up -d nginx
```

### 5. Мониторинг

**Yandex Cloud Monitoring** — метрики ВМ/БД из коробки.
Дополнительно можно:
- **Sentry** для ошибок Python — `pip install sentry-sdk[fastapi]`
- **Uptime-робот** вроде Uptime Kuma на другой ВМ или бесплатный Uptime Robot

---

## Troubleshooting

### Бэк не стартует — проверьте логи

```bash
docker compose -f docker-compose.prod.yml logs api --tail 100
```

### Postgres connection refused

1. Публичный доступ к кластеру включён?
2. Security group PostgreSQL разрешает входящие с ВМ?
3. SSL: в `DATABASE_URL` есть `?ssl=require`?
4. Проверьте вручную:
   ```bash
   docker compose -f docker-compose.prod.yml run --rm api python -c \
     "import asyncio; from app.database import engine; \
      asyncio.run(engine.connect().__aenter__())"
   ```

### S3 upload падает с AccessDenied

1. У сервисного аккаунта есть роль `storage.editor`?
2. Статические ключи корректные?
3. Имя бакета в `.env` совпадает с реальным?
4. Проверка вручную:
   ```bash
   aws --endpoint-url=https://storage.yandexcloud.net s3 ls s3://beeline-clo-uploads/
   ```

### Frontend открывается, но 404 при перезагрузке `/client/demo`

Бакет `beeline-clo-static` → Веб-сайт → **Страница ошибки** должна быть `index.html` (не `404.html`).

### CORS ошибки в браузере

1. `.env` → `CORS_ORIGINS` содержит URL фронта?
2. После изменения `.env` перезапустили:
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env up -d
   ```

---

## Дальше что?

- **Перенос hardcoded данных** из `articles.ts`, `onboarding` и т.д. в БД, endpoint + admin UI
- **Webhook после деплоя** — сообщения в Telegram/Slack об обновлениях
- **Blue-Green deploy** — вторая ВМ за YC Application Load Balancer
- **Платный план Managed Postgres с репликами** для HA

Если что-то не получается — пришлите логи, помогу разобраться.
