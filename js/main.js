/* ── IntersectionObserver — scroll reveals ── */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('visible');
    io.unobserve(e.target);
  });
}, { threshold: 0.12 });

document.querySelectorAll(
  '.reveal, .reveal-left, .reveal-right, .reveal-zoom, .reveal-flip, .reveal-blur, .section-title'
).forEach(el => io.observe(el));

/* Stagger gallery items */
document.querySelectorAll('.gallery-item').forEach((el, i) => {
  el.style.transitionDelay = (i * 0.06) + 's';
  el.classList.add('reveal-zoom');
  io.observe(el);
});

/* Stagger contact cards */
document.querySelectorAll('.contact-card').forEach((el, i) => {
  el.style.transitionDelay = (i * 0.1) + 's';
  el.classList.add('reveal-zoom');
  io.observe(el);
});

/* Stagger steps */
document.querySelectorAll('.step').forEach((el, i) => {
  el.style.transitionDelay = (i * 0.13) + 's';
  el.classList.add('reveal-zoom');
  io.observe(el);
});

/* Stagger tags */
document.querySelectorAll('.tag').forEach((el, i) => {
  el.style.transitionDelay = (i * 0.05) + 's';
  el.classList.add('reveal');
  io.observe(el);
});

/* ── Nav scroll class ── */
const nav = document.getElementById('main-nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

/* ── Animated counters ── */
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = parseInt(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const divisor = parseFloat(el.dataset.divisor) || 1;
    const duration = 1400;
    const step = target / (duration / 20);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      const display = divisor !== 1
        ? (current / divisor).toFixed(1) + suffix
        : prefix + Math.floor(current) + suffix;
      el.textContent = display;
    }, 20);
    counterObs.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.counter').forEach(el => counterObs.observe(el));

/* ── Floating particles ── */
const container = document.getElementById('particles');
if (container) {
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 6 + 3;
    p.style.cssText = `
    width:${size}px; height:${size}px;
    left:${Math.random() * 100}%;
    animation-duration:${Math.random() * 14 + 8}s;
    animation-delay:${Math.random() * 12}s;
    opacity:${Math.random() * 0.5 + 0.1};
  `;
    container.appendChild(p);
  }
}

/* ── Parallax orbs on scroll ── */
const orb1 = document.querySelector('.orb-1');
const orb2 = document.querySelector('.orb-2');
const grid = document.querySelector('.hero-bg-grid');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (orb1) orb1.style.transform = `translateY(${y * 0.15}px)`;
  if (orb2) orb2.style.transform = `translateY(${-y * 0.1}px)`;
  if (grid) grid.style.transform = `translateY(${y * 0.25}px)`;
}, { passive: true });
