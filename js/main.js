/**
 * Freedom Technology — Main Script
 * Loads partials. Auto-applies high contrast based on OS preference.
 */
document.addEventListener('DOMContentLoaded', async () => {
  await Partials.load();

  // Auto-detect OS high contrast preference
  const prefersContrast = window.matchMedia('(prefers-contrast: more)');
  function applyContrast(on) {
    document.body.classList.toggle('high-contrast', on);
    localStorage.setItem('ft_contrast', on);
  }

  // Check saved preference first, otherwise follow OS
  const saved = localStorage.getItem('ft_contrast');
  if (saved !== null) {
    applyContrast(saved === 'true');
  } else {
    applyContrast(prefersContrast.matches);
  }

  // Listen for OS changes
  prefersContrast.addEventListener('change', (e) => {
    // Only auto-follow if user hasn't manually set a preference
    if (localStorage.getItem('ft_contrast') === null) {
      document.body.classList.toggle('high-contrast', e.matches);
    }
  });
});
