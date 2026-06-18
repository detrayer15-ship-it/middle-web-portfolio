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

// ─── CANVAS PARTICLES ────────────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W = canvas.width  = window.innerWidth;
  let H = canvas.height = window.innerHeight;

  const COUNT = Math.min(70, Math.floor(W * H / 14000));
  const particles = [];

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x:   Math.random() * W,
      y:   Math.random() * H,
      r:   Math.random() * 1.6 + 0.4,
      dx:  (Math.random() - 0.5) * 0.4,
      dy:  (Math.random() - 0.5) * 0.4,
      o:   Math.random() * 0.35 + 0.05,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100,255,218,${p.o})`;
      ctx.fill();

      // Connect nearby particles
      particles.forEach(q => {
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(100,255,218,${0.06 * (1 - d / 120)})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      });
    });
  }

  function tick() {
    particles.forEach(p => {
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });
    draw();
    requestAnimationFrame(tick);
  }

  tick();

  window.addEventListener('resize', () => {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  });
})();

// ─── TYPED.JS ────────────────────────────────────────────────
window.addEventListener('load', () => {
  if (typeof Typed !== 'undefined') {
    new Typed('.typing-text', {
      strings: [
        'Студент курса CapEducation',
        'Будущий разработчик',
        'Пишу на HTML / CSS / JS',
        'Изучаю Python и алгоритмы',
      ],
      typeSpeed:  48,
      backSpeed:  28,
      backDelay:  2000,
      loop:       true,
    });
  }
});

// ─── HEADER SCROLL EFFECT ────────────────────────────────────
const header = document.getElementById('header');
function onScroll() {
  header.classList.toggle('scrolled', window.scrollY > 50);
  // Scroll-to-top button
  scrollTopBtn.style.display = window.scrollY > 400 ? 'flex' : 'none';
  // Active nav link
  highlightNav();
}
window.addEventListener('scroll', onScroll, { passive: true });

// ─── ACTIVE NAV HIGHLIGHT ─────────────────────────────────────
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

function highlightNav() {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
  });
  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
  });
}

// ─── BURGER MENU ─────────────────────────────────────────────
const burger  = document.getElementById('burger');
const navList = document.getElementById('nav-list');

burger.addEventListener('click', () => {
  const isOpen = navList.classList.toggle('open');
  burger.classList.toggle('open', isOpen);
  burger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navList.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// ─── SCROLL-TO-TOP BUTTON ────────────────────────────────────
const scrollTopBtn = document.getElementById('scroll-top-btn');
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
    const mediaHtml = w.video
      ? `<video controls preload="metadata" aria-label="${w.title}">
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
