/**
 * Freedom Technology — Partials Loader
 * Injects shared header and footer. Contact info lives only on the About page.
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
    </div>
  </header>`;
  }

  function footer() {
    return `
  <footer class="site-footer" role="contentinfo">
    <div class="container">
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
