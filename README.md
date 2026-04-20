# ATM Tool Template (микрофронт + микросервис)

Шаблон для инструмента ATM: **Node.js / Express** (API + чтение метаданных из PostgreSQL) и **React + Webpack Module Federation** (микрофронт). Данные инструмента (название, описание, порты из `config.studio`, `config.ui`, URL и т.д.) отдаются микросервисом из таблицы **`tools.tools`** по **`ATM_TOOL_ID`** или **`ATM_TOOL_NAME`**.

## Переменные окружения

| Переменная | Обязательно | Описание |
|------------|-------------|----------|
| `DATABASE_URL` | да (для API) | PostgreSQL, как в основном проекте ATM |
| `ATM_TOOL_ID` | одно из двух | Первичный ключ строки в `tools.tools` |
| `ATM_TOOL_NAME` | одно из двух | Колонка `name` (если `ATM_TOOL_ID` не задан) |
| `PORT` | нет | Порт HTTP микросервиса (по умолчанию **8080**) |

Микрофронт в браузере ходит на **`/v1/tool-profile`** (относительный путь). В **Docker** перед микрофронтом стоит **nginx** и проксирует `/v1/` на контейнер `tool-api`.

## Локальная разработка (без Docker)

Терминал 1 — API:

```bash
cd service
cp .env.example .env
# задайте DATABASE_URL и ATM_TOOL_ID (или ATM_TOOL_NAME)
npm install
npm run dev
```

Терминал 2 — MF (devServer проксирует `/v1` на API):

```bash
cd mf
cp .env.example .env
# TOOL_API_PROXY_TARGET=http://127.0.0.1:8080
npm install
npm run start
```

Откройте `http://localhost:3090` (порт по умолчанию в шаблоне).

## Docker

Из корня шаблона:

```bash
cp .env.example .env
# заполните DATABASE_URL, ATM_TOOL_ID или ATM_TOOL_NAME
docker compose up --build
```

- **API**: порт хоста `TOOL_API_PUBLISH_PORT` (по умолчанию **8091**) → контейнер **8080**
- **MF + nginx**: порт хоста `TOOL_MF_PUBLISH_PORT` (по умолчанию **8092**) → **80**; nginx проксирует **`/v1/`** на сервис **`tool-api`**
- Сборка MF: аргумент **`ATM_TEMPLATE_REMOTE_NAME`** (см. `.env.example`) должен совпадать с **`config.ui.remoteKey`** в записи инструмента

## Встраивание в host ATM

1. Соберите MF (`npm run build` в `mf/`), опубликуйте `remoteEntry.js` по URL, пропишите его в поле **`frontend_remote_entry`** инструмента в БД (конструктор или вручную).
2. Укажите **`endpoint_url`** на развёрнутый микросервис (gateway или прямой URL).
3. В **Module Federation** имя remote (`remote_*`) должно совпадать с **`config.ui.remoteKey`** в БД; в шаблоне по умолчанию **`remote_template`** — замените в `mf/webpack.config.js` при клонировании.

## API

- `GET /health` — проверка процесса
- `GET /v1/tool-profile` — полный профиль инструмента из БД (JSON для UI)
