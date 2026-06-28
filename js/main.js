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

// --- ЗАГРУЗКА НОВОСТЕЙ С API (обновлено) ---
let loadedNews = [];

// Вместо 'ВАШ_IP_СЕРВЕРА' впиши IP твоего сервера или api.ybmorg.ru
fetch('https://api.ybmorg.ru/news')
    .then(response => response.json())
    .then(data => {
        loadedNews = data;
        const newsList = document.getElementById('newsList');
        if (!newsList) return;
        
        newsList.innerHTML = ''; // Очищаем список перед отрисовкой
        
        data.forEach((news, index) => {
            const newsItem = document.createElement('div');
            newsItem.className = 'list-item blue-hover';
            
            newsItem.innerHTML = `
                <div class="item-info">
                    <b>${news.title}</b>
                    <span>${news.date}</span>
                </div>
                <button class="view-btn blue-btn" onclick="openNewsModal(${index})">Изучить</button>
            `;
            newsList.appendChild(newsItem);
        });
    })
    .catch(error => {
        console.error('Ошибка загрузки новостей из API:', error);
        const newsList = document.getElementById('newsList');
        if (newsList) {
            newsList.innerHTML = '<p class="muted-p">Обновления пока недоступны.</p>';
        }
    });

function openNewsModal(index) {
    const news = loadedNews[index];
    document.getElementById('modal-news-title').innerText = news.title;
    document.getElementById('modal-news-date').innerText = news.date;
    document.getElementById('modal-news-text').innerText = news.text;
    openModal('universal-news-modal');
}

// --- ИНИЦИАЛИЗАЦИЯ ---
document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
});

function toggleChat() {
    document.getElementById('ai-chat-window').classList.toggle('hidden');
}

document.getElementById('chat-input').addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const input = e.target;
        const msg = input.value;
        input.value = '';
        
        // Отправка на наш бэкенд
        const response = await fetch('https://api.ybmorg.ru/ask', {
            method: 'POST',
            body: JSON.stringify({ prompt: msg }),
            headers: {'Content-Type': 'application/json'}
        });
        const data = await response.json();
        
        const chat = document.getElementById('chat-messages');
        chat.innerHTML += `<div><b>Вы:</b> ${msg}</div><div><b>AI:</b> ${data.answer}</div>`;
        chat.scrollTop = chat.scrollHeight;
    }
    function toggleChat() {
    const chat = document.getElementById('ai-chat-window');
    chat.classList.toggle('hidden');
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg) return;

    // Добавляем сообщение пользователя
    const chat = document.getElementById('chat-messages');
    chat.innerHTML += `<div style="text-align: right; color: #007bff;">${msg}</div>`;
    input.value = '';

    // Запрос к API
    try {
        const response = await fetch('https://api.ybmorg.ru/ask', {
            method: 'POST',
            body: JSON.stringify({ prompt: msg }),
            headers: {'Content-Type': 'application/json'}
        });
        const data = await response.json();
        chat.innerHTML += `<div style="margin-top: 10px;"><b>AI:</b> ${data.answer}</div>`;
    } catch (e) {
        chat.innerHTML += `<div style="color: red;">Ошибка связи с сервером.</div>`;
    }
    chat.scrollTop = chat.scrollHeight;
}
});
