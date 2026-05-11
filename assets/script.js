/* ══════════════════════════════════════════════════════
   script.js — reads ALL data from config.js
   Theme · Cursor · Canvas · Top Nav · Tilt · Glow
   Typed · Counters · Reveal · Projects · Repos
   ══════════════════════════════════════════════════════ */
'use strict';

/* ────────────────────────────────────────────────────
   0. HELPER: parse and cache an image check
   ──────────────────────────────────────────────────── */
const imgCache = {};
function imageExists(src) {
  if (src in imgCache) return Promise.resolve(imgCache[src]);
  return new Promise(res => {
    const i = new Image();
    i.onload = () => { imgCache[src] = true; res(true); };
    i.onerror = () => { imgCache[src] = false; res(false); };
    i.src = src;
  });
}

function slugify(s) {
  return (s || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/* ────────────────────────────────────────────────────
   1. THEME SYSTEM  (reads system pref by default)
   ──────────────────────────────────────────────────── */
const THEME_KEY = 'rg_theme_v3';

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  const isDark = theme === 'dark';

  ['themeIcon'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
  });

  if (window._bgCanvas) window._bgCanvas.updateTheme(isDark);
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  applyTheme(saved || getSystemTheme());

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem(THEME_KEY)) applyTheme(e.matches ? 'dark' : 'light');
  });

  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  });
}

/* ────────────────────────────────────────────────────
   2. CUSTOM CURSOR  (faster — 28% lag instead of 14%)
   ──────────────────────────────────────────────────── */
function initCursor() {
  // Custom cursor removed — using default browser cursor
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (dot) dot.style.display = 'none';
  if (ring) ring.style.display = 'none';
}

/* ────────────────────────────────────────────────────
   3. CANVAS — node network, brighter dots & connections
   ──────────────────────────────────────────────────── */
function initCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  let W, H, nodes = [];

  const N = 60;             // node count
  const DIST = 170;         // max connection distance
  const DOT_ALPHA_DARK = 0.6;
  const DOT_ALPHA_LIGHT = 0.45;
  const LINE_ALPHA_MAX_DARK = 0.28;
  const LINE_ALPHA_MAX_LIGHT = 0.18;

  function mkNode() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .45, vy: (Math.random() - .5) * .45,
      r: Math.random() * 2 + .8,
    };
  }

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    nodes = Array.from({ length: N }, mkNode);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const aRGB = isDark ? '0,232,122' : '99,102,241';
    const dotA = isDark ? DOT_ALPHA_DARK : DOT_ALPHA_LIGHT;
    const lineMax = isDark ? LINE_ALPHA_MAX_DARK : LINE_ALPHA_MAX_LIGHT;

    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    });

    // Connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < DIST) {
          ctx.strokeStyle = `rgba(${aRGB},${(1 - d / DIST) * lineMax})`;
          ctx.lineWidth = .9;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Dots
    nodes.forEach(n => {
      ctx.fillStyle = `rgba(${aRGB},${dotA})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  resize(); draw();

  window._bgCanvas = { updateTheme: d => { isDark = d; } };
}

/* ────────────────────────────────────────────────────
   4. FLOATING TOP NAV  (desktop pills built from config)
   ──────────────────────────────────────────────────── */
function buildTopNav() {
  const pillsEl = document.getElementById('topnavPills');
  if (!pillsEl) return;

  // Update logo avatar from config
  const logoAv = document.getElementById('logoAvatar');
  if (logoAv && CONFIG_PERSONAL.avatar) logoAv.src = CONFIG_PERSONAL.avatar;

  // Desktop pills only
  CONFIG_NAV.forEach((item, i) => {
    const btn = document.createElement('button');
    btn.className = 'topnav-pill' + (i === 0 ? ' active' : '');
    btn.dataset.section = item.id;
    btn.textContent = item.label;
    btn.addEventListener('click', () => switchSection(item.id));
    pillsEl.appendChild(btn);
  });

  // Scroll: add .scrolled class to topnav
  const nav = document.getElementById('topnav');
  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

/* ────────────────────────────────────────────────────
   4b. MOBILE VIEW SWITCHING
   About = stacked about+resume+contact
   Projects = projects section with sub-toggle
   ──────────────────────────────────────────────────── */
function isMobile() {
  return window.matchMedia('(max-width:768px)').matches;
}

function switchMobileView(view) {
  // Update pill active state
  document.getElementById('m2About')?.classList.toggle('active', view === 'about');
  document.getElementById('m2Projects')?.classList.toggle('active', view === 'projects');
  document.getElementById('m2Contact')?.classList.toggle('active', view === 'contact');

  // Set data attribute on main-content — CSS handles show/hide via selectors
  const main = document.getElementById('mainContent');
  if (main) main.setAttribute('data-mobile', view);

  if (view === 'about') { animateSkillBars(); setTimeout(initReveal, 60); }
  if (view === 'projects') { setTimeout(initReveal, 60); }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.switchMobileView = switchMobileView;

/* ────────────────────────────────────────────────────
   4c. MOBILE PROJECTS SUB-TOGGLE (Projects ↔ Repos)
   ──────────────────────────────────────────────────── */
function switchMobileProj(view) {
  document.getElementById('mptProjects')?.classList.toggle('active', view === 'projects');
  document.getElementById('mptRepos')?.classList.toggle('active', view === 'repos');

  const projView = document.getElementById('projView');
  const reposView = document.getElementById('reposMobileView');

  if (projView) projView.style.display = (view === 'projects') ? '' : 'none';
  if (reposView) reposView.style.display = (view === 'repos') ? '' : 'none';

  // Lazy-load repos once
  if (view === 'repos' && !window._mobileReposLoaded) {
    window._mobileReposLoaded = true;
    renderReposMobile();
  }
}
window.switchMobileProj = switchMobileProj;

/* ────────────────────────────────────────────────────
   5. SECTION SWITCHING  (desktop only)
      On mobile, switchMobileView handles visibility.
   ──────────────────────────────────────────────────── */
function switchSection(id) {
  // On mobile, delegate to mobile view
  if (isMobile()) {
    if (['about', 'resume'].includes(id)) return switchMobileView('about');
    if (['projects', 'mywork'].includes(id)) return switchMobileView('projects');
    if (id === 'contact') return switchMobileView('contact');
  }

  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.topnav-pill').forEach(b => b.classList.remove('active'));

  const sec = document.getElementById(id);
  if (sec) sec.classList.add('active');
  document.querySelectorAll(`[data-section="${id}"]`).forEach(b => b.classList.add('active'));

  if (id === 'resume') animateSkillBars();
  if (id === 'mywork' && !window._reposLoaded) { window._reposLoaded = true; renderRepos(); }

  // Re-trigger reveal animations for newly visible elements
  setTimeout(initReveal, 60);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.switchSection = switchSection;

/* ────────────────────────────────────────────────────
   6. HERO PARALLAX (card tilts with mouse in hero)
   ──────────────────────────────────────────────────── */
function initParallax() {
  const hero = document.getElementById('heroBanner');
  const card = document.getElementById('heroCard');
  if (!hero || !card) return;
  if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;

  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) / (r.width / 2);
    const y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
    card.style.transform = `perspective(800px) rotateX(${y * -8}deg) rotateY(${x * 10}deg) translateZ(18px)`;
  });

  hero.addEventListener('mouseleave', () => {
    card.style.transition = 'transform .6s ease';
    card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateZ(0)';
    setTimeout(() => (card.style.transition = ''), 600);
  });
}

/* ────────────────────────────────────────────────────
   7. SERVICE CARD GLOW  — properly tracks mouse per-card
   ──────────────────────────────────────────────────── */
function initServiceGlow() {
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--gx', x + 'px');
      card.style.setProperty('--gy', y + 'px');
    });
  });
}

/* ────────────────────────────────────────────────────
   8. 3D CARD TILT  (project cards + hero card)
      Re-runs after renderProjects adds new DOM nodes.
   ──────────────────────────────────────────────────── */
function initTilt(scope) {
  if (!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  const root = scope || document;

  root.querySelectorAll('.tilt-target').forEach(card => {
    // Remove old listener to avoid duplicates
    card._onTiltMove && card.removeEventListener('mousemove', card._onTiltMove);
    card._onTiltLeave && card.removeEventListener('mouseleave', card._onTiltLeave);

    card._onTiltMove = e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(600px) rotateX(${-y * 8}deg) rotateY(${x * 10}deg) scale(1.02)`;
    };
    card._onTiltLeave = () => {
      card.style.transition = 'transform .4s ease';
      card.style.transform = 'perspective(600px) rotateX(0) rotateY(0) scale(1)';
      setTimeout(() => (card.style.transition = ''), 400);
    };

    card.addEventListener('mousemove', card._onTiltMove);
    card.addEventListener('mouseleave', card._onTiltLeave);
  });
}

/* ────────────────────────────────────────────────────
   9. TYPED ROLE
   ──────────────────────────────────────────────────── */
function initTyped() {
  const el = document.getElementById('typedRole');
  if (!el) return;
  const roles = CONFIG_PERSONAL.roles || ['AI/ML Engineer'];
  let ri = 0, ci = 0, del = false;

  function tick() {
    const word = roles[ri];
    el.textContent = del ? word.slice(0, --ci) : word.slice(0, ++ci);
    if (!del && ci === word.length) { del = true; setTimeout(tick, 1800); return; }
    if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; }
    setTimeout(tick, del ? 48 : 82);
  }
  setTimeout(tick, 600);
}

/* ────────────────────────────────────────────────────
   10. STAT COUNTERS
   ──────────────────────────────────────────────────── */
function initCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      obs.unobserve(e.target);
      const target = +e.target.dataset.target;
      let n = 0; const step = Math.ceil(target / 45);
      const t = setInterval(() => { n = Math.min(n + step, target); e.target.textContent = n; if (n >= target) clearInterval(t); }, 28);
    });
  }, { threshold: .5 });
  document.querySelectorAll('.stat-num').forEach(el => obs.observe(el));
}

/* ────────────────────────────────────────────────────
   11. SCROLL REVEAL
   ──────────────────────────────────────────────────── */
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = (i % 4) * .08 + 's';
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: .1 });
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => obs.observe(el));
}

/* ────────────────────────────────────────────────────
   12. SKILL BARS
   ──────────────────────────────────────────────────── */
let skillsDone = false;
function animateSkillBars() {
  if (skillsDone) return;
  skillsDone = true;
  document.querySelectorAll('.skill-fill').forEach(el => {
    requestAnimationFrame(() => { el.style.width = el.dataset.width + '%'; });
  });
}

/* ────────────────────────────────────────────────────
   13. BUILD SIDEBAR FROM CONFIG
   ──────────────────────────────────────────────────── */
function buildSidebar() {
  // Avatar
  const img = document.getElementById('avatarImg');
  if (img) img.src = CONFIG_PERSONAL.avatar;

  // Name & location
  const nm = document.getElementById('profileName');
  if (nm) nm.textContent = CONFIG_PERSONAL.name;

  const loc = document.getElementById('profileLocation');
  if (loc) loc.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${CONFIG_PERSONAL.location}`;

  // Contact nav
  const cNav = document.getElementById('contactNav');
  if (cNav) {
    const rows = [
      { icon: 'fas fa-envelope', val: CONFIG_PERSONAL.email, href: `mailto:${CONFIG_PERSONAL.email}` },
      { icon: 'fas fa-phone', val: CONFIG_PERSONAL.phone, href: `tel:${CONFIG_PERSONAL.phone}` },
      { icon: 'fas fa-globe', val: CONFIG_PERSONAL.website, href: CONFIG_PERSONAL.website },
    ];
    cNav.innerHTML = rows.map(r => {
      const tag = r.href ? `<a href="${r.href}" ${r.href.startsWith('http') ? 'target="_blank" rel="noopener"' : ''} class="contact-row">`
        : `<div class="contact-row no-link">`;
      const end = r.href ? '</a>' : '</div>';
      return `${tag}<span class="contact-icon"><i class="${r.icon}"></i></span><span class="contact-value">${r.val}</span>${end}`;
    }).join('');
  }

  // Socials
  const sr = document.getElementById('socialsRow');
  if (sr) {
    sr.innerHTML = CONFIG_SOCIALS.map(s =>
      `<a href="${s.url}" target="_blank" rel="noopener" class="social-pill" title="${s.label}"><i class="${s.icon}"></i></a>`
    ).join('');
  }
}

/* ────────────────────────────────────────────────────
   14. ABOUT: stats + services
   ──────────────────────────────────────────────────── */
function buildAbout() {
  // Stats
  const sr = document.getElementById('statsRow');
  if (sr) {
    sr.innerHTML = CONFIG_STATS.map(s =>
      `<div class="stat-card">
         <div class="stat-value-row">
           <span class="stat-num" data-target="${s.value}">0</span><span class="stat-plus">${s.suffix}</span>
         </div>
         <span class="stat-label">${s.label}</span>
       </div>`
    ).join('');
    initCounters(); // observe newly added counters
  }

  // Services
  const sg = document.getElementById('servicesGrid');
  if (sg) {
    sg.innerHTML = CONFIG_SERVICES.map(s =>
      `<div class="service-card">
         <div class="service-glow"></div>
         <div class="service-icon-wrap"><i class="${s.icon}"></i></div>
         <h4>${s.title}</h4>
         <p>${s.desc}</p>
       </div>`
    ).join('');
    initServiceGlow(); // attach per-card mousemove for glow
  }
}

/* ────────────────────────────────────────────────────
   15. RESUME: timeline, skills, tech stack
   ──────────────────────────────────────────────────── */
function buildResume() {
  function tlHtml(items) {
    return items.map(t =>
      `<li class="tl-item">
         <div class="tl-dot"></div>
         <div class="tl-content">
           <span class="tl-date">${t.date}</span>
           <strong>${t.title}</strong>
           <p>${t.body}</p>
         </div>
       </li>`
    ).join('');
  }

  const edu = document.getElementById('educationList');
  if (edu) edu.innerHTML = tlHtml(CONFIG_EDUCATION);

  const exp = document.getElementById('experienceList');
  if (exp) exp.innerHTML = tlHtml(CONFIG_EXPERIENCE);

  // Skills
  const sg = document.getElementById('skillsGrid');
  if (sg) {
    sg.innerHTML = CONFIG_SKILLS.map(group =>
      `<div class="skill-group">
         <span class="skill-group-label">${group.group}</span>
         ${group.items.map(sk =>
        `<div class="skill-row">
              <div class="skill-meta-row"><span>${sk.name}</span><span class="skill-pct">${sk.width}%</span></div>
              <div class="skill-track"><div class="skill-fill" data-width="${sk.width}"></div></div>
            </div>`
      ).join('')}
       </div>`
    ).join('');
  }

  // Tech stack
  const tg = document.getElementById('techStackGroups');
  if (tg) {
    tg.innerHTML = CONFIG_TECH_STACK.map(g =>
      `<div class="tech-group">
         <span class="tech-group-label">${g.group}</span>
         <div class="tech-chips">${g.chips.map(c => `<span class="chip">${c}</span>`).join('')}</div>
       </div>`
    ).join('');
  }
}

/* ────────────────────────────────────────────────────
   16. PROJECTS  (reads CONFIG_PROJECTS)
   ──────────────────────────────────────────────────── */
function buildProjectFilters() {
  const bar = document.getElementById('projectFilterBar');
  if (!bar) return;

  const cats = [...new Set(CONFIG_PROJECTS.map(p => p.category))];

  const all = document.createElement('button');
  all.className = 'filter-btn active'; all.dataset.filter = 'all'; all.textContent = 'All';
  bar.appendChild(all);

  cats.forEach(cat => {
    const b = document.createElement('button');
    b.className = 'filter-btn'; b.dataset.filter = slugify(cat); b.textContent = cat;
    bar.appendChild(b);
  });

  bar.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    document.querySelectorAll('.proj-card').forEach(c => {
      c.style.display = (f === 'all' || c.dataset.category === f) ? '' : 'none';
    });
  });
}

async function renderProjects() {
  const grid = document.getElementById('myProjectsGrid');
  if (!grid) return;

  const cards = await Promise.all(CONFIG_PROJECTS.map(async p => {
    const path = `assets/images/${p.cover}`;
    const hasImg = p.cover ? await imageExists(path) : false;

    const thumbHtml = hasImg
      ? `<img src="${path}" alt="${p.name}" loading="lazy">`
      : `<div class="proj-thumb-icon"><i class="${p.icon}"></i></div>`;

    const ghBtn = p.github
      ? `<a href="${p.github}" target="_blank" rel="noopener" class="proj-btn github" onclick="event.stopPropagation()">
           <i class="fab fa-github"></i> GitHub
         </a>`
      : '';

    const demoBtn = p.demo
      ? `<a href="${p.demo}" target="_blank" rel="noopener" class="proj-btn demo" onclick="event.stopPropagation()">
           <i class="fas fa-rocket"></i> Try it
         </a>`
      : '';

    return `
      <article class="proj-card" data-category="${slugify(p.category)}"
        ${p.github ? `onclick="window.open('${p.github}','_blank','noopener')"` : ''} >
        <div class="proj-thumb">
          ${thumbHtml}
          <span class="proj-cat-badge">${p.category}</span>
        </div>
        <div class="proj-body">
          <div class="proj-name">${p.name}</div>
          <p class="proj-desc">${p.description || ''}</p>
          <div class="proj-actions">${ghBtn}${demoBtn}</div>
        </div>
      </article>`;
  }));

  grid.innerHTML = cards.join('');
  initTilt(grid); // tilt on new cards
}

/* ────────────────────────────────────────────────────
   17. GITHUB REPOS  (cached)
   ──────────────────────────────────────────────────── */
const GH_CACHE_K = 'rg_repos_v3';
const GH_TTL = 60 * 60 * 1000;

const LANG_ICONS = {
  Python: 'fab fa-python', JavaScript: 'fab fa-js', TypeScript: 'fab fa-js',
  HTML: 'fab fa-html5', CSS: 'fab fa-css3-alt', Java: 'fab fa-java',
  'Jupyter Notebook': 'fas fa-book-open', 'C++': 'fas fa-code', C: 'fas fa-code',
};

async function fetchRepos() {
  try {
    const raw = localStorage.getItem(GH_CACHE_K);
    if (raw) { const { ts, data } = JSON.parse(raw); if (Date.now() - ts < GH_TTL) return data; }
  } catch (_) { }

  const user = CONFIG_GITHUB_USER || 'kartikbhai23';
  const res = await fetch(`https://api.github.com/users/${user}/repos?per_page=100&sort=updated`);
  if (!res.ok) throw new Error(`GH ${res.status}`);
  const data = await res.json();
  try { localStorage.setItem(GH_CACHE_K, JSON.stringify({ ts: Date.now(), data })); } catch (_) { }
  return data;
}

async function renderRepos() {
  const grid = document.getElementById('reposGrid');
  if (!grid) return;

  grid.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-2);">
      <i class="fas fa-circle-notch fa-spin" style="font-size:1.5rem;color:var(--accent);"></i>
      <p style="margin-top:1rem;font-size:.88rem;">Loading repositories…</p>
    </div>`;

  try {
    const repos = await fetchRepos();
    repos.sort((a, b) => (b.stargazers_count - a.stargazers_count) || a.name.localeCompare(b.name));
    grid.innerHTML = repos.map(r => `
      <article class="repo-card">
        <div class="repo-icon"><i class="${LANG_ICONS[r.language] || 'fab fa-github'}"></i></div>
        <div class="repo-body">
          <div class="repo-lang">${r.language || 'Repo'}</div>
          <a href="${r.html_url}" target="_blank" rel="noopener" class="repo-name">${r.name}</a>
          ${r.description ? `<p class="repo-desc">${r.description}</p>` : ''}
          <div class="repo-stats">
            <span><i class="fas fa-star"></i> ${r.stargazers_count}</span>
            <span><i class="fas fa-code-fork"></i> ${r.forks_count}</span>
          </div>
        </div>
      </article>`).join('');
  } catch (_) {
    const u = CONFIG_GITHUB_USER || 'kartikbhai23';
    grid.innerHTML = `
      <div style="text-align:center;padding:3rem;color:var(--text-2);">
        <i class="fas fa-triangle-exclamation" style="font-size:1.5rem;color:#ff6b6b;"></i>
        <p style="margin-top:1rem;">Could not load repos.
          <a href="https://github.com/${u}" target="_blank" style="color:var(--accent);">View on GitHub →</a></p>
      </div>`;
  }
}

/* ────────────────────────────────────────────────────
   18. CONTACT
   ──────────────────────────────────────────────────── */
function buildContact() {
  // Info card
  const card = document.getElementById('contactInfoCard');
  if (card) {
    const rows = [
      { icon: 'fas fa-envelope', val: CONFIG_PERSONAL.email, href: `mailto:${CONFIG_PERSONAL.email}`, lbl: 'Email' },
      { icon: 'fas fa-globe', val: CONFIG_PERSONAL.website, href: CONFIG_PERSONAL.website, lbl: 'Website' },
      { icon: 'fab fa-linkedin-in', val: 'Kartik Pandey', href: 'https://www.linkedin.com/in/kartik-pandey2324', lbl: 'LinkedIn' },
      //{ icon: 'fab fa-x-twitter', val: '@KartikPandey', href: 'https://twitter.com/RajNGaurav', lbl: 'Twitter' },
    ];
    card.innerHTML = rows.map(r =>
      `<a href="${r.href}" target="_blank" rel="noopener" class="contact-info-row">
         <span class="ci-icon"><i class="${r.icon}"></i></span>
         <div><span class="ci-label">${r.lbl}</span><span class="ci-value">${r.val}</span></div>
       </a>`
    ).join('');
  }

  // Map
  const frame = document.getElementById('mapFrame');
  if (frame && CONFIG_MAP_URL) frame.src = CONFIG_MAP_URL;

  // Form → opens Gmail compose
  const form = document.getElementById('contactForm');
  const btn = document.getElementById('submitBtn');
  if (form && btn) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      const name = document.getElementById('cName')?.value.trim() || '';
      const email = document.getElementById('cEmail')?.value.trim() || '';
      const message = document.getElementById('cMessage')?.value.trim() || '';

      if (!name || !email || !message) return;

      const firstName = name.split(' ')[0];
      const subject = encodeURIComponent(`Connection - ${firstName}`);
      const body = encodeURIComponent(
        `Hi Kartik,\n\n${message}\n\n---\nFrom: ${name}\nEmail: ${email}`
      );
      const to = encodeURIComponent(CONFIG_PERSONAL.email);

      const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${to}&su=${subject}&body=${body}`;
      window.open(gmailUrl, '_blank', 'noopener');

      // Visual feedback
      const orig = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check"></i> Opening Gmail…';
      btn.disabled = true; btn.style.opacity = '.8';
      setTimeout(() => {
        btn.innerHTML = orig; btn.disabled = false; btn.style.opacity = '';
        form.reset();
      }, 2500);
    });
  }
}

/* ────────────────────────────────────────────────────
   18b. MOBILE REPO RENDER (for Projects ➔ Repos toggle)
   ──────────────────────────────────────────────────── */
async function renderReposMobile() {
  const grid = document.getElementById('reposGridMobile');
  if (!grid) return;

  grid.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--text-2);">
    <i class="fas fa-circle-notch fa-spin" style="font-size:1.5rem;color:var(--accent);"></i>
    <p style="margin-top:1rem;font-size:.88rem;">Loading repositories…</p>
  </div>`;

  try {
    const repos = await fetchRepos();
    repos.sort((a, b) => (b.stargazers_count - a.stargazers_count) || a.name.localeCompare(b.name));
    grid.innerHTML = repos.map(r => `
      <article class="repo-card">
        <div class="repo-icon"><i class="${LANG_ICONS[r.language] || 'fab fa-github'}"></i></div>
        <div class="repo-body">
          <div class="repo-lang">${r.language || 'Repo'}</div>
          <a href="${r.html_url}" target="_blank" rel="noopener" class="repo-name">${r.name}</a>
          ${r.description ? `<p class="repo-desc">${r.description}</p>` : ''}
          <div class="repo-stats">
            <span><i class="fas fa-star"></i> ${r.stargazers_count}</span>
            <span><i class="fas fa-code-fork"></i> ${r.forks_count}</span>
          </div>
        </div>
      </article>`).join('');
  } catch (_) {
    const u = CONFIG_GITHUB_USER || 'kartikbhai23';
    grid.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--text-2);">
      <i class="fas fa-triangle-exclamation" style="font-size:1.5rem;color:#ff6b6b;"></i>
      <p style="margin-top:1rem;">Could not load repos.
        <a href="https://github.com/${u}" target="_blank" style="color:var(--accent);">View on GitHub →</a></p>
    </div>`;
  }
}

/* ────────────────────────────────────────────────────
   19. TOUCH TILT (mobile gesture)
   ──────────────────────────────────────────────────── */
function initTouchTilt() {
  document.querySelectorAll('.tilt-target').forEach(card => {
    card.addEventListener('touchmove', e => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0], r = card.getBoundingClientRect();
      const x = (t.clientX - r.left) / r.width - .5;
      const y = (t.clientY - r.top) / r.height - .5;
      card.style.transform = `perspective(600px) rotateX(${-y * 6}deg) rotateY(${x * 8}deg) scale(1.01)`;
    }, { passive: true });
    card.addEventListener('touchend', () => {
      card.style.transition = 'transform .4s ease';
      card.style.transform = 'perspective(600px) rotateX(0) rotateY(0) scale(1)';
      setTimeout(() => (card.style.transition = ''), 400);
    });
  });
}

/* ────────────────────────────────────────────────────
   20. BOOT
   ──────────────────────────────────────────────────── */
// Theme initialises synchronously to avoid flash
initTheme();

document.addEventListener('DOMContentLoaded', () => {
  // Build dynamic content from config
  buildSidebar();
  buildAbout();
  buildResume();
  buildContact();
  buildTopNav();
  buildProjectFilters();
  renderProjects();

  // Interactions
  initCanvas();
  initCursor();
  initParallax();
  initTyped();
  initReveal();
  initTilt(document);
  initTouchTilt();

  // Set initial mobile view (About is default)
  if (isMobile()) {
    switchMobileView('about');
  }
});