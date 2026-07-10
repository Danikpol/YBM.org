// ============================================
// МОДЕЛЬ 4 — ОДНА СТРАНИЦА, REVEAL, СКРОЛЛ
// ============================================

// --- МЕНЮ-ГАМБУРГЕР ---
function toggleMenu() {
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('menuOverlay');
    const toggle = document.getElementById('menuToggle');
    menu.classList.toggle('active');
    overlay.classList.toggle('active');
    toggle.classList.toggle('active');
}

// --- ПРОГРЕСС-БАР ---
function initProgressBar() {
    const bar = document.getElementById('progressBar');
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        bar.style.width = progress + '%';
    });
}

// --- ТАЙПРАЙТЕР ---
function initTypewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;
    const text = 'Ты не один такой.\nМы есть.';
    let index = 0;
    let isDeleting = false;
    let currentText = '';

    function type() {
        if (!isDeleting) {
            if (index < text.length) {
                const char = text[index];
                if (char === '\n') {
                    currentText += '<br>';
                } else {
                    currentText += char;
                }
                el.innerHTML = currentText;
                index++;
                setTimeout(type, 40 + Math.random() * 60);
            } else {
                // Дольше держим текст — 5 секунд вместо 3
                setTimeout(() => {
                    isDeleting = true;
                    type();
                }, 5000);
            }
        } else {
            if (currentText.length > 0) {
                if (currentText.endsWith('<br>')) {
                    currentText = currentText.slice(0, -4);
                } else {
                    currentText = currentText.slice(0, -1);
                }
                el.innerHTML = currentText;
                index--;
                setTimeout(type, 20 + Math.random() * 30);
            } else {
                isDeleting = false;
                index = 0;
                setTimeout(type, 2000);
            }
        }
    }
    type();
}

// --- ЧАСТИЦЫ ---
function initParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseX = 0, mouseY = 0;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.5 + 0.1;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200) {
                const force = (200 - dist) / 200 * 0.02;
                this.x += dx * force;
                this.y += dy * force;
            }
            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < 80; i++) particles.push(new Particle());

    function drawLines() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 * (1 - dist / 150)})`;
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        drawLines();
        requestAnimationFrame(animate);
    }

    document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
    animate();
}

// --- REVEAL АНИМАЦИЯ ПРИ СКРОЛЛЕ ---
function initReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // После появления больше не наблюдаем — убираем лаги
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px'
    });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// --- АКТИВНАЯ ССЫЛКА В МЕНЮ ПРИ СКРОЛЛЕ (с троттлингом) ---
function initActiveNav() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.side-btn');
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                let current = '';
                sections.forEach(section => {
                    const top = section.offsetTop - 250;
                    if (window.scrollY >= top) {
                        current = section.getAttribute('id');
                    }
                });

                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + current) {
                        link.classList.add('active');
                    }
                });
                ticking = false;
            });
            ticking = true;
        }
    });
}

// --- ИНИЦИАЛИЗАЦИЯ ---
document.addEventListener('DOMContentLoaded', () => {
    initProgressBar();
    initTypewriter();
    initParticles();
    initReveal();
    initActiveNav();
});