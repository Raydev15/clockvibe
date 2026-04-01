/**
 * ClockVibe Pro — script.js
 * Lógica avançada para multi-páginas, PWA, temas e widget.
 */

/* =====================================================
   NAVEGAÇÃO MULTI-PÁGINAS
   ===================================================== */
function showPage(pageId) {
  // Esconder todas as páginas
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // Mostrar a página selecionada
  const targetPage = document.getElementById(`page-${pageId}`);
  if (targetPage) {
    targetPage.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Atualizar links da nav
  document.querySelectorAll('.cv-nav a').forEach(link => {
    link.classList.remove('active');
  });
  
  // Re-inicializar ícones Lucide para novos elementos
  if (window.lucide) lucide.createIcons();
}

/* =====================================================
   CONFIGURAÇÃO DE TEMAS
   ===================================================== */
const html = document.documentElement;
const themeCards = document.querySelectorAll('.theme-card');

// Carregar tema salvo ou padrão
let currentTheme = localStorage.getItem('clockvibe-pro-theme') || 'cyberpunk';
applyTheme(currentTheme);

themeCards.forEach(card => {
  card.addEventListener('click', () => {
    if (card.classList.contains('pro-locked')) {
      alert('Este tema é exclusivo para assinantes PRO! 🚀\n\nDesbloqueie agora na aba de Assinaturas.');
      showPage('planos');
      return;
    }
    const theme = card.dataset.theme;
    applyTheme(theme);
    localStorage.setItem('clockvibe-pro-theme', theme);
    
    // Atualizar UI dos cards
    themeCards.forEach(c => c.classList.remove('active'));
    card.classList.add('active');
  });
});

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  if (window.lucide) lucide.createIcons();
}

/* =====================================================
   MODO WIDGET (FULLSCREEN)
   ===================================================== */
const toggleWidget = document.getElementById('toggleWidget');
const closeWidget = document.getElementById('closeWidget');
const widgetOverlay = document.getElementById('widgetOverlay');
const widgetTime = document.getElementById('widgetTime');
const widgetDate = document.getElementById('widgetDate');

toggleWidget.addEventListener('click', () => {
  widgetOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  // Tentar entrar em Fullscreen real
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  }
});

closeWidget.addEventListener('click', () => {
  widgetOverlay.classList.add('hidden');
  document.body.style.overflow = '';
  if (document.exitFullscreen) {
    document.exitFullscreen();
  }
});

// Fechar widget com ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    widgetOverlay.classList.add('hidden');
    document.body.style.overflow = '';
  }
});

/* =====================================================
   PARTÍCULAS (Canvas)
   ===================================================== */
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

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
    this.alpha = Math.random() * 0.5 + 0.1;
  }
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    if (this.x > canvas.width || this.x < 0 || this.y > canvas.height || this.y < 0) {
      this.reset();
    }
  }
  draw() {
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    ctx.fillStyle = accentColor;
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

for (let i = 0; i < 100; i++) {
  particles.push(new Particle());
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animate);
}
animate();

/* =====================================================
   LÓGICA DO RELÓGIO
   ===================================================== */
const hourHand = document.getElementById('hourHand');
const minuteHand = document.getElementById('minuteHand');
const secondHand = document.getElementById('secondHand');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const weekdayEl = document.getElementById('weekday');
const fullDateEl = document.getElementById('fullDate');
const progressFill = document.getElementById('progressFill');
const dayPercentEl = document.getElementById('dayPercent');

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function updateClock() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();
  const ms = now.getMilliseconds();

  // Digital
  if (hoursEl) hoursEl.textContent = String(h).padStart(2, '0');
  if (minutesEl) minutesEl.textContent = String(m).padStart(2, '0');
  if (secondsEl) secondsEl.textContent = String(s).padStart(2, '0');

  // Widget
  if (widgetTime) widgetTime.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  if (widgetDate) widgetDate.textContent = `${now.getDate()} ${MESES[now.getMonth()]}`;

  // Analógico
  const hDeg = (h % 12) * 30 + m * 0.5;
  const mDeg = m * 6 + s * 0.1;
  const sDeg = s * 6 + ms * 0.006;

  if (hourHand) hourHand.style.transform = `rotate(${hDeg}deg)`;
  if (minuteHand) minuteHand.style.transform = `rotate(${mDeg}deg)`;
  if (secondHand) secondHand.style.transform = `rotate(${sDeg}deg)`;

  // Data
  if (weekdayEl) weekdayEl.textContent = DIAS[now.getDay()];
  if (fullDateEl) fullDateEl.textContent = `${now.getDate()} ${MESES[now.getMonth()]} ${now.getFullYear()}`;

  // Progresso do Dia
  const totalSeconds = 24 * 60 * 60;
  const elapsedSeconds = h * 3600 + m * 60 + s;
  const percent = (elapsedSeconds / totalSeconds) * 100;
  if (progressFill) progressFill.style.width = `${percent}%`;
  if (dayPercentEl) dayPercentEl.textContent = `${percent.toFixed(1)}%`;
}

setInterval(updateClock, 100);
updateClock();

/* =====================================================
   MARCADORES DO RELÓGIO
   ===================================================== */
const clockMarks = document.getElementById('clockMarks');
if (clockMarks) {
  for (let i = 0; i < 60; i++) {
    const mark = document.createElement('div');
    mark.style.position = 'absolute';
    mark.style.width = i % 5 === 0 ? '4px' : '1px';
    mark.style.height = i % 5 === 0 ? '15px' : '8px';
    mark.style.background = i % 5 === 0 ? 'var(--accent)' : 'var(--text-3)';
    mark.style.left = '50%';
    mark.style.top = '0';
    mark.style.transformOrigin = '0 150px';
    mark.style.transform = `translateX(-50%) rotate(${i * 6}deg)`;
    clockMarks.appendChild(mark);
  }
}
