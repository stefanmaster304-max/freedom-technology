/**
 * Freedom Technology — Main Script
 * Interactivity: theme, contrast, font size, screen reader announcements.
 * Loads partials first, then binds controls.
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Inject shared partials (header, footer, a11y bar)
  await Partials.load();

  // ─── Screen reader announcer ─────────────────────────────────────────────
  const announcer = document.getElementById('live-announcer');
  function announce(msg) {
    if (!announcer) return;
    announcer.textContent = '';
    requestAnimationFrame(() => { announcer.textContent = msg; });
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────
  function setClass(cls, on) {
    document.body.classList.toggle(cls, on);
  }

  function hasClass(cls) {
    return document.body.classList.contains(cls);
  }

  // ─── Restore saved preferences ───────────────────────────────────────────
  const saved = {
    theme:    localStorage.getItem('ft_theme') || 'dark',
    contrast: localStorage.getItem('ft_contrast') === 'true',
    fontSize: localStorage.getItem('ft_font_size') || 'normal',
  };

  if (saved.theme === 'light') setClass('light', true);
  if (saved.contrast)          setClass('high-contrast', true);
  if (saved.fontSize !== 'normal') setClass(`font-${saved.fontSize}`, true);

  // ─── Theme toggle ────────────────────────────────────────────────────────
  const themeBtn = document.getElementById('btn-toggle-theme');
  if (themeBtn) {
    themeBtn.setAttribute('aria-pressed', hasClass('light'));
    themeBtn.addEventListener('click', () => {
      const isLight = !hasClass('light');
      setClass('light', isLight);
      localStorage.setItem('ft_theme', isLight ? 'light' : 'dark');
      themeBtn.setAttribute('aria-pressed', isLight);
      announce(isLight ? 'Light theme enabled.' : 'Dark theme enabled.');
    });
  }

  // ─── High contrast toggle ────────────────────────────────────────────────
  const contrastBtn = document.getElementById('btn-toggle-contrast');
  if (contrastBtn) {
    contrastBtn.setAttribute('aria-pressed', hasClass('high-contrast'));
    contrastBtn.addEventListener('click', () => {
      const on = !hasClass('high-contrast');
      setClass('high-contrast', on);
      localStorage.setItem('ft_contrast', on);
      contrastBtn.setAttribute('aria-pressed', on);
      announce(on ? 'High contrast enabled.' : 'High contrast disabled.');
    });
  }

  // ─── Font size controls ──────────────────────────────────────────────────
  const sizes = ['normal', 'large', 'xlarge'];

  function currentSize() {
    if (hasClass('font-xlarge')) return 'xlarge';
    if (hasClass('font-large'))  return 'large';
    return 'normal';
  }

  function applySize(size) {
    setClass('font-large',  size === 'large');
    setClass('font-xlarge', size === 'xlarge');
    localStorage.setItem('ft_font_size', size);
  }

  const btnIncrease = document.getElementById('btn-font-increase');
  const btnDecrease = document.getElementById('btn-font-decrease');
  const btnReset    = document.getElementById('btn-font-reset');

  if (btnIncrease) {
    btnIncrease.addEventListener('click', () => {
      const cur = sizes.indexOf(currentSize());
      if (cur < sizes.length - 1) {
        const next = sizes[cur + 1];
        applySize(next);
        announce(next === 'xlarge' ? 'Maximum font size.' : 'Font size increased.');
      }
    });
  }

  if (btnDecrease) {
    btnDecrease.addEventListener('click', () => {
      const cur = sizes.indexOf(currentSize());
      if (cur > 0) {
        const prev = sizes[cur - 1];
        applySize(prev);
        announce(prev === 'normal' ? 'Default font size.' : 'Font size decreased.');
      }
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      applySize('normal');
      announce('Font size reset to default.');
    });
  }
});
