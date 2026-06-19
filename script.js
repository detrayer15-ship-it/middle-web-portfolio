/* ============================================================
   script.js — Портфолио Данияла | CapEducation Middle Web
   Все данные динамически загружаются через Fetch API из data.json
   ============================================================ */

'use strict';

// ─── HOBBY ICONS MAP ─────────────────────────────────────────
const HOBBY_ICONS = {
  'кодинг':          'fa-solid fa-code',
  'веб-разработка':  'fa-solid fa-globe',
  'математик':       'fa-solid fa-calculator',
  'алгоритм':        'fa-solid fa-brain',
  'ии':              'fa-solid fa-robot',
  'искусственный':   'fa-solid fa-robot',
  'ai':              'fa-solid fa-robot',
  'спортивн':        'fa-solid fa-trophy',
  'микро':           'fa-solid fa-microchip',
  'утилит':          'fa-solid fa-terminal',
  'генерац':         'fa-solid fa-image',
  'дизайн':          'fa-solid fa-pen-ruler',
};

function getHobbyIcon(text) {
  const lower = text.toLowerCase();
  for (const [key, icon] of Object.entries(HOBBY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return 'fa-solid fa-star';
}

// ─── CANVAS PARTICLES (оптимизированные) ─────────────────────
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSmallScreen = window.matchMedia('(max-width: 768px)').matches;

  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  if (reduceMotion || isSmallScreen) {
    canvas.hidden = true;
    return;
  }

  const COUNT = Math.min(24, Math.floor(W * H / 45000));
  const particles = [];

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x:   Math.random() * W,
      y:   Math.random() * H,
      r:   Math.random() * 1.4 + 0.4,
      dx:  (Math.random() - 0.5) * 0.3,
      dy:  (Math.random() - 0.5) * 0.3,
      o:   Math.random() * 0.25 + 0.05,
    });
  }

  const CONNECT_DIST = 90;
  const CONNECT_DIST_SQ = CONNECT_DIST * CONNECT_DIST;
  const FRAME_INTERVAL = 1000 / 30;
  let lastFrame = 0;
  let animationId = 0;

  function draw(time = 0) {
    animationId = requestAnimationFrame(draw);
    if (document.hidden || time - lastFrame < FRAME_INTERVAL) return;
    lastFrame = time;
    ctx.clearRect(0, 0, W, H);
    const isDark = document.body.classList.contains('dark-theme');
    const particleColor = isDark ? '100,255,218' : '37,99,235';

    // Двигаем частицы
    particles.forEach(p => {
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });

    // Рисуем линии между близкими (O(n²) но n маленький)
    ctx.lineWidth = 0.6;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dSq = dx * dx + dy * dy;
        if (dSq < CONNECT_DIST_SQ) {
          const alpha = 0.07 * (1 - Math.sqrt(dSq) / CONNECT_DIST);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(${particleColor},${alpha})`;
          ctx.stroke();
        }
      }
    }

    // Рисуем точки
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${particleColor},${p.o})`;
      ctx.fill();
    });

  }

  if (!reduceMotion) {
    animationId = requestAnimationFrame(draw);
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }, 150);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
      animationId = 0;
    } else if (!reduceMotion && !animationId) {
      animationId = requestAnimationFrame(draw);
    }
  });
})();

// ─── SCROLL PROGRESS BAR & HEADER SCROLL EFFECT ──────────────
const scrollProgress = document.createElement('div');
scrollProgress.className = 'scroll-progress-bar';
document.body.appendChild(scrollProgress);

const header = document.getElementById('header');
const scrollTopBtn = document.getElementById('scroll-top-btn');
let scrollTicking = false;

function onScroll() {
  header.classList.toggle('scrolled', window.scrollY > 50);
  scrollTopBtn.style.display = window.scrollY > 400 ? 'flex' : 'none';
  highlightNav();
  const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
  scrollProgress.style.width = `${Math.min(100, Math.max(0, pct))}%`;
  scrollTicking = false;
}

window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    scrollTicking = true;
    requestAnimationFrame(onScroll);
  }
}, { passive: true });

// ─── ACTIVE NAV HIGHLIGHT ─────────────────────────────────────
const navLinks = document.querySelectorAll('.nav-link');
const arcNavLinks = document.querySelectorAll('.arc-nav__link');
const sections = document.querySelectorAll('section[id]');

function highlightNav() {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
  });
  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
  });
  arcNavLinks.forEach(a => {
    const isActive = a.getAttribute('href') === `#${current}`;
    a.classList.toggle('active', isActive);
    const index = a.style.getPropertyValue('--i').trim();
    const tick = document.querySelector(`.arc-nav__ticks line[data-i="${index}"]`);
    if (tick) {
      tick.classList.toggle('is-active', isActive);
      tick.style.setProperty('--route-color', a.style.getPropertyValue('--route-color'));
    }
  });
}

// ─── BURGER MENU ─────────────────────────────────────────────
const burger  = document.getElementById('burger');
const navList = document.getElementById('nav-list');

function closeMenu() {
  navList.classList.remove('open');
  burger.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-label', 'Открыть меню');
  document.body.style.overflow = '';
}

burger.addEventListener('click', () => {
  const isOpen = navList.classList.toggle('open');
  burger.classList.toggle('open', isOpen);
  burger.setAttribute('aria-expanded', isOpen);
  burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

navLinks.forEach(link => {
  link.addEventListener('click', closeMenu);
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navList.classList.contains('open')) {
    closeMenu();
    burger.focus();
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 768 && navList.classList.contains('open')) {
    closeMenu();
  }
});

// ─── ARC SEMICIRCLE NAVIGATION (JARVIS HUD) ──────────────────
const arcNav = document.getElementById('arc-nav');
const arcNavCore = document.getElementById('arc-nav-core');
const arcNavTicks = document.getElementById('arc-nav-ticks');

function drawArcTicks() {
  if (!arcNavTicks) return;

  const hubX = 320;
  const hubY = 320;
  const tickRadius = 296;

  arcNavTicks.innerHTML = '';
  arcNavLinks.forEach(link => {
    const angleDeg = parseFloat(link.style.getPropertyValue('--angle'));
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = hubX + Math.cos(angleRad) * tickRadius;
    const y = hubY + Math.sin(angleRad) * tickRadius;
    const innerX = hubX + Math.cos(angleRad) * (tickRadius - 14);
    const innerY = hubY + Math.sin(angleRad) * (tickRadius - 14);
    const index = link.style.getPropertyValue('--i').trim();

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', String(innerX));
    line.setAttribute('y1', String(innerY));
    line.setAttribute('x2', String(x));
    line.setAttribute('y2', String(y));
    line.dataset.i = index;
    if (link.classList.contains('active')) {
      line.classList.add('is-active');
      line.style.setProperty('--route-color', link.style.getPropertyValue('--route-color'));
    }
    arcNavTicks.appendChild(line);
  });
}

function scrollToSection(target) {
  const headerHeight = header ? header.offsetHeight : 0;
  const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
  window.scrollTo({ top, behavior: 'smooth' });
  window.setTimeout(() => {
    window.scrollTo({ top, behavior: 'auto' });
    highlightNav();
  }, 800);
}

arcNavLinks.forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();

    const hash = link.getAttribute('href');
    const target = document.querySelector(hash);
    if (!target) return;

    history.pushState(null, '', hash);
    scrollToSection(target);
  });

  link.addEventListener('mouseenter', () => {
    const index = link.style.getPropertyValue('--i').trim();
    const tick = arcNavTicks?.querySelector(`line[data-i="${index}"]`);
    if (tick) {
      tick.classList.add('is-active');
      tick.style.setProperty('--route-color', link.style.getPropertyValue('--route-color'));
    }
  });

  link.addEventListener('mouseleave', () => {
    const index = link.style.getPropertyValue('--i').trim();
    const tick = arcNavTicks?.querySelector(`line[data-i="${index}"]`);
    if (tick && !link.classList.contains('active')) tick.classList.remove('is-active');
  });
});

if (arcNavCore) {
  arcNavCore.addEventListener('click', () => {
    arcNavCore.classList.remove('is-pulse');
    void arcNavCore.offsetWidth;
    arcNavCore.classList.add('is-pulse');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initArcNav() {
  drawArcTicks();
  if (arcNav) arcNav.classList.add('is-ready');
  highlightNav();
}

initArcNav();
window.addEventListener('resize', drawArcTicks);
onScroll();

// ─── SCROLL-TO-TOP BUTTON ────────────────────────────────────
scrollTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ─── REVEAL ON SCROLL ────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Animate skill bars when visible
      const fills = entry.target.querySelectorAll('.skill-fill[data-pct]');
      fills.forEach(f => {
        setTimeout(() => { f.style.width = f.dataset.pct + '%'; }, 100);
      });
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

function observeReveal() {
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}
observeReveal();

function restoreAnchorPosition() {
  if (!window.location.hash) return;

  const target = document.getElementById(window.location.hash.slice(1));
  if (!target) return;

  const scrollToTarget = () => {
    const headerHeight = header ? header.offsetHeight : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
    window.scrollTo({ top, behavior: 'auto' });
    onScroll();
  };

  requestAnimationFrame(scrollToTarget);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(scrollToTarget);
  }

  if (document.readyState !== 'complete') {
    window.addEventListener('load', scrollToTarget, { once: true });
  }
}

// ─── FETCH API — LOAD data.json ───────────────────────────────
fetch('data.json')
  .then(res => {
    if (!res.ok) throw new Error('Не удалось загрузить data.json');
    return res.json();
  })
  .then(data => {
    renderFacts(data.facts || []);
    renderPointA(data.pointA || []);
    renderPointB(data.pointB || []);
    renderSkills(data.progress || []);
    renderHobbies(data.hobbies || []);
    renderProjects(data.works || []);

    // After rendering, observe new .reveal elements
    observeReveal();
    restoreAnchorPosition();
  })
  .catch(err => {
    console.error('Fetch error:', err);
    // Fallback: show static content hints
    document.querySelectorAll('.facts-loading, .hobby-loading, .skill-loading, .projects-loading, .loading-item')
      .forEach(el => {
        el.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Запустите через Live Server для загрузки данных';
      });
  });

// ─── RENDER: FACTS ───────────────────────────────────────────
function renderFacts(facts) {
  const container = document.getElementById('facts-container');
  if (!container) return;
  if (!facts.length) { container.innerHTML = ''; return; }

  container.innerHTML = facts.map(text => `
    <div class="fact-item reveal">
      <i class="fa-solid fa-lightbulb"></i>
      <span>${text}</span>
    </div>
  `).join('');
}

// ─── RENDER: POINT A ─────────────────────────────────────────
function renderPointA(items) {
  const list = document.getElementById('point-a-list');
  if (!list) return;
  list.innerHTML = items.map(t => `<li>${t}</li>`).join('');
}

// ─── RENDER: POINT B ─────────────────────────────────────────
function renderPointB(items) {
  const list = document.getElementById('point-b-list');
  if (!list) return;
  list.innerHTML = items.map(t => `<li>${t}</li>`).join('');
}

// ─── RENDER: SKILLS (Progress bars) ──────────────────────────
function renderSkills(skills) {
  const container = document.getElementById('skills-list');
  if (!container) return;
  if (!skills.length) { container.innerHTML = ''; return; }

  container.innerHTML = skills.map(s => `
    <div class="skill-item reveal">
      <div class="skill-header">
        <span class="skill-name">${s.name}</span>
        <span class="skill-percent">${s.percent}%</span>
      </div>
      <div class="skill-bar">
        <div class="skill-fill" data-pct="${s.percent}" style="width:0"></div>
      </div>
    </div>
  `).join('');
}

// ─── RENDER: HOBBIES ─────────────────────────────────────────
function renderHobbies(hobbies) {
  const container = document.getElementById('hobbies-container');
  if (!container) return;
  if (!hobbies.length) { container.innerHTML = ''; return; }

  container.innerHTML = hobbies.map(h => `
    <div class="hobby-tag reveal">
      <i class="${getHobbyIcon(h)}"></i>
      <span>${h}</span>
    </div>
  `).join('');
}

// ─── RENDER: PROJECTS ────────────────────────────────────────
function renderProjects(works) {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  if (!works.length) { grid.innerHTML = '<p style="color:var(--muted);text-align:center">Проекты не найдены.</p>'; return; }

  grid.innerHTML = works.map(w => {
    const tagsHtml = (w.tags || []).map(t => `<span>${t}</span>`).join('');
    const posterAttr = w.poster ? ` poster="${w.poster}"` : '';
    const mediaHtml = w.video
      ? `<video controls preload="none" playsinline${posterAttr} aria-label="${w.title}">
           <source src="${w.video}" type="video/mp4">
           Ваш браузер не поддерживает видео.
         </video>`
      : `<div class="project-media-placeholder">
           <i class="fa-solid fa-photo-film"></i>
           <span>Видео скоро появится</span>
         </div>`;

    return `
      <article class="project-card glass-card reveal">
        <div class="project-media">${mediaHtml}</div>
        <div class="project-body">
          <div class="project-icon-wrap"><i class="fa-solid fa-code"></i></div>
          <h3>${w.title}</h3>
          <p>${w.description}</p>
          <div class="project-tags">${tagsHtml}</div>
        </div>
      </article>
    `;
  }).join('');
}

// ─── THEME SWITCHER ──────────────────────────────────────────
(function initThemeSwitcher() {
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');

  function syncTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      if (themeIcon) themeIcon.className = 'fa-solid fa-sun';
    } else {
      document.body.classList.remove('dark-theme');
      if (themeIcon) themeIcon.className = 'fa-solid fa-moon';
    }
  }

  // Set default theme to light if none saved
  const savedTheme = localStorage.getItem('portfolio-theme') || 'light';
  syncTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.body.classList.contains('dark-theme');
      const newTheme = isDark ? 'light' : 'dark';
      localStorage.setItem('portfolio-theme', newTheme);
      syncTheme(newTheme);
    });
  }
})();
