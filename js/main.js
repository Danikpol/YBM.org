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
    .catch(error => {
        console.error('Ошибка загрузки новостей:', error);
        const newsList = document.getElementById('newsList');
        if (newsList) {
            newsList.innerHTML = '<p class="muted-p">Не удалось загрузить новости. Попробуйте позже.</p>';
        }
    });

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
});
