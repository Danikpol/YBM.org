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

// --- ЗАГРУЗКА КОНФИГУРАЦИИ ---
let CONFIG = {
    telegram: {
        bot_token: 'YOUR_BOT_TOKEN',
        chat_id: 'YOUR_CHAT_ID'
    },
    deepseek: {
        api_key: 'YOUR_DEEPSEEK_API_KEY',
        api_url: 'https://api.deepseek.com/v1/chat/completions'
    },
    security: {
        rate_limit: {
            max_requests_per_minute: 10,
            max_requests_per_hour: 100
        }
    }
};

// Загружаем конфиг из config.json если он есть
async function loadConfig() {
    try {
        const response = await fetch('config.json');
        if (response.ok) {
            CONFIG = await response.json();
            console.log('✅ Конфигурация загружена из config.json');
            console.log('Telegram токен:', CONFIG.telegram.bot_token.substring(0, 10) + '...');
            console.log('DeepSeek API ключ:', CONFIG.deepseek.api_key.substring(0, 10) + '...');
        } else {
            console.log('⚠️ config.json не найден или ошибка загрузки');
            console.log('Используем конфигурацию по умолчанию');
        }
    } catch (error) {
        console.log('❌ Ошибка загрузки config.json:', error);
        console.log('Используем конфигурацию по умолчанию');
    }
}

// --- ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ ---
function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;

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

// --- ФОРМА ЗАЯВКИ С ОТПРАВКОЙ В TELEGRAM ---
function initApplicationForm() {
    const form = document.getElementById('application-form');
    if (!form) return;

    const statusRadios = document.querySelectorAll('input[name="mbd_status"]');
    const statusNumberGroup = document.getElementById('status-number-group');

    // Показываем/скрываем поле номера статуса
    statusRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'status') {
                statusNumberGroup.style.display = 'block';
            } else {
                statusNumberGroup.style.display = 'none';
            }
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Проверка rate limit
        const rateCheck = securityManager.checkRateLimit();
        if (!rateCheck.allowed) {
            alert(`${rateCheck.reason}. Попробуйте через ${rateCheck.retryAfter} сек.`);
            return;
        }
        
        const submitBtn = form.querySelector('.form-submit');
        const successMsg = form.querySelector('.form-success');
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';

        const formData = {
            name: form.querySelector('#contact-name').value,
            contact: form.querySelector('#contact-contact').value,
            subject: form.querySelector('#contact-subject').value,
            message: form.querySelector('#contact-message').value,
            mbd_status: form.querySelector('input[name="mbd_status"]:checked').value,
            status_number: form.querySelector('#status-number').value
        };

        const telegramSuccess = await sendToTelegram(formData);

        if (telegramSuccess) {
            successMsg.classList.add('show');
            form.reset();
            statusNumberGroup.style.display = 'none';
        } else {
            alert('Ошибка отправки. Попробуйте позже или свяжитесь напрямую в Telegram.');
        }
        
        submitBtn.disabled = false;
        submitBtn.textContent = 'Отправить заявку';

        setTimeout(() => {
            successMsg.classList.remove('show');
        }, 5000);
    });
}

async function sendToTelegram(data) {
    const BOT_TOKEN = CONFIG.telegram.bot_token;
    const CHAT_ID = CONFIG.telegram.chat_id;
    
    if (BOT_TOKEN === 'YOUR_BOT_TOKEN' || CHAT_ID === 'YOUR_CHAT_ID') {
        console.error('Telegram токен не настроен');
        return false;
    }
    
    let statusText = 'Не участник МБД';
    if (data.mbd_status === 'member') {
        statusText = 'Участник МБД (без статуса)';
    } else if (data.mbd_status === 'status') {
        if (data.status_number) {
            statusText = `Участник МБД со статусом #${data.status_number}`;
        } else {
            statusText = 'Участник МБД (статус не указан)';
        }
    }

    const message = `
📩 *Новая заявка с сайта МБД*

*Имя:* ${data.name}
*Контакт:* ${data.contact}
*Тема:* ${getSubjectLabel(data.subject)}
*Статус:* ${statusText}

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
        'join': 'Вступление в МБД',
        'other': 'Другое'
    };
    return labels[value] || value;
}

// --- ЗАЩИТА ОТ СПАМА И DDoS ---
class SecurityManager {
    constructor() {
        this.requestHistory = [];
        this.blockedUntil = null;
    }

    checkRateLimit() {
        const now = Date.now();
        
        // Проверяем блокировку
        if (this.blockedUntil && now < this.blockedUntil) {
            return {
                allowed: false,
                reason: 'Временная блокировка',
                retryAfter: Math.ceil((this.blockedUntil - now) / 1000)
            };
        }
        
        // Удаляем старые записи (старше 1 часа)
        this.requestHistory = this.requestHistory.filter(
            timestamp => now - timestamp < 3600000
        );
        
        // Проверяем лимит в минуту
        const lastMinute = this.requestHistory.filter(
            timestamp => now - timestamp < 60000
        );
        
        if (lastMinute.length >= CONFIG.security.rate_limit.max_requests_per_minute) {
            return {
                allowed: false,
                reason: 'Превышен лимит запросов в минуту',
                retryAfter: 60
            };
        }
        
        // Проверяем лимит в час
        if (this.requestHistory.length >= CONFIG.security.rate_limit.max_requests_per_hour) {
            return {
                allowed: false,
                reason: 'Превышен лимит запросов в час',
                retryAfter: 3600
            };
        }
        
        // Добавляем текущий запрос
        this.requestHistory.push(now);
        
        return { allowed: true };
    }

    blockUser(durationSeconds = 300) {
        this.blockedUntil = Date.now() + (durationSeconds * 1000);
    }
}

const securityManager = new SecurityManager();

// --- AI АССИСТЕНТ НА БАЗЕ DEEPSEEK ---
class AIAssistant {
    constructor() {
        this.apiKey = CONFIG.deepseek.api_key;
        this.apiUrl = CONFIG.deepseek.api_url;
        this.conversationHistory = [];
        this.systemPrompt = `Ты AI-ассистент Молодежного Бизнес Движения (МБД). 

Правила:
1. Отвечай ТОЛЬКО на вопросы, связанные с МБД, бизнесом, предпринимательством, стартапами и развитием.
2. Если вопрос не связан с МБД, вежливо откажись и предложи задать вопрос по теме движения.
3. Используй тон: профессиональный, мотивирующий, прямой.
4. Философия МБД: действие выше идеи, нет оправданий, нет инфантильности.
5. Структура МБД: Общий круг, Стартаперы, Финансисты VIP.
6. Контакты: @g82891y48927kf93 (ядро), @vectorBrepresent (партнёр).
7. Для вступления: https://t.me/helptoIP_bot
8. Не давай финансовых советов, не обещай гарантированного успеха.
9. Отвечай на русском языке.`;
    }

    async sendMessage(userMessage) {
        if (this.apiKey === 'YOUR_DEEPSEEK_API_KEY') {
            return 'AI-ассистент не настроен. Обратитесь к администратору.';
        }

        this.conversationHistory.push({
            role: 'user',
            content: userMessage
        });

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        { role: 'system', content: this.systemPrompt },
                        ...this.conversationHistory.slice(-10) // Храним последние 10 сообщений
                    ],
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });

            const data = await response.json();
            
            if (data.error) {
                console.error('DeepSeek API error:', data.error);
                return 'Ошибка AI-ассистента. Попробуйте позже.';
            }

            const assistantMessage = data.choices[0].message.content;
            this.conversationHistory.push({
                role: 'assistant',
                content: assistantMessage
            });

            return assistantMessage;
        } catch (error) {
            console.error('Error calling DeepSeek API:', error);
            return 'Ошибка соединения с AI-ассистентом.';
        }
    }

    clearHistory() {
        this.conversationHistory = [];
    }
}

const aiAssistant = new AIAssistant();

function initAIAssistant() {
    const aiButton = document.querySelector('.ai-button');
    const aiChatWindow = document.querySelector('.ai-chat-window');
    const aiCloseChat = document.querySelector('.ai-close-chat');
    const aiChatInput = document.querySelector('.ai-chat-input input');
    const aiSendBtn = document.querySelector('.ai-chat-input button');
    const aiMessages = document.querySelector('.ai-chat-messages');

    if (!aiButton || !aiChatWindow) return;

    aiButton.addEventListener('click', () => {
        aiChatWindow.classList.toggle('active');
    });

    aiCloseChat.addEventListener('click', () => {
        aiChatWindow.classList.remove('active');
    });

    async function sendMessage() {
        const message = aiChatInput.value.trim();
        if (!message) return;

        // Проверка rate limit
        const rateCheck = securityManager.checkRateLimit();
        if (!rateCheck.allowed) {
            alert(`${rateCheck.reason}. Попробуйте через ${rateCheck.retryAfter} сек.`);
            return;
        }

        addMessage(message, 'user');
        aiChatInput.value = '';

        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'ai-typing';
        typingIndicator.textContent = 'AI печатает...';
        aiMessages.appendChild(typingIndicator);
        aiMessages.scrollTop = aiMessages.scrollHeight;

        const response = await aiAssistant.sendMessage(message);
        
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
}

// --- ЗАГРУЗКА НОВОСТЕЙ ИЗ JSON ---
let loadedNews = [];

fetch('data/news.json')
    .then(response => response.json())
    .then(data => {
        loadedNews = data;
        const newsList = document.getElementById('newsList');
        
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

function openNewsModal(index) {
    const news = loadedNews[index];
    
    document.getElementById('modal-news-title').innerText = news.title;
    document.getElementById('modal-news-date').innerText = news.date;
    document.getElementById('modal-news-text').innerHTML = news.text;
    
    openModal('universal-news-modal');
}

// --- ИНИЦИАЛИЗАЦИЯ ---
document.addEventListener('DOMContentLoaded', async () => {
    await loadConfig();
    initThemeToggle();
    initApplicationForm();
    initAIAssistant();
});
