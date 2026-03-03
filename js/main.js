/* ═══════════════════════════════════════════════════════
   iDT4GDC — Shared JavaScript
═══════════════════════════════════════════════════════ */

/* ── Sticky nav shadow ───────────────────────────────── */
(function () {
  const nav = document.getElementById('main-nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });
})();

/* ── Active nav link ─────────────────────────────────── */
(function () {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, #nav-drawer a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href === page || (page === '' && href === 'index.html') ||
        (page === 'index.html' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

/* ── Hamburger / mobile drawer ───────────────────────── */
(function () {
  const btn = document.getElementById('hamburger');
  const drawer = document.getElementById('nav-drawer');
  if (!btn || !drawer) return;
  btn.addEventListener('click', () => {
    drawer.classList.toggle('open');
    const spans = btn.querySelectorAll('span');
    if (drawer.classList.contains('open')) {
      spans[0].style.cssText = 'transform:translateY(7px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.cssText = 'transform:translateY(-7px) rotate(-45deg)';
    } else {
      spans.forEach(s => s.style.cssText = '');
    }
  });
  // Close on link click
  drawer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      drawer.classList.remove('open');
      btn.querySelectorAll('span').forEach(s => s.style.cssText = '');
    });
  });
})();

/* ── Smooth scroll for anchor links ──────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ── Scroll reveal ───────────────────────────────────── */
(function () {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
})();

/* ── TRL bar animation ───────────────────────────────── */
(function () {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('.trl-fill[data-w]').forEach(fill => {
        const w = parseFloat(fill.dataset.w);
        requestAnimationFrame(() => setTimeout(() => { fill.style.width = w + '%'; }, 160));
      });
      obs.unobserve(e.target);
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('[data-trl-animate]').forEach(el => obs.observe(el));
})();

/* ── Counter animation ───────────────────────────────── */
(function () {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('.counter[data-target]').forEach(el => {
        const target = parseInt(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        let cur = 0;
        const steps = 50;
        const inc = target / steps;
        let frame = 0;
        const t = setInterval(() => {
          frame++;
          cur = Math.min(cur + inc, target);
          el.textContent = prefix + Math.round(cur) + suffix;
          if (frame >= steps) clearInterval(t);
        }, 30);
      });
      obs.unobserve(e.target);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('[data-counter-group]').forEach(el => obs.observe(el));
})();

/* ── Hero canvas (light mode) ────────────────────────── */
(function () {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, nodes, particles = [];
  const N = 42, LINK = 150;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  function mkNodes() {
    nodes = Array.from({ length: N }, () => ({
      x: rnd(0, W), y: rnd(0, H),
      vx: rnd(-.2, .2), vy: rnd(-.15, .15),
      r: rnd(2, 4.5),
      green: Math.random() > .7,
      ph: rnd(0, Math.PI * 2),
      ps: rnd(.02, .045),
    }));
  }

  function spawnP(ax, ay, bx, by) {
    if (Math.random() > .006) return;
    particles.push({ x: ax, y: ay, tx: bx, ty: by, t: 0, sp: rnd(.007, .02) });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // edges
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK) {
          const a = (1 - d / LINK) * 0.14;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,150,62,${a})`;
          ctx.lineWidth = .6;
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
          spawnP(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
        }
      }
    }

    // particles
    particles = particles.filter(p => p.t < 1);
    for (const p of particles) {
      p.t += p.sp;
      const px = p.x + (p.tx - p.x) * p.t;
      const py = p.y + (p.ty - p.y) * p.t;
      const a = Math.sin(p.t * Math.PI) * .55;
      ctx.beginPath();
      ctx.fillStyle = `rgba(0,150,62,${a})`;
      ctx.arc(px, py, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // nodes
    for (const n of nodes) {
      n.ph += n.ps;
      n.x += n.vx; n.y += n.vy;
      if (n.x < -8) n.x = W + 8;
      if (n.x > W + 8) n.x = -8;
      if (n.y < -8) n.y = H + 8;
      if (n.y > H + 8) n.y = -8;

      const pulse = .65 + Math.sin(n.ph) * .35;

      if (n.green) {
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4.5);
        g.addColorStop(0, `rgba(0,150,62,${.22 * pulse})`);
        g.addColorStop(1, 'rgba(0,150,62,0)');
        ctx.beginPath(); ctx.fillStyle = g;
        ctx.arc(n.x, n.y, n.r * 4.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = `rgba(0,150,62,${.75 * pulse})`;
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.beginPath();
        ctx.fillStyle = `rgba(11,26,46,${.12 * pulse})`;
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      }
    }
    requestAnimationFrame(draw);
  }

  resize(); mkNodes(); draw();
  window.addEventListener('resize', () => { resize(); mkNodes(); });
})();

/* ── Form submit feedback ────────────────────────────── */
window.handleFormSubmit = function (e, btnId) {
  e.preventDefault();
  const btn = document.getElementById(btnId || 'submit-btn');
  if (!btn) return false;
  btn.textContent = 'Message Sent ✓';
  btn.style.background = '#007A6B';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = 'Send Message';
    btn.style.background = '';
    btn.disabled = false;
  }, 3500);
  return false;
};
