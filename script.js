/**
 * ClockVibe — script.js
 * Relógio analógico + digital, tema dark/light,
 * barra de progresso do dia, cronômetro, timer e partículas.
 */

/* =====================================================
   TEMA DARK / LIGHT
   ===================================================== */
const html      = document.documentElement;
const themeBtn  = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

let currentTheme = localStorage.getItem('clockvibe-theme') || 'dark';
applyTheme(currentTheme);

themeBtn.addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(currentTheme);
  localStorage.setItem('clockvibe-theme', currentTheme);
});

function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  const iconName = theme === 'dark' ? 'sun' : 'moon';
  themeIcon.setAttribute('data-lucide', iconName);
  if (window.lucide) lucide.createIcons();
}

/* =====================================================
   PARTÍCULAS (Canvas)
   ===================================================== */
const canvas = document.getElementById('particles');
const ctx    = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function createParticle() {
  return {
    x:    Math.random() * canvas.width,
    y:    Math.random() * canvas.height,
    r:    Math.random() * 2 + 0.5,
    vx:   (Math.random() - 0.5) * 0.3,
    vy:   (Math.random() - 0.5) * 0.3,
    alpha: Math.random() * 0.5 + 0.1,
  };
}

for (let i = 0; i < 80; i++) particles.push(createParticle());

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const isDark = html.getAttribute('data-theme') === 'dark';
  const color  = isDark ? '124,111,255' : '109,91,255';

  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0) p.x = canvas.width;
    if (p.x > canvas.width) p.x = 0;
    if (p.y < 0) p.y = canvas.height;
    if (p.y > canvas.height) p.y = 0;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${color},${p.alpha})`;
    ctx.fill();
  });

  // Linhas entre partículas próximas
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx   = particles[i].x - particles[j].x;
      const dy   = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(${color},${0.08 * (1 - dist / 100)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(animateParticles);
}
animateParticles();

/* =====================================================
   MARCADORES DO RELÓGIO ANALÓGICO
   ===================================================== */
const clockMarks = document.getElementById('clockMarks');
const CLOCK_RADIUS = 130; // metade de 260px

for (let i = 0; i < 60; i++) {
  const mark = document.createElement('div');
  const isMajor = i % 5 === 0;
  mark.className = `clock-mark ${isMajor ? 'clock-mark--major' : 'clock-mark--minor'}`;

  const angle = (i / 60) * 360;
  const markH = isMajor ? 18 : 10;
  const dist  = CLOCK_RADIUS - markH - 4;

  mark.style.transform = `rotate(${angle}deg) translateY(-${dist}px)`;
  clockMarks.appendChild(mark);
}

/* =====================================================
   RELÓGIO — Atualização em tempo real
   ===================================================== */
const hourHand   = document.getElementById('hourHand');
const minuteHand = document.getElementById('minuteHand');
const secondHand = document.getElementById('secondHand');

const hoursEl   = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const periodEl  = document.getElementById('period');
const timezoneEl = document.getElementById('timezone');

const weekdayEl  = document.getElementById('weekday');
const fullDateEl = document.getElementById('fullDate');

const dayPercentEl  = document.getElementById('dayPercent');
const progressFill  = document.getElementById('progressFill');
const progressGlow  = document.getElementById('progressGlow');

const weekNumberEl = document.getElementById('weekNumber');
const dayOfYearEl  = document.getElementById('dayOfYear');
const moonPhaseEl  = document.getElementById('moonPhase');
const timestampEl  = document.getElementById('timestamp');
const footerYear   = document.getElementById('footerYear');

const DIAS_SEMANA = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function pad(n) { return String(n).padStart(2, '0'); }

function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}

function getDayOfYear(d) {
  const start = new Date(d.getFullYear(), 0, 0);
  const diff  = d - start;
  return Math.floor(diff / 86400000);
}

function getMoonPhase(d) {
  // Cálculo simplificado baseado no ciclo lunar de 29.53 dias
  const known = new Date(2000, 0, 6); // lua nova conhecida
  const diff  = (d - known) / 86400000;
  const cycle = ((diff % 29.53) + 29.53) % 29.53;
  if (cycle < 1.85)  return '🌑 Nova';
  if (cycle < 7.38)  return '🌒 Crescente';
  if (cycle < 9.22)  return '🌓 Quarto Crescente';
  if (cycle < 14.77) return '🌔 Gibosa Crescente';
  if (cycle < 16.61) return '🌕 Cheia';
  if (cycle < 22.15) return '🌖 Gibosa Minguante';
  if (cycle < 23.99) return '🌗 Quarto Minguante';
  if (cycle < 29.53) return '🌘 Minguante';
  return '🌑 Nova';
}

function getTimezone() {
  const offset = -(new Date().getTimezoneOffset());
  const h = Math.floor(Math.abs(offset) / 60);
  const m = Math.abs(offset) % 60;
  const sign = offset >= 0 ? '+' : '-';
  return `UTC${sign}${h}${m ? ':' + pad(m) : ''}`;
}

function updateClock() {
  const now = new Date();

  // ── Ponteiros analógicos ──
  const h   = now.getHours() % 12;
  const min = now.getMinutes();
  const sec = now.getSeconds();
  const ms  = now.getMilliseconds();

  const hourDeg   = (h / 12) * 360 + (min / 60) * 30;
  const minuteDeg = (min / 60) * 360 + (sec / 60) * 6;
  const secondDeg = (sec / 60) * 360 + (ms / 1000) * 6;

  hourHand.style.transform   = `rotate(${hourDeg}deg)`;
  minuteHand.style.transform = `rotate(${minuteDeg}deg)`;
  secondHand.style.transform = `rotate(${secondDeg}deg)`;

  // ── Hora digital ──
  const hours24 = now.getHours();
  const hours12 = hours24 % 12 || 12;
  hoursEl.textContent   = pad(hours12);
  minutesEl.textContent = pad(min);
  secondsEl.textContent = pad(sec);
  periodEl.textContent  = hours24 < 12 ? 'AM' : 'PM';
  timezoneEl.textContent = getTimezone();

  // ── Data ──
  weekdayEl.textContent  = DIAS_SEMANA[now.getDay()];
  fullDateEl.textContent = `${pad(now.getDate())} de ${MESES[now.getMonth()]} de ${now.getFullYear()}`;
  footerYear.textContent = now.getFullYear();

  // ── Progresso do dia ──
  const totalSecs = 24 * 3600;
  const elapsed   = hours24 * 3600 + min * 60 + sec;
  const pct       = (elapsed / totalSecs) * 100;
  progressFill.style.width = `${pct}%`;
  progressGlow.style.left  = `calc(${pct}% - 5px)`;
  dayPercentEl.textContent = `${pct.toFixed(1)}%`;

  // ── Cards ──
  weekNumberEl.textContent = `Semana ${getWeekNumber(now)}`;
  dayOfYearEl.textContent  = `Dia ${getDayOfYear(now)} / 365`;
  moonPhaseEl.textContent  = getMoonPhase(now);
  timestampEl.textContent  = Math.floor(now.getTime() / 1000);
}

updateClock();
setInterval(updateClock, 100);

/* =====================================================
   ABAS (Cronômetro / Timer)
   ===================================================== */
const tabs  = document.querySelectorAll('.tools-tab');
const panels = {
  stopwatch: document.getElementById('stopwatchPanel'),
  timer:     document.getElementById('timerPanel'),
};

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('tools-tab--active'));
    tab.classList.add('tools-tab--active');
    Object.values(panels).forEach(p => p.classList.add('hidden'));
    panels[tab.dataset.tab].classList.remove('hidden');
  });
});

/* =====================================================
   CRONÔMETRO
   ===================================================== */
const swDisplay   = document.getElementById('swDisplay');
const swStartStop = document.getElementById('swStartStop');
const swLap       = document.getElementById('swLap');
const swReset     = document.getElementById('swReset');
const lapsList    = document.getElementById('lapsList');

let swRunning  = false;
let swStart    = 0;
let swElapsed  = 0;
let swInterval = null;
let lapCount   = 0;
let lastLapTime = 0;

function formatSW(ms) {
  const totalMs  = Math.floor(ms);
  const centis   = Math.floor((totalMs % 1000) / 10);
  const secs     = Math.floor(totalMs / 1000) % 60;
  const mins     = Math.floor(totalMs / 60000) % 60;
  const hrs      = Math.floor(totalMs / 3600000);
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}.${pad(centis)}`;
}

swStartStop.addEventListener('click', () => {
  if (!swRunning) {
    swStart   = Date.now() - swElapsed;
    swInterval = setInterval(() => {
      swElapsed = Date.now() - swStart;
      swDisplay.textContent = formatSW(swElapsed);
    }, 10);
    swRunning = true;
    swStartStop.innerHTML = '<i data-lucide="pause"></i> Pausar';
    swStartStop.style.background = 'linear-gradient(135deg, #fb923c, #f97316)';
  } else {
    clearInterval(swInterval);
    swRunning = false;
    swStartStop.innerHTML = '<i data-lucide="play"></i> Continuar';
    swStartStop.style.background = '';
  }
  if (window.lucide) lucide.createIcons();
});

swLap.addEventListener('click', () => {
  if (!swRunning && swElapsed === 0) return;
  lapCount++;
  const lapTime  = swElapsed;
  const delta    = lapTime - lastLapTime;
  lastLapTime    = lapTime;

  const item = document.createElement('div');
  item.className = 'lap-item';
  item.innerHTML = `
    <span class="lap-item__num">Volta ${lapCount}</span>
    <span class="lap-item__time">${formatSW(lapTime)}</span>
    <span class="lap-item__delta">+${formatSW(delta)}</span>
  `;
  lapsList.prepend(item);
});

swReset.addEventListener('click', () => {
  clearInterval(swInterval);
  swRunning  = false;
  swElapsed  = 0;
  lapCount   = 0;
  lastLapTime = 0;
  swDisplay.textContent = '00:00:00.00';
  swStartStop.innerHTML = '<i data-lucide="play"></i> Iniciar';
  swStartStop.style.background = '';
  lapsList.innerHTML = '';
  if (window.lucide) lucide.createIcons();
});

/* =====================================================
   TIMER
   ===================================================== */
const timerDisplay   = document.getElementById('timerDisplay');
const timerStartStop = document.getElementById('timerStartStop');
const timerResetBtn  = document.getElementById('timerReset');
const timerAlert     = document.getElementById('timerAlert');
const timerHoursIn   = document.getElementById('timerHours');
const timerMinsIn    = document.getElementById('timerMinutes');
const timerSecsIn    = document.getElementById('timerSeconds');

let timerRunning  = false;
let timerRemaining = 0;
let timerInterval  = null;

function formatTimer(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function getTimerInput() {
  const h = parseInt(timerHoursIn.value) || 0;
  const m = parseInt(timerMinsIn.value)  || 0;
  const s = parseInt(timerSecsIn.value)  || 0;
  return h * 3600 + m * 60 + s;
}

timerStartStop.addEventListener('click', () => {
  if (!timerRunning) {
    if (timerRemaining === 0) {
      timerRemaining = getTimerInput();
      if (timerRemaining === 0) return;
    }
    timerInterval = setInterval(() => {
      timerRemaining--;
      timerDisplay.textContent = formatTimer(timerRemaining);

      if (timerRemaining <= 10) timerDisplay.classList.add('urgent');

      if (timerRemaining <= 0) {
        clearInterval(timerInterval);
        timerRunning = false;
        timerDisplay.classList.remove('urgent');
        timerAlert.classList.remove('hidden');
        timerStartStop.innerHTML = '<i data-lucide="play"></i> Iniciar';
        timerStartStop.style.background = '';
        if (window.lucide) lucide.createIcons();
        // Vibração (mobile)
        if (navigator.vibrate) navigator.vibrate([300, 100, 300]);
      }
    }, 1000);
    timerRunning = true;
    timerStartStop.innerHTML = '<i data-lucide="pause"></i> Pausar';
    timerStartStop.style.background = 'linear-gradient(135deg, #fb923c, #f97316)';
  } else {
    clearInterval(timerInterval);
    timerRunning = false;
    timerStartStop.innerHTML = '<i data-lucide="play"></i> Continuar';
    timerStartStop.style.background = '';
  }
  if (window.lucide) lucide.createIcons();
});

timerResetBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerRunning   = false;
  timerRemaining = 0;
  timerDisplay.textContent = '00:00:00';
  timerDisplay.classList.remove('urgent');
  timerAlert.classList.add('hidden');
  timerStartStop.innerHTML = '<i data-lucide="play"></i> Iniciar';
  timerStartStop.style.background = '';
  if (window.lucide) lucide.createIcons();
});

function dismissAlert() {
  timerAlert.classList.add('hidden');
  timerRemaining = 0;
  timerDisplay.textContent = '00:00:00';
}

// Atualizar display ao mudar inputs
[timerHoursIn, timerMinsIn, timerSecsIn].forEach(input => {
  input.addEventListener('input', () => {
    if (!timerRunning && timerRemaining === 0) {
      timerDisplay.textContent = formatTimer(getTimerInput());
    }
  });
});
