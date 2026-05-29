# МБД Сайт - Инструкция по развертыванию

## Структура проекта

```
сайт/
├── private/              # Личные данные (не в Git)
│   ├── bot_auth.py       # Генерация токенов
│   ├── telegram_bot.py  # Telegram бот
│   ├── backend.py        # Flask бэкенд
│   └── requirements.txt  # Зависимости
├── public/               # Публичные файлы (в Git)
│   ├── index.html       # Главная страница
│   ├── css/             # Стили
│   ├── js/              # JavaScript
│   └── data/            # Данные новостей
└── docs/                # Документация
    └── README.md        # Этот файл
```

## Установка и запуск

### 1. Установка зависимостей

```bash
cd private
pip install -r requirements.txt
```

### 2. Настройка

Откройте файлы в `private/` и замените значения:

**bot_auth.py и telegram_bot.py:**
```python
ADMIN_ID = "ваш-telegram-id"  # Узнать у @userinfobot
SECRET_SALT = "ваша-уникальная-соль"
```

**telegram_bot.py:**
```python
BOT_TOKEN = "ваш-токен-бота"  # От @BotFather
```

**public/js/main.js:**
```javascript
const SECRET_SALT = "ваша-уникальная-соль";  # Та же что в bot_auth.py
const TELEGRAM_BOT_TOKEN = "ваш-токен-бота";
const TELEGRAM_ADMIN_ID = "ваш-telegram-id";
```

### 3. Запуск

```bash
# Терминал 1: Telegram бот
cd private
python telegram_bot.py

# Терминал 2: Flask бэкенд
cd private
python backend.py
```

Сайт будет доступен на `http://localhost:5000`

## Использование

### Авторизация администратора

1. Нажмите кнопку "🔐 Admin" внизу страницы
2. Введите логин и пароль
3. Подтвердите вход в Telegram боте
4. Получите права редактирования на 1 час

### Редактирование контента

После авторизации вы можете редактировать:
- **Новости** — заголовок, дата, описание, текст
- **Вступление** — весь контент секции
- **Документы** — весь контент секции
- **Безопасность** — весь контент секции

## Безопасность

- Двухфакторная авторизация через Telegram
- ADMIN ID — только вы можете использовать бота
- Временные токены — действительны 5 минут
- HMAC-SHA256 — криптографическая защита
- Сессия — 1 час на сайте

## Развертывание

### GitHub Pages

1. Загрузите папку `public/` в репозиторий GitHub
2. Включите GitHub Pages
3. Сайт будет доступен по адресу `username.github.io/repo`

### Vercel/Netlify

1. Загрузите папку `public/`
2. Следуйте инструкциям платформы

**Важно:** Папка `private/` никогда не должна быть в Git!
