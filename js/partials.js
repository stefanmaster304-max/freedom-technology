/**
 * Freedom Technology — Partials Loader
 * Injects shared header and footer. Minimal a11y bar with single contrast toggle.
 */
window.Partials = (() => {
  const PAGES = [
    { href: 'index.html',     label: 'Home' },
    { href: 'projetos.html',  label: 'Projects' },
    { href: 'sobre.html',     label: 'About' },
    { href: 'parceiros.html', label: 'Partners' },
  ];

  function currentPage() {
    return (window.location.pathname.split('/').pop() || 'index.html');
  }

  function navItems() {
    const cur = currentPage();
    return PAGES.map(p => {
      const active = p.href === cur;
      return `<li><a href="${p.href}" class="nav-link${active ? ' active' : ''}"${active ? ' aria-current="page"' : ''}>${p.label}</a></li>`;
    }).join('\n          ');
  }

  function header() {
    return `
  <header class="site-header" role="banner">
    <div class="container header-inner">
      <a href="index.html" class="brand" aria-label="Freedom Technology — Home">
        <div class="brand-mark" aria-hidden="true">FT</div>
        <span class="brand-name">Freedom Technology</span>
      </a>
      <nav class="main-nav" aria-label="Main navigation">
        <ul>
          ${navItems()}
        </ul>
      </nav>
      <button id="btn-toggle-contrast" class="a11y-btn" aria-pressed="false" title="Toggle high contrast mode">
        <span aria-hidden="true">◐</span> Contrast
      </button>
    </div>
  </header>`;
  }

  function footer() {
    return `
  <footer class="site-footer" role="contentinfo">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <h4>Freedom Technology</h4>
          <p>Technological freedom, full accessibility, and tools built for everyone.</p>
        </div>
        <div class="footer-col">
          <h4>Navigation</h4>
          <ul class="footer-links">
            ${PAGES.map(p => `<li><a href="${p.href}">${p.label}</a></li>`).join('\n            ')}
          </ul>
        </div>
        <div class="footer-col">
          <h4>Contact</h4>
          <ul class="footer-links">
            <li><a href="https://t.me/stfgames" target="_blank" rel="noopener">📢 Telegram: @stfgames</a></li>
            <li><a href="https://t.me/Stefanmaster23" target="_blank" rel="noopener">✈️ Telegram: @Stefanmaster23</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 Freedom Technology. All rights reserved.</p>
      </div>
    </div>
  </footer>`;
  }

  function load() {
    const anchor = document.getElementById('partials-anchor');
    if (!anchor) return Promise.resolve();

    const content = anchor.innerHTML;
    anchor.remove();

    const wrapper = document.createElement('div');
    wrapper.innerHTML =
      header() +
      `<main id="main-content" class="page-content" role="main" tabindex="-1">
        <div class="container">${content}</div>
      </main>` +
      footer();

    document.body.appendChild(wrapper);
    return Promise.resolve();
  }

  return { load };
})();
