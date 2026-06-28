// --- ФУНКЦИИ УПРАВЛЕНИЯ МОДАЛЬНЫМИ ОКНАМИ ---
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function closeModalOnOverlay(event, modalId) {
    if (event.target.id === modalId) {
        closeModal(modalId);
    }
}

// --- ПЕРЕКЛЮЧАТЕЛЬ ВКЛАДОК ---
function openTab(evt, tabName) {
    const tabcontent = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
    }
    const tablinks = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
    window.scrollTo({top: 0, behavior: 'smooth'});
}

// --- ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ ---
function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-toggle .icon');
    if (icon) icon.innerText = theme === 'light' ? '🌙' : '☀️';
}

// --- ЗАГРУЗКА НОВОСТЕЙ (Пример структуры) ---
let loadedNews = [
    {
        title: "Масштабирование веб-платформы",
        date: "15 мая 2026 г.",
        description: "Полное обновление UI/UX.",
        text: "Интерфейс переработан под Slate-Grey палитру. Внедрена адаптивность для Telegram WebApp.",
        file: "docs/update_web.pdf"
    }
];

function loadNews() {
    const newsList = document.getElementById('newsList');
    if (!newsList) return;

    loadedNews.forEach((news, index) => {
        const newsItem = document.createElement('div');
        newsItem.className = 'list-item';
        newsItem.innerHTML = `
            <div class="item-info">
                <b>${news.title}</b>
                <span>${news.date} — ${news.description}</span>
            </div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button class="view-btn" onclick="openNewsModal(${index})">Изучить</button>
            </div>
        `;
        newsList.appendChild(newsItem);
    });
}

function openNewsModal(index) {
    const news = loadedNews[index];
    document.getElementById('modal-news-title').innerText = news.title;
    document.getElementById('modal-news-date').innerText = news.date;
    document.getElementById('modal-news-text').innerHTML = news.text;
    openModal('universal-news-modal');
}

// --- ИНИЦИАЛИЗАЦИЯ ---
document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    loadNews();
    
    // Устанавливаем сохраненную тему
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
});
