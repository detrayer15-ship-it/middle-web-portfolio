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
  // highlightNav();  // Заменена на Intersection Observer
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
const mobileNavLinks = document.querySelectorAll('.mobile-nav__item');
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
  });
  mobileNavLinks.forEach(a => {
    const isActive = a.getAttribute('href') === `#${current}`;
    a.classList.toggle('active', isActive);
  });
}

// ─── BURGER MENU ─────────────────────────────────────────────
const burger  = document.getElementById('burger');
const navList = document.getElementById('nav-list');

function closeMenu() {
  if (navList) navList.classList.remove('open');
  if (burger) {
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Открыть меню');
  }
  document.body.style.overflow = '';
}

if (burger && navList) {
  burger.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', isOpen);
    burger.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
}

navLinks.forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    const hash = link.getAttribute('href');
    const target = document.querySelector(hash);
    if (!target) return;
    closeMenu();
    history.pushState(null, '', hash);
    scrollToSection(target);
  });
});

mobileNavLinks.forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    const hash = link.getAttribute('href');
    const target = document.querySelector(hash);
    if (!target) return;
    history.pushState(null, '', hash);
    scrollToSection(target);
  });
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navList && navList.classList.contains('open')) {
    closeMenu();
    if (burger) burger.focus();
  }
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 768 && navList && navList.classList.contains('open')) {
    closeMenu();
  }
});

// ─── ARC SEMICIRCLE NAVIGATION (JARVIS HUD) ──────────────────
const arcNav = document.getElementById('arc-nav');
const arcNavCore = document.getElementById('arc-nav-core');
const arcNavRadials = document.getElementById('arc-nav-radials');

function drawArcRadials() {
  // No longer needed — side nav doesn't use SVG radials
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
    const angleDeg = link.style.getPropertyValue('--angle').trim();
    const radial = arcNavRadials?.querySelector(`line[data-angle="${angleDeg}"]`);
    if (radial) {
      radial.classList.add('is-active');
      radial.style.setProperty('--route-color', link.style.getPropertyValue('--route-color'));
    }
  });

  link.addEventListener('mouseleave', () => {
    const angleDeg = link.style.getPropertyValue('--angle').trim();
    const radial = arcNavRadials?.querySelector(`line[data-angle="${angleDeg}"]`);
    if (radial && !link.classList.contains('active')) radial.classList.remove('is-active');
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
  // Ensure links are visible
  arcNavLinks.forEach(link => {
    link.style.opacity = '1';
  });
  
  if (arcNav) arcNav.classList.add('is-ready');
  highlightNav();
}

initArcNav();
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

// ─── INTERSECTION OBSERVER — TRACK ACTIVE SECTION ───────────
// Отслеживает какой раздел находится в поле зрения и обновляет навигацию
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const sectionId = entry.target.id;
      
      // Обновляем все ссылки в навигациях
      navLinks.forEach(link => {
        const isActive = link.getAttribute('href') === `#${sectionId}`;
        link.classList.toggle('active', isActive);
      });
      
      arcNavLinks.forEach(link => {
        const isActive = link.getAttribute('href') === `#${sectionId}`;
        link.classList.toggle('active', isActive);

        if (isActive) {
          const hintLabel = document.getElementById('arc-indicator-text');
          if (hintLabel) {
            hintLabel.textContent = link.querySelector('.arc-nav__label')?.textContent?.trim() || link.textContent.trim();
            const routeColor = link.style.getPropertyValue('--route-color');
            hintLabel.style.color = routeColor;
            const dot = document.querySelector('.arc-nav__indicator-dot');
            if (dot) {
              dot.style.background = routeColor;
              dot.style.boxShadow = `0 0 10px ${routeColor}`;
            }
          }
        }
      });

      mobileNavLinks.forEach(link => {
        const isActive = link.getAttribute('href') === `#${sectionId}`;
        link.classList.toggle('active', isActive);
      });
    }
  });
}, { 
  threshold: 0,
  rootMargin: '-20% 0px -50% 0px'
});

// Наблюдаем за всеми секциями
sections.forEach(section => sectionObserver.observe(section));
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

// ─── RENDER: FACTS (tabs) ────────────────────────────────────
function renderFacts(facts) {
  const container = document.getElementById('facts-container');
  if (!container) return;
  if (!facts.length) { container.innerHTML = ''; return; }

  // Icons for each fact tab
  const icons = ['fa-code', 'fa-brain', 'fa-terminal', 'fa-globe'];

  const tabsHtml = facts.map((text, i) => `
    <button
      class="fact-tab${i === 0 ? ' active' : ''}"
      data-index="${i}"
      aria-selected="${i === 0}"
      role="tab"
      id="fact-tab-${i}"
      aria-controls="facts-panel"
    >
      <span class="fact-tab__num">ФАКТ ${i + 1}</span>
      <i class="fa-solid ${icons[i] || 'fa-star'}" aria-hidden="true"></i>
    </button>
  `).join('');

  container.innerHTML = `
    <div class="facts-tabs-row" role="tablist" aria-label="Факты обо мне">
      ${tabsHtml}
    </div>
    <div class="facts-panel glass-card" id="facts-panel" role="tabpanel" aria-labelledby="fact-tab-0">
      <div class="facts-panel__inner">
        <i class="fa-solid fa-lightbulb facts-panel__icon" aria-hidden="true"></i>
        <p class="facts-panel__text">${facts[0]}</p>
      </div>
      <div class="facts-panel__lines" aria-hidden="true">
        ${facts.map((_, i) => `<span class="facts-panel__line${i === 0 ? ' active' : ''}" data-index="${i}"></span>`).join('')}
      </div>
    </div>
  `;

  // Wire up tab clicks
  const tabs   = container.querySelectorAll('.fact-tab');
  const panelP = container.querySelector('.facts-panel__text');
  const panelI = container.querySelector('.facts-panel__icon');
  const lines  = container.querySelectorAll('.facts-panel__line');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const idx = Number(tab.dataset.index);

      // Update tab active state
      tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Update line indicators
      lines.forEach(l => l.classList.toggle('active', Number(l.dataset.index) === idx));

      // Animate panel text
      panelP.style.opacity = '0';
      panelP.style.transform = 'translateY(10px)';
      panelI.style.opacity = '0';
      setTimeout(() => {
        panelP.textContent = facts[idx];
        panelP.style.opacity = '1';
        panelP.style.transform = 'translateY(0)';
        panelI.style.opacity = '1';
      }, 200);
    });
  });
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

// ─── SPLASH SCREEN ───────────────────────────────────────────
(function initSplash() {
  const splash = document.getElementById('splash');
  const bar    = document.getElementById('splash-bar');
  if (!splash || !bar) return;

  // Animate progress bar 0 → 100% over ~1.2s using RAF
  let pct = 0;
  const DURATION = 1200; // ms
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    pct = Math.min(100, (elapsed / DURATION) * 100);
    bar.style.width = pct + '%';
    if (pct < 100) {
      requestAnimationFrame(tick);
    } else {
      // Small pause then fade out
      setTimeout(() => {
        splash.classList.add('hidden');
        // Remove from DOM after transition
        splash.addEventListener('transitionend', () => splash.remove(), { once: true });
      }, 200);
    }
  }

  requestAnimationFrame(tick);
})();

// ─── HAPTIC FEEDBACK (Vibration API) ─────────────────────────
// Tiny vibration on mobile nav tap for tactile feel
function haptic(pattern = [8]) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

mobileNavLinks.forEach(link => {
  link.addEventListener('pointerdown', () => haptic([6]));
});

// Also add haptic on arc-nav clicks on mobile
arcNavLinks.forEach(link => {
  link.addEventListener('pointerdown', () => haptic([4]));
});

// ─── PULL-TO-TOP GESTURE (Touch) ─────────────────────────────
(function initPullToTop() {
  const indicator = document.getElementById('pull-top');
  if (!indicator) return;

  let touchStartY = 0;
  let isPulling = false;
  const THRESHOLD = 80; // px of pull needed to trigger

  document.addEventListener('touchstart', e => {
    // Only trigger when already at the top of the page
    if (window.scrollY <= 0) {
      touchStartY = e.touches[0].clientY;
    } else {
      touchStartY = 0;
    }
  }, { passive: true });

  document.addEventListener('touchmove', e => {
    if (!touchStartY) return;
    const pullDist = e.touches[0].clientY - touchStartY;
    if (pullDist > 20 && !isPulling) {
      isPulling = true;
      indicator.classList.add('visible');
    }
  }, { passive: true });

  document.addEventListener('touchend', () => {
    if (!touchStartY) return;
    if (isPulling) {
      indicator.classList.remove('visible');
      isPulling = false;
      // Trigger scroll to top with haptic
      haptic([10, 30, 10]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    touchStartY = 0;
  }, { passive: true });
})();

