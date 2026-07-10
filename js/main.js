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

// ============================================
// ТУМБЛЕР ТЕМ (ВКЛЮЧИТЬ/ВЫКЛЮЧИТЬ ХАКЕРСКУЮ ТЕМУ)
// ============================================
// Установите true для включения хакерской темы
// Установите false для отключения (только тёмная тема)
const ENABLE_HACKER_THEME = false;

// --- ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ ---
function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    
    // Если хакерская тема отключена в коде - убираем кнопку
    if (!ENABLE_HACKER_THEME && themeToggle) {
        themeToggle.style.display = 'none';
        // Устанавливаем только тёмную тему
        document.documentElement.setAttribute('data-theme', 'dark');
        return;
    }
    
    // Если хакерская тема включена
    if (themeToggle) {
        const themes = ['dark', 'hacker'];
        const themeIcons = {
            'dark': '☀️',
            'hacker': '💻'
        };
        const themeLabels = {
            'dark': 'ТЁМНАЯ',
            'hacker': 'ХАКЕР'
        };

        let currentThemeIndex = parseInt(localStorage.getItem('themeIndex')) || 0;
        const savedTheme = localStorage.getItem('theme') || 'dark';
        
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme, themeIcons, themeLabels);

        themeToggle.addEventListener('click', () => {
            currentThemeIndex = (currentThemeIndex + 1) % themes.length;
            const newTheme = themes[currentThemeIndex];
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            localStorage.setItem('themeIndex', currentThemeIndex);
            updateThemeIcon(newTheme, themeIcons, themeLabels);
            
            // Вибрация при переключении на хакерскую тему
            if (newTheme === 'hacker' && navigator.vibrate) {
                navigator.vibrate([100, 50, 100]);
            }
        });
    }
}

function updateThemeIcon(theme, themeIcons, themeLabels) {
    const icon = document.querySelector('.theme-toggle .icon');
    const label = document.querySelector('.theme-toggle span');
    if (icon) {
        icon.textContent = themeIcons[theme] || '☀️';
    }
    if (label) {
        label.textContent = themeLabels[theme] || 'ТЕМА';
    }
}

// --- ЗАГРУЗКА НОВОСТЕЙ ИЗ JSON (если элемент существует) ---
let loadedNews = [];

const newsListElement = document.getElementById('newsList');
if (newsListElement) {
    fetch('data/news.json')
        .then(response => response.json())
        .then(data => {
            loadedNews = data;
            
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
                newsListElement.appendChild(newsItem);
            });
        })
        .catch(error => {
            console.error('Ошибка загрузки новостей:', error);
            newsListElement.innerHTML = '<p class="muted-p">Не удалось загрузить новости. Попробуйте позже.</p>';
        });
}

function openNewsModal(index) {
    const news = loadedNews[index];
    
    document.getElementById('modal-news-title').innerText = news.title;
    document.getElementById('modal-news-date').innerText = news.date;
    document.getElementById('modal-news-text').innerHTML = news.text;
    
    openModal('universal-news-modal');
}

// --- АНИМАЦИИ ПРИ СКРОЛЛЕ ---
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Наблюдаем за элементами для анимации
    const animatedElements = document.querySelectorAll('.stat-item, .manifesto-point, .city-item, .list-item, .benefits-list li, .rules-list li');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// --- ИНТЕРАКТИВНЫЕ ЭФФЕКТЫ ---
function initInteractiveEffects() {
    // Эффект параллакса для мыши на hero-title
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        document.addEventListener('mousemove', (e) => {
            const x = (window.innerWidth / 2 - e.pageX) / 50;
            const y = (window.innerHeight / 2 - e.pageY) / 50;
            heroTitle.style.transform = `translate(${x}px, ${y}px)`;
        });
    }

    // Анимация счётчика для статистики
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const target = stat.textContent;
        const numericValue = parseInt(target.replace(/\D/g, ''));
        const suffix = target.replace(/[0-9]/g, '');
        
        if (!isNaN(numericValue)) {
            let current = 0;
            const increment = numericValue / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= numericValue) {
                    current = numericValue;
                    clearInterval(timer);
                }
                stat.textContent = Math.floor(current) + suffix;
            }, 30);
        }
    });

    // Эффект ripple для кнопок
    const buttons = document.querySelectorAll('.btn-link, .view-btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                transform: scale(0);
                animation: rippleEffect 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });

    // Добавляем CSS для ripple эффекта
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rippleEffect {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// --- ИНИЦИАЛИЗАЦИЯ ---
document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initScrollAnimations();
    initInteractiveEffects();
});
