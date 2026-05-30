# МБД — Официальный сайт

Статический сайт Молодежного Бизнес Движения с формой заявки и интеграцией с Telegram.

## 📋 Структура проекта

```
YBM.org/
├── css/              # Стили
│   └── styles.css
├── js/               # JavaScript
│   └── main.js
├── data/             # Данные
│   └── news.json     # Новости
├── docs/             # Документация
│   └── POSSIBILITIES.md  # Возможности для развития
├── private/          # Личные файлы (не в Git)
│   ├── telegram_bot.py
│   └── requirements.txt
├── .github/          # GitHub Actions
│   └── workflows/
│       └── deploy.yml
├── index.html       # Главная страница
├── setup-token.js   # Скрипт для настройки токена
└── README.md        # Этот файл
```

## 🚀 Быстрый старт

### Локальная настройка

1. **Клонируйте репозиторий**
```bash
git clone <your-repo-url>
cd YBM.org
```

2. **Настройте Telegram токен (локально)**
```bash
node setup-token.js
```
Введите ваш токен бота и Chat ID.

3. **Откройте сайт**
Просто откройте `index.html` в браузере или используйте локальный сервер:
```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve
```

### Развертывание на GitHub Pages

1. **Создайте репозиторий на GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Настройте GitHub Secrets**
Перейдите в Settings → Secrets and variables → Actions и добавьте:
- `TELEGRAM_BOT_TOKEN` — токен вашего Telegram бота
- `TELEGRAM_CHAT_ID` — ваш Chat ID

3. **Включите GitHub Pages**
Settings → Pages → Source: GitHub Actions

4. **Пушьте изменения**
GitHub Actions автоматически развернет сайт.

## 🤖 Настройка Telegram бота

### 1. Создайте бота
1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/newbot`
3. Следуйте инструкциям для создания бота
4. Сохраните токен бота

### 2. Получите Chat ID
1. Откройте [@userinfobot](https://t.me/userinfobot)
2. Отправьте `/start`
3. Сохраните ваш Chat ID

### 3. Запустите бота (опционально)
Если хотите получать уведомления о запуске бота:

```bash
cd private
pip install -r requirements.txt
python telegram_bot.py
```

**Важно:** Замените `YOUR_BOT_TOKEN` в `private/telegram_bot.py` на ваш реальный токен.

## 📝 Редактирование контента

### Новости
Откройте `data/news.json` и добавьте/измените новости:

```json
[
  {
    "title": "Название новости",
    "date": "30.05.2026",
    "description": "Краткое описание",
    "text": "Полный текст новости с <b>HTML</b> тегами"
  }
]
```

### Текстовые секции
Откройте `index.html` и редактируйте текст напрямую в HTML.

## 🎨 Кастомизация

### Цвета
Откройте `css/styles.css` и измените переменные в `:root`:

```css
:root {
    --bg-main: #1e222b;
    --bg-card: #282c34;
    --accent-red: #ff4a4a;
    --accent-blue: #4a9eff;
    /* ... */
}
```

### Темы
Сайт поддерживает темную и светлую тему. Тема сохраняется в localStorage пользователя.

## 🔒 Безопасность

### Токен бота
Токен бота скрыт через GitHub Actions Secrets и подставляется автоматически при деплое. **НЕ коммитьте файл с реальным токеном в Git!**

### Защита от спама
Рекомендуется добавить reCAPTCHA (см. `docs/POSSIBILITIES.md`).

## 📊 Возможности для развития

Полный список возможностей находится в `docs/POSSIBILITIES.md`.

Краткий список приоритетов:
1. **Высокий:** PWA, FAQ, аналитика, шаринг, reCAPTCHA
2. **Средний:** Блог, галерея проектов, команда, поиск
3. **Низкий:** AI-чат, платежи, курсы, лидерборд

## 🐛 Troubleshooting

### Форма не отправляет сообщения
1. Проверьте, что токен бота настроен правильно
2. Проверьте консоль браузера на ошибки
3. Убедитесь, что Chat ID правильный

### Сайт не загружается на GitHub Pages
1. Проверьте, что GitHub Actions включен
2. Проверьте, что Secrets настроены правильно
3. Посмотрите логи Actions на наличие ошибок

### Новости не отображаются
1. Проверьте формат `data/news.json`
2. Убедитесь, что JSON валидный
3. Проверьте консоль на ошибки

## 📞 Поддержка

- **Telegram:** @g82891y48927kf93
- **Партнёр VectorB:** @vectorBrepresent

## 📄 Лицензия

© 2026 МБД (Молодежное Бизнес Движение). Все права защищены.
