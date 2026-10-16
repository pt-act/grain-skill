// base.js — the entrance layer. Marks elements [data-motion] .in as they enter,
// once. Everything is visible without script and under prefers-reduced-motion.
(() => {
  const els = document.querySelectorAll('[data-motion]');
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach((el) => el.classList.add('in'));
    return;
  }
  els.forEach((el, i) => el.style.setProperty('--i', String(i)));
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
  els.forEach((el) => io.observe(el));
})();
