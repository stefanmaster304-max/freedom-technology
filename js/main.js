/**
 * Freedom Technology — Main Script
 * Loads partials, binds high-contrast toggle only.
 */
document.addEventListener('DOMContentLoaded', async () => {
  await Partials.load();

  // Screen reader announcer
  const announcer = document.getElementById('live-announcer');
  function announce(msg) {
    if (!announcer) return;
    announcer.textContent = '';
    requestAnimationFrame(() => { announcer.textContent = msg; });
  }

  // Restore saved high-contrast preference
  const savedContrast = localStorage.getItem('ft_contrast') === 'true';
  if (savedContrast) document.body.classList.add('high-contrast');

  // High contrast toggle
  const contrastBtn = document.getElementById('btn-toggle-contrast');
  if (contrastBtn) {
    contrastBtn.setAttribute('aria-pressed', savedContrast);
    contrastBtn.addEventListener('click', () => {
      const on = !document.body.classList.contains('high-contrast');
      document.body.classList.toggle('high-contrast', on);
      localStorage.setItem('ft_contrast', on);
      contrastBtn.setAttribute('aria-pressed', on);
      announce(on ? 'High contrast enabled.' : 'High contrast disabled.');
    });
  }
});
