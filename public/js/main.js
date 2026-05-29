function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].className = tabcontent[i].className.replace(" active", "");
    }
    tablinks = document.getElementsByClassName("tab-btn");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).className += " active";
    evt.currentTarget.className += " active";
    window.scrollTo({top: 0, behavior: 'smooth'});
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    document.body.style.overflow = 'auto';
}

function closeModalOnOverlay(event, modalId) {
    if (event.target.id === modalId) {
        closeModal(modalId);
    }
}

// --- ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ ---
function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;

    // Загружаем сохраненную тему
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-toggle .icon');
    if (icon) {
        icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// --- СИСТЕМА ТОКЕНОВ ДЛЯ АВТОРИЗАЦИИ ---
// Секретная соль (должна быть одинаковой в bot_auth.py и здесь)
const SECRET_SALT = "MBD_SECRET_SALT_2026";

// Telegram Bot API для отправки запросов авторизации
const TELEGRAM_BOT_TOKEN = "8996091425:AAERAP2zuMwu83co0tVPgLhE1fjnKbl5V0U";
const TELEGRAM_ADMIN_ID = "8996091425";

async function hmacSha256(message, key) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const messageData = encoder.encode(message);
    
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

async function verifyToken(token, password) {
    try {
        const [timestampStr, receivedHash] = token.split(':');
        const timestamp = parseInt(timestampStr);
        
        // Проверяем, что токен не старше 5 минут (300 секунд)
        const currentTime = Math.floor(Date.now() / 1000);
        if (currentTime - timestamp > 300) {
            return false;
        }
        
        // Пересчитываем хеш
        const data = `${password}:${SECRET_SALT}:${timestamp}`;
        const expectedHash = await hmacSha256(data, SECRET_SALT);
        
        // Сравниваем хеши
        return receivedHash === expectedHash;
    } catch (e) {
        console.error('Ошибка проверки токена:', e);
        return false;
    }
}

function isAdminAuthenticated() {
    const authTime = localStorage.getItem('adminAuthTime');
    if (!authTime) return false;
    
    // Сессия действительна 1 час
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime - parseInt(authTime) < 3600;
}

async function sendAuthRequestToBot(sessionId, password) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_ADMIN_ID,
                text: `/auth ${sessionId} ${password}`
            })
        });
        
        const result = await response.json();
        return result.ok;
    } catch (error) {
        console.error('Ошибка отправки запроса авторизации:', error);
        return false;
    }
}

async function checkAuthConfirmation(sessionId) {
    // Проверяем подтверждение авторизации через бэкенд
    for (let i = 0; i < 40; i++) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        try {
            const response = await fetch(`/api/auth/check/${sessionId}`);
            const result = await response.json();
            
            if (result.confirmed) {
                return true;
            }
        } catch (error) {
            console.error('Ошибка проверки подтверждения:', error);
        }
    }
    return false;
}

async function authenticateWithTwoFactor(password) {
    // Генерируем session ID
    const sessionId = Math.random().toString(36).substring(2, 15);
    
    // Отправляем запрос в Telegram бот
    const sent = await sendAuthRequestToBot(sessionId, password);
    
    if (!sent) {
        alert('Ошибка отправки запроса авторизации. Проверьте подключение к интернету.');
        return false;
    }
    
    // Показываем сообщение о ожидании подтверждения
    alert('Запрос на авторизацию отправлен в Telegram. Подтвердите вход в боте в течение 2 минут.');
    
    // Проверяем подтверждение
    const confirmed = await checkAuthConfirmation(sessionId);
    
    if (confirmed) {
        localStorage.setItem('adminAuthTime', Math.floor(Date.now() / 1000).toString());
        localStorage.removeItem(`auth_confirmed_${sessionId}`);
        return true;
    }
    
    return false;
}

function logoutAdmin() {
    localStorage.removeItem('adminAuthTime');
    location.reload();
}

function showAuthModal(callback) {
    const modalHtml = `
        <div class="auth-modal active" id="auth-modal">
            <div class="auth-window">
                <h3>🔐 Авторизация администратора</h3>
                <p class="muted-p">Двухфакторная авторизация через Telegram</p>
                <div class="form-group">
                    <label>Логин</label>
                    <input type="text" id="admin-login" placeholder="Введите логин...">
                </div>
                <div class="form-group">
                    <label>Пароль</label>
                    <input type="password" id="admin-password" placeholder="Введите пароль...">
                </div>
                <button class="form-submit" onclick="submitAuth()">Войти</button>
                <button class="view-btn" onclick="closeAuthModal()" style="margin-top: 10px;">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    window.authCallback = callback;
}

function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.remove();
    window.authCallback = null;
}

async function submitAuth() {
    const login = document.getElementById('admin-login').value;
    const password = document.getElementById('admin-password').value;
    const submitBtn = document.querySelector('.auth-window .form-submit');
    
    if (!login || !password) {
        alert('Введите логин и пароль');
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';
    
    const success = await authenticateWithTwoFactor(password);
    
    submitBtn.disabled = false;
    submitBtn.textContent = 'Войти';
    
    if (success) {
        closeAuthModal();
        if (window.authCallback) window.authCallback();
    } else {
        alert('Авторизация не подтверждена или истекло время ожидания.');
    }
}

// --- ФОРМА ОБРАТНОЙ СВЯЗИ С ОТПРАВКОЙ В TELEGRAM ---
async function initContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('.form-submit');
        const successMsg = form.querySelector('.form-success');
        
        // Отключаем кнопку
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';

        // Собираем данные формы
        const formData = {
            name: form.querySelector('#contact-name').value,
            email: form.querySelector('#contact-email').value,
            subject: form.querySelector('#contact-subject').value,
            message: form.querySelector('#contact-message').value
        };

        // Отправка в Telegram
        const telegramSuccess = await sendToTelegram(formData);

        if (telegramSuccess) {
            // Показываем успех
            successMsg.classList.add('show');
            form.reset();
        } else {
            alert('Ошибка отправки. Попробуйте позже или свяжитесь напрямую в Telegram.');
        }
        
        // Восстанавливаем кнопку
        submitBtn.disabled = false;
        submitBtn.textContent = 'Отправить';

        // Скрываем сообщение через 5 секунд
        setTimeout(() => {
            successMsg.classList.remove('show');
        }, 5000);
    });
}

async function sendToTelegram(data) {
    // ЗАМЕНИТЕ НА ВАШИ ДАННЫЕ:
    const BOT_TOKEN = '8996091425:AAERAP2zuMwu83co0tVPgLhE1fjnKbl5V0U'; // Token вашего Telegram бота
    const CHAT_ID = '8996091425'; // Ваш Chat ID (можно узнать у @userinfobot)
    
    const message = `
📩 *Новое сообщение с сайта МБД*

*Имя:* ${data.name}
*Email:* ${data.email}
*Тема:* ${getSubjectLabel(data.subject)}
*Сообщение:*
${data.message}
    `.trim();

    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        const result = await response.json();
        return result.ok;
    } catch (error) {
        console.error('Ошибка отправки в Telegram:', error);
        return false;
    }
}

function getSubjectLabel(value) {
    const labels = {
        'cooperation': 'Сотрудничество',
        'partnership': 'Партнерство',
        'integration': 'Интеграция',
        'support': 'Техническая поддержка',
        'other': 'Другое'
    };
    return labels[value] || value;
}

// --- AI АССИСТЕНТ ---
function initAIAssistant() {
    const aiButton = document.querySelector('.ai-button');
    const aiChatWindow = document.querySelector('.ai-chat-window');
    const aiCloseChat = document.querySelector('.ai-close-chat');
    const aiChatInput = document.querySelector('.ai-chat-input input');
    const aiSendBtn = document.querySelector('.ai-chat-input button');
    const aiMessages = document.querySelector('.ai-chat-messages');

    if (!aiButton || !aiChatWindow) return;

    // Открытие/закрытие чата
    aiButton.addEventListener('click', () => {
        aiChatWindow.classList.toggle('active');
    });

    aiCloseChat.addEventListener('click', () => {
        aiChatWindow.classList.remove('active');
    });

    // Отправка сообщения
    async function sendMessage() {
        const message = aiChatInput.value.trim();
        if (!message) return;

        // Добавляем сообщение пользователя
        addMessage(message, 'user');
        aiChatInput.value = '';

        // Показываем индикатор печати
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'ai-typing';
        typingIndicator.textContent = 'AI печатает...';
        aiMessages.appendChild(typingIndicator);
        aiMessages.scrollTop = aiMessages.scrollHeight;

        // Генерируем ответ (замените на реальный API)
        const response = await generateAIResponse(message);
        
        // Удаляем индикатор и добавляем ответ
        typingIndicator.remove();
        addMessage(response, 'assistant');
    }

    aiSendBtn.addEventListener('click', sendMessage);
    aiChatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    function addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${type}`;
        messageDiv.textContent = text;
        aiMessages.appendChild(messageDiv);
        aiMessages.scrollTop = aiMessages.scrollHeight;
    }

    async function generateAIResponse(message) {
        // Имитация задержки
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Простые правила ответов в рамках МБД
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('привет') || lowerMessage.includes('здравств')) {
            return 'Привет! Я AI-ассистент МБД. Чем могу помочь в вопросах развития бизнеса и участия в движении?';
        }
        else if (lowerMessage.includes('мбд') || lowerMessage.includes('движение')) {
            return 'МБД — это Молодежное Бизнес Движение, закрытая экосистема для амбициозных предпринимателей. Мы объединяем тех, кто строит реальные проекты, а не ищет оправданий.';
        }
        else if (lowerMessage.includes('вступить') || lowerMessage.includes('присоедин')) {
            return 'Для вступления в МБД запустите VectorB Bot: https://t.me/helptoIP_bot — пройдите анкетирование и покажите, что вы не инфантильны.';
        }
        else if (lowerMessage.includes('инфантиль') || lowerMessage.includes('оправдан')) {
            return 'В МБД нет места инфантильности. Мы ценим действие выше идеи. Ошибаться — нормально, сидеть и ныть — нет.';
        }
        else if (lowerMessage.includes('проект') || lowerMessage.includes('стартап')) {
            return 'В МБД мы помогаем развивать реальные проекты. Участники получают доступ к инструментам VectorB, менторству и пулам капитала.';
        }
        else if (lowerMessage.includes('контакт') || lowerMessage.includes('связ')) {
            return 'Связь с ядром: @g82891y48927kf93, Партнёр VectorB: @vectorBrepresent';
        }
        else {
            return 'Я специализируюсь на вопросах МБД. Спросите о вступлении, проектах, правилах движения или контактах администрации.';
        }
    }
}

// --- СИСТЕМА УПРАВЛЕНИЯ КОНТЕНТОМ С АВТОРИЗАЦИЕЙ ---
function initContentAdmin() {
    const authBtn = document.querySelector('.admin-auth-btn');
    const contentAdminPanel = document.querySelector('.content-admin-panel');
    
    if (!authBtn) return;

    if (!isAdminAuthenticated()) {
        authBtn.style.display = 'flex';
    } else {
        if (contentAdminPanel) {
            contentAdminPanel.style.display = 'block';
            loadContentForAdmin();
        }
        addLogoutButton();
        showEditButtons();
    }

    authBtn.addEventListener('click', () => {
        showAuthModal(() => {
            authBtn.style.display = 'none';
            if (contentAdminPanel) {
                contentAdminPanel.style.display = 'block';
                loadContentForAdmin();
            }
            addLogoutButton();
            showEditButtons();
        });
    });
}

function showEditButtons() {
    const editButtons = document.querySelectorAll('.edit-section-btn');
    editButtons.forEach(btn => {
        btn.style.display = 'block';
    });
}

function addLogoutButton() {
    const contentAdminPanel = document.querySelector('.content-admin-panel');
    if (!contentAdminPanel) return;

    if (contentAdminPanel.querySelector('.logout-btn')) return;

    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'logout-btn';
    logoutBtn.textContent = '🚪 Выйти';
    logoutBtn.onclick = logoutAdmin;
    contentAdminPanel.appendChild(logoutBtn);
}

async function loadContentForAdmin() {
    try {
        const response = await fetch('/api/content/load?type=news');
        const newsData = await response.json();
        renderNewsAdmin(newsData);
    } catch (error) {
        console.error('Ошибка загрузки новостей:', error);
    }
}

function renderNewsAdmin(data) {
    const adminList = document.querySelector('.news-admin-list');
    if (!adminList) return;

    adminList.innerHTML = '';
    
    data.forEach((news, index) => {
        const newsItem = document.createElement('div');
        newsItem.className = 'news-item-admin';
        newsItem.innerHTML = `
            <div class="news-item-admin-info">
                <h4>${news.title}</h4>
                <span>${news.date}</span>
            </div>
            <div class="news-item-admin-actions">
                <button class="news-action-btn edit" onclick="editNews(${index})">Редактировать</button>
                <button class="news-action-btn delete" onclick="deleteNews(${index})">Удалить</button>
            </div>
        `;
        adminList.appendChild(newsItem);
    });
}

async function editNews(index) {
    const response = await fetch('/api/content/load?type=news');
    const newsData = await response.json();
    const news = newsData[index];
    
    const newTitle = prompt('Заголовок:', news.title);
    if (newTitle === null) return;
    
    const newDate = prompt('Дата:', news.date);
    if (newDate === null) return;
    
    const newDescription = prompt('Описание:', news.description);
    if (newDescription === null) return;
    
    const newText = prompt('Текст (HTML):', news.text);
    if (newText === null) return;
    
    newsData[index] = {
        title: newTitle,
        date: newDate,
        description: newDescription,
        text: newText
    };
    
    try {
        const authTime = localStorage.getItem('adminAuthTime');
        const saveResponse = await fetch('/api/content/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Time': authTime
            },
            body: JSON.stringify({
                type: 'news',
                data: newsData
            })
        });
        
        const result = await saveResponse.json();
        if (result.success) {
            alert('Новость обновлена!');
            loadContentForAdmin();
            location.reload();
        } else {
            alert('Ошибка сохранения: ' + result.error);
        }
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        alert('Ошибка сохранения');
    }
}

async function deleteNews(index) {
    if (!confirm('Удалить новость #' + index + '?')) return;
    
    try {
        const response = await fetch('/api/content/load?type=news');
        const newsData = await response.json();
        
        newsData.splice(index, 1);
        
        const authTime = localStorage.getItem('adminAuthTime');
        const saveResponse = await fetch('/api/content/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Time': authTime
            },
            body: JSON.stringify({
                type: 'news',
                data: newsData
            })
        });
        
        const result = await saveResponse.json();
        if (result.success) {
            alert('Новость удалена!');
            loadContentForAdmin();
            location.reload();
        } else {
            alert('Ошибка удаления: ' + result.error);
        }
    } catch (error) {
        console.error('Ошибка удаления:', error);
        alert('Ошибка удаления');
    }
}

// Редактирование секций (вступление, документы, безопасность)
async function editSection(sectionId) {
    const sectionTitle = {
        'about': 'Вступление',
        'docs': 'Документы',
        'security': 'Безопасность'
    }[sectionId] || sectionId;
    
    try {
        const response = await fetch(`/api/content/load?type=section&section_id=${sectionId}`);
        const result = await response.json();
        
        const currentContent = result.content || '';
        const newContent = prompt(`Редактировать ${sectionTitle} (HTML):`, currentContent);
        
        if (newContent === null) return;
        
        const authTime = localStorage.getItem('adminAuthTime');
        const saveResponse = await fetch('/api/content/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Time': authTime
            },
            body: JSON.stringify({
                type: 'section',
                section_id: sectionId,
                content: newContent
            })
        });
        
        const saveResult = await saveResponse.json();
        if (saveResult.success) {
            alert(`${sectionTitle} обновлено!`);
            location.reload();
        } else {
            alert('Ошибка сохранения: ' + saveResult.error);
        }
    } catch (error) {
        console.error('Ошибка редактирования секции:', error);
        alert('Ошибка редактирования');
    }
}

// ПЕРЕДЕЛАННАЯ ЛОГИКА ЗАГРУЗКИ НОВОСТЕЙ
// Создаем массив в памяти, чтобы хранить загруженные новости
let loadedNews = [];

fetch('data/news.json')
    .then(response => response.json())
    .then(data => {
        loadedNews = data; // Сохраняем данные
        const newsList = document.getElementById('newsList');
        
        // Проходим циклом по каждой новости из JSON файла
        data.forEach((news, index) => {
            const newsItem = document.createElement('div');
            newsItem.className = 'list-item blue-hover';
            newsItem.innerHTML = `
                <div class="item-info">
                    <b>${news.title}</b>
                    <span>${news.date} — ${news.description}</span>
                </div>
                <button class="view-btn blue-btn" onclick="openNewsModal(${index})">Изучить</button>
            `;
            newsList.appendChild(newsItem);
        });
    })
    .catch(error => console.error('Ошибка загрузки новостей:', error));

// Функция, которая оживляет наше единственное окно под конкретную новость
function openNewsModal(index) {
    const news = loadedNews[index]; // Находим нужную новость по номеру
    
    // Подставляем данные в универсальное окно
    document.getElementById('modal-news-title').innerText = news.title;
    document.getElementById('modal-news-date').innerText = news.date;
    document.getElementById('modal-news-text').innerHTML = news.text; // innerHTML позволит читать теги <br>
    
    // Открываем окно
    openModal('universal-news-modal');
}

// --- ИНИЦИАЛИЗАЦИЯ ---
document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initContactForm();
    initAIAssistant();
    initContentAdmin();
});
