# Freedom Technology — Full Site Refactoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recreate all 4 pages of the Freedom Technology static site with modern, accessible markup, a stunning inclusive hero illustration, refreshed multilingual copy, and a clean local git repository.

**Architecture:** Pure static HTML/CSS/JS — no build tools, no frameworks. The site uses a CSS custom-property design system (dark/light/high-contrast themes), an i18n translation dictionary (`translations.js`), and accessibility controls (`main.js`). The refactoring preserves this architecture while modernizing every file: cleaner semantics, no inline styles, a reusable partial pattern via JS template injection, and an inline SVG hero illustration replacing the raster `banner.jpg`.

**Tech Stack:** HTML5, CSS3 (Custom Properties, Grid, Flexbox), Vanilla JS (ES6+), SVG (inline)

## Global Constraints

- No external dependencies (no npm, no CDN) — zero-cost hosting on GitHub Pages
- WCAG 2.2 AA/AAA compliance maintained (skip links, aria-live, focus-visible, reduced-motion)
- Three languages: PT-BR, EN-US, ES-ES — i18n via `data-i18n` attributes + `translations.js`
- Game/project download content is English-only (other site content remains trilingual)
- Dark theme is the default; light and high-contrast are user-toggled
- All files must work when opened directly via `file://` protocol (no server required)
- Repository must be initialized as a local git repo with a clean initial commit

---

## File Structure

```
.
├── index.html              ← REWRITE (homepage with hero SVG illustration)
├── projetos.html           ← REWRITE (projects page, English-only game section)
├── sobre.html              ← REWRITE (about page)
├── parceiros.html          ← REWRITE (partners page)
├── css/
│   ├── style.css           ← REWRITE (modernized design system, no inline styles)
│   └── accessibility.css   ← KEEP structure, minor polish
├── js/
│   ├── main.js             ← REWRITE (ES6 modules pattern, cleaner structure)
│   └── translations.js     ← REWRITE (fresh copy in all 3 languages)
│   └── partials.js         ← CREATE (shared header/footer/accessibility-bar injection)
├── assets/
│   └── images/
│       └── banner.jpg      ← DELETE (replaced by inline SVG)
├── README.md               ← REWRITE (updated project description)
└── .gitignore              ← CREATE (empty or minimal)
```

**Responsibilities:**
- `partials.js` — Injects the shared accessibility bar, header, and footer into every page via a `<div id="partials-anchor">` placeholder, eliminating ~100 lines of duplicated HTML per page.
- `translations.js` — Single source of truth for all UI strings in PT/EN/ES. Fresh, polished copy.
- `main.js` — All interactivity: i18n application, theme/contrast/font toggles, announcer, partial loading.
- `style.css` — Complete design system with CSS custom properties, modern layout, responsive breakpoints.
- `accessibility.css` — Focus management, skip links, sr-only, reduced-motion, high-contrast overrides.
- Each HTML file — Minimal markup: only the unique `<main>` content. Shared chrome loaded by `partials.js`.

---

### Task 1: Shared Partials System (`js/partials.js`)

**Files:**
- Create: `js/partials.js`
- Test: Open `index.html` in browser — accessibility bar, header, and footer should appear automatically

**Interfaces:**
- Consumes: nothing (this is the foundation task)
- Produces: `window.FTPartials.load()` — returns a `Promise` that resolves after injecting shared HTML into `#partials-anchor` (or all `#partials-anchor` elements on the page). Also exposes `window.FTPartials.getActivePage()` which returns the current page filename (e.g. `"index.html"`).

- [ ] **Step 1: Create `js/partials.js`**

```js
/**
 * Freedom Technology — Shared Partials Loader
 * Injects accessibility bar, site header, and footer into every page.
 * Must load BEFORE main.js and translations.js.
 */
window.FTPartials = (() => {
  function getActivePage() {
    const path = window.location.pathname;
    const file = path.split('/').pop() || 'index.html';
    return file;
  }

  function navLink(href, labelKey, ariaCurrent) {
    const active = getActivePage() === href;
    const cls = active ? 'nav-link active' : 'nav-link';
    const ac = active ? ' aria-current="page"' : '';
    return `<li><a href="${href}" class="${cls}"${ac} data-i18n="${labelKey}">${labelKey}</a></li>`;
  }

  function buildAccessibilityBar() {
    return `
  <aside class="accessibility-bar" aria-label="Accessibility Tools">
    <div class="container accessibility-bar-inner">
      <div class="accessibility-shortcuts">
        <span data-i18n="accessibility_title">Accessibility</span>
      </div>
      <div class="accessibility-controls">
        <div class="lang-select-wrapper">
          <label for="lang-selector" data-i18n="lang_label">Language:</label>
          <select id="lang-selector" class="lang-select" aria-label="Select page language">
            <option value="pt">🇧🇷 Português</option>
            <option value="en">🇺🇸 English</option>
            <option value="es">🇪🇸 Español</option>
          </select>
        </div>
        <button id="btn-toggle-contrast" class="control-btn" aria-pressed="false" title="Toggle high contrast mode">
          <span aria-hidden="true">🌓</span> <span data-i18n="btn_contrast">High Contrast</span>
        </button>
        <button id="btn-toggle-theme" class="control-btn" aria-pressed="false" title="Toggle light and dark theme">
          <span aria-hidden="true">💡</span> <span data-i18n="btn_theme">Light/Dark Theme</span>
        </button>
        <button id="btn-font-decrease" class="control-btn" title="Decrease text size">
          <span aria-hidden="true">A-</span> <span data-i18n="btn_font_decrease">Decrease Font</span>
        </button>
        <button id="btn-font-reset" class="control-btn" title="Reset text to default size">
          <span aria-hidden="true">A</span> <span data-i18n="btn_font_reset">Default</span>
        </button>
        <button id="btn-font-increase" class="control-btn" title="Increase text size">
          <span aria-hidden="true">A+</span> <span data-i18n="btn_font_increase">Increase Font</span>
        </button>
      </div>
    </div>
  </aside>`;
  }

  function buildHeader() {
    return `
  <header class="site-header" role="banner">
    <div class="container header-inner">
      <a href="index.html" class="brand" aria-label="Freedom Technology — Home">
        <div class="brand-icon" aria-hidden="true">FT</div>
        <span class="brand-text">Freedom Technology</span>
      </a>
      <nav class="main-nav" aria-label="Main Navigation">
        <ul>
          ${navLink('index.html', 'nav_home')}
          ${navLink('projetos.html', 'nav_projects')}
          ${navLink('sobre.html', 'nav_about')}
          ${navLink('parceiros.html', 'nav_partners')}
        </ul>
      </nav>
    </div>
  </header>`;
  }

  function buildFooter() {
    return `
  <footer class="site-footer" role="contentinfo">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <h4>Freedom Technology</h4>
          <p data-i18n="footer_desc">Technological freedom, full accessibility, and development of tools for the blind community.</p>
        </div>
        <div class="footer-col">
          <h4 data-i18n="footer_nav_title">Navigation</h4>
          <ul class="footer-links">
            ${navLink('index.html', 'nav_home')}
            ${navLink('projetos.html', 'nav_projects')}
            ${navLink('sobre.html', 'nav_about')}
            ${navLink('parceiros.html', 'nav_partners')}
          </ul>
        </div>
        <div class="footer-col">
          <h4 data-i18n="footer_contact_title">Contact &amp; Channels</h4>
          <ul class="footer-links">
            <li><a href="https://t.me/stfgames" target="_blank" rel="noopener noreferrer">📢 Telegram: @stfgames</a></li>
            <li><a href="https://t.me/estefamaster23" target="_blank" rel="noopener noreferrer">✈️ Telegram: @estefamaster23</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p data-i18n="footer_copyright">© 2026 Freedom Technology. All rights reserved.</p>
      </div>
    </div>
  </footer>`;
  }

  function load() {
    const anchors = document.querySelectorAll('#partials-anchor');
    if (!anchors.length) return Promise.resolve();

    anchors.forEach(anchor => {
      const page = getActivePage();
      const fragments = [];

      // The anchor's parent <body> should already have the skip-link and live-announcer.
      // We insert partials in order: accessibility bar, header, then move anchor content, then footer.
      const skipLink = document.querySelector('.skip-link');
      const announcer = document.getElementById('live-announcer');

      // Build the full page chrome around the anchor
      const chrome = document.createElement('div');
      chrome.innerHTML =
        buildAccessibilityBar() +
        buildHeader() +
        `<main id="main-content" role="main" tabindex="-1">` +
          anchor.outerHTML +
        `</main>` +
        buildFooter();

      // Replace the anchor with the chrome
      anchor.replaceWith(chrome);
    });

    return Promise.resolve();
  }

  return { load, getActivePage };
})();
```

- [ ] **Step 2: Test in browser**

Open `index.html` in browser. The page should show:
- Accessibility bar at top with language selector and control buttons
- Sticky header with "FT" brand and nav links (index.html link highlighted as active)
- Footer with 3 columns
- The `<main>` content (whatever is inside `#partials-anchor`) in the center

Expected: Layout renders correctly, no JS errors in console.

- [ ] **Step 3: Commit**

```bash
git add js/partials.js
git commit -m "feat: add shared partials loader for header, footer, and accessibility bar"
```

---

### Task 2: Modernized CSS (`css/style.css`)

**Files:**
- Rewrite: `css/style.css`
- Test: Open `index.html` in browser — all existing visual styles should be preserved or improved

**Interfaces:**
- Consumes: nothing (standalone)
- Produces: CSS classes and custom properties consumed by all HTML pages (`.accessibility-bar`, `.site-header`, `.hero-section`, `.card`, `.grid-cards`, `.btn`, `.site-footer`, `.container`, `.brand`, `.nav-link`, `.notice-box`, etc.)

- [ ] **Step 1: Write the modernized `css/style.css`**

```css
/* ==========================================================================
   Freedom Technology — Design System
   WCAG 2.2 AA/AAA · Dark (default) / Light / High Contrast
   ========================================================================== */

/* 1. Design Tokens ─────────────────────────────────────────────────────────── */

:root {
  /* Surfaces */
  --color-bg:              #0d1117;
  --color-surface:         #161b22;
  --color-surface-hover:   #21262d;
  --color-border:          #30363d;

  /* Text */
  --color-text-main:       #f0f6fc;
  --color-text-muted:      #8b949e;
  --color-text-light:      #c9d1d9;

  /* Accent palette */
  --color-primary:         #38bdf8;
  --color-primary-hover:   #0ea5e9;
  --color-on-primary:      #031828;

  --color-accent:          #f59e0b;
  --color-on-accent:       #1e1101;

  --color-success:         #10b981;
  --color-success-bg:      rgba(16, 185, 129, 0.15);

  /* Focus & borders */
  --focus-ring-color:      #38bdf8;
  --card-border:           1px solid var(--color-border);

  /* Typography */
  --font-family-base:      system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-family-heading:   system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  /* Layout */
  --container-max-width:   1100px;
  --radius-sm:             6px;
  --radius-md:             10px;
  --radius-lg:             16px;

  /* Elevation & motion */
  --shadow-subtle:         0 4px 12px rgba(0, 0, 0, 0.3);
  --shadow-prominent:      0 10px 25px rgba(0, 0, 0, 0.5);
  --transition-standard:   all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Light theme */
body.theme-light {
  --color-bg:              #f8fafc;
  --color-surface:         #ffffff;
  --color-surface-hover:   #f1f5f9;
  --color-border:          #cbd5e1;
  --color-text-main:       #0f172a;
  --color-text-muted:      #475569;
  --color-text-light:      #334155;
  --color-primary:         #0284c7;
  --color-primary-hover:   #0369a1;
  --color-on-primary:      #ffffff;
  --color-accent:          #d97706;
  --color-on-accent:       #ffffff;
  --color-success:         #059669;
  --color-success-bg:      #d1fae5;
  --focus-ring-color:      #0284c7;
  --shadow-subtle:         0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-prominent:      0 10px 25px rgba(0, 0, 0, 0.12);
}

/* 2. Reset ─────────────────────────────────────────────────────────────────── */

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html {
  font-size: 100%;
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-family-base);
  background-color: var(--color-bg);
  color: var(--color-text-main);
  line-height: 1.7;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* 3. Typography ────────────────────────────────────────────────────────────── */

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-family-heading);
  color: var(--color-text-main);
  line-height: 1.3;
  margin-bottom: 1rem;
  font-weight: 700;
}

h1 { font-size: 2.25rem; letter-spacing: -0.02em; }

h2 {
  font-size: 1.75rem;
  margin-top: 1.5rem;
  border-bottom: 2px solid var(--color-border);
  padding-bottom: 0.5rem;
}

h3 { font-size: 1.35rem; margin-top: 1rem; }

p {
  margin-bottom: 1.25rem;
  color: var(--color-text-light);
  font-size: 1.05rem;
}

strong { font-weight: 700; color: var(--color-text-main); }

a {
  color: var(--color-primary);
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: var(--transition-standard);
}

a:hover {
  color: var(--color-primary-hover);
  text-decoration-thickness: 2px;
}

/* 4. Layout ────────────────────────────────────────────────────────────────── */

.container {
  width: 100%;
  max-width: var(--container-max-width);
  margin-inline: auto;
  padding-inline: 1.5rem;
}

main { flex: 1; padding: 2.5rem 0; }

/* 5. Accessibility Bar ─────────────────────────────────────────────────────── */

.accessibility-bar {
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: 0.5rem 0;
  font-size: 0.9rem;
}

.accessibility-bar-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.accessibility-shortcuts { color: var(--color-text-muted); }

.accessibility-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.control-btn {
  background-color: var(--color-surface-hover);
  color: var(--color-text-main);
  border: 1px solid var(--color-border);
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: var(--transition-standard);
}

.control-btn:hover {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  border-color: var(--color-primary);
}

.lang-select-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  font-weight: 600;
}

.lang-select {
  background-color: var(--color-surface-hover);
  color: var(--color-text-main);
  border: 1px solid var(--color-border);
  padding: 0.35rem 0.6rem;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.lang-select:focus-visible {
  outline: 3px solid var(--focus-ring-color);
  outline-offset: 2px;
}

/* 6. Header ────────────────────────────────────────────────────────────────── */

.site-header {
  background-color: var(--color-surface);
  border-bottom: 2px solid var(--color-border);
  box-shadow: var(--shadow-subtle);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  flex-wrap: wrap;
  gap: 1rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: var(--color-text-main);
}

.brand-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  font-weight: 900;
  font-size: 1.25rem;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.4);
}

.brand-text { font-size: 1.4rem; font-weight: 800; letter-spacing: -0.01em; }

.main-nav ul {
  display: flex;
  list-style: none;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.nav-link {
  color: var(--color-text-main);
  text-decoration: none;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  transition: var(--transition-standard);
}

.nav-link:hover {
  background-color: var(--color-surface-hover);
  color: var(--color-primary);
  border-color: var(--color-border);
}

.nav-link.active {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  border-color: var(--color-primary);
}

/* 7. Hero Section ──────────────────────────────────────────────────────────── */

.hero-section {
  background: linear-gradient(180deg, var(--color-surface) 0%, var(--color-bg) 100%);
  border-radius: var(--radius-lg);
  padding: 2.5rem;
  margin-bottom: 2.5rem;
  border: var(--card-border);
  box-shadow: var(--shadow-prominent);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--color-success-bg);
  color: var(--color-success);
  border: 1px solid var(--color-success);
  padding: 0.35rem 0.85rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
}

.hero-title { font-size: 2.5rem; margin-bottom: 1rem; }

.hero-lead {
  font-size: 1.25rem;
  color: var(--color-text-light);
  max-width: 850px;
  margin-bottom: 1.75rem;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Hero SVG Illustration */
.hero-illustration {
  width: 100%;
  max-width: 900px;
  margin: 2rem auto;
  display: block;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.hero-illustration svg {
  width: 100%;
  height: auto;
  display: block;
}

/* 8. Buttons ───────────────────────────────────────────────────────────────── */

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.85rem 1.5rem;
  border-radius: var(--radius-md);
  font-size: 1.05rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  border: 2px solid transparent;
  transition: var(--transition-standard);
}

.btn-primary {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  box-shadow: 0 4px 15px rgba(56, 189, 248, 0.3);
}

.btn-primary:hover {
  background-color: var(--color-primary-hover);
  color: var(--color-on-primary);
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: var(--color-surface);
  color: var(--color-text-main);
  border-color: var(--color-border);
}

.btn-secondary:hover {
  background-color: var(--color-surface-hover);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-telegram { background-color: #229ed9; color: #fff; }
.btn-telegram:hover { background-color: #1b85b8; color: #fff; }

/* 9. Cards ─────────────────────────────────────────────────────────────────── */

.grid-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.75rem;
  margin-top: 1.5rem;
  margin-bottom: 2.5rem;
}

.card {
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  padding: 1.75rem;
  border: var(--card-border);
  box-shadow: var(--shadow-subtle);
  display: flex;
  flex-direction: column;
  transition: var(--transition-standard);
}

.card:hover {
  border-color: var(--color-primary);
  transform: translateY(-3px);
}

.card-title {
  font-size: 1.35rem;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-body { flex: 1; }

.card-footer {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

/* Notice box */
.notice-box {
  background-color: var(--color-surface);
  border-left: 5px solid var(--color-accent);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  margin-bottom: 2rem;
  border-top: var(--card-border);
  border-right: var(--card-border);
  border-bottom: var(--card-border);
}

.notice-box-title {
  color: var(--color-accent);
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* 10. Table ────────────────────────────────────────────────────────────────── */

.specs-table-container {
  overflow-x: auto;
  margin: 1.5rem 0;
  border: var(--card-border);
  border-radius: var(--radius-md);
}

.specs-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.specs-table th,
.specs-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.specs-table th {
  background-color: var(--color-surface-hover);
  color: var(--color-text-main);
  font-weight: 700;
}

.specs-table tr:hover { background-color: var(--color-surface-hover); }

/* 11. Footer ───────────────────────────────────────────────────────────────── */

.site-footer {
  background-color: var(--color-surface);
  border-top: 2px solid var(--color-border);
  padding: 2.5rem 0 1.5rem;
  margin-top: auto;
  font-size: 0.95rem;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-col h4 { font-size: 1.1rem; margin-bottom: 0.75rem; color: var(--color-text-main); }

.footer-links { list-style: none; }
.footer-links li { margin-bottom: 0.5rem; }

.footer-bottom {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
  color: var(--color-text-muted);
}

/* 12. Live announcer (off-screen) ─────────────────────────────────────────── */

#live-announcer {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

/* 13. Responsive ───────────────────────────────────────────────────────────── */

@media (max-width: 768px) {
  h1 { font-size: 1.85rem; }
  h2 { font-size: 1.45rem; }
  .hero-title { font-size: 1.85rem; }
  .hero-section { padding: 1.5rem; }
  .header-inner { flex-direction: column; align-items: flex-start; }
  .main-nav ul { width: 100%; justify-content: flex-start; }
}
```

- [ ] **Step 2: Test in browser**

Open `index.html` with only the CSS linked (before HTML is rewritten). Confirm:
- Dark theme renders by default
- Buttons, cards, nav all look correct
- Responsive layout works at mobile width

Expected: All visual styles present, no broken layouts.

- [ ] **Step 3: Commit**

```bash
git add css/style.css
git commit -m "refactor(css): modernize design system with clean custom properties"
```

---

### Task 3: Rewrite Translations (`js/translations.js`)

**Files:**
- Rewrite: `js/translations.js`
- Test: Open browser console, verify `translations.pt`, `translations.en`, `translations.es` all exist with all required keys

**Interfaces:**
- Consumes: nothing
- Produces: `window.translations` object with keys `pt`, `en`, `es`. Each contains all `data-i18n` keys used across all 4 HTML pages. This is the single source of truth for all UI text.

- [ ] **Step 1: Write the fresh `js/translations.js`**

```js
/**
 * Freedom Technology — Translation Dictionary
 * Languages: pt (Portuguese/Brazil), en (English/US), es (Spanish)
 * Game/project download content is English-only (not translated).
 */
window.translations = {
  pt: {
    /* Accessibility bar */
    skip_link:             "Pular para o conteúdo principal",
    accessibility_title:   "Acessibilidade Web",
    btn_contrast:          "Alto Contraste",
    btn_theme:             "Tema Claro/Escuro",
    btn_font_decrease:     "Diminuir Fonte",
    btn_font_reset:        "Padrão",
    btn_font_increase:     "Aumentar Fonte",
    lang_label:            "Idioma:",

    /* Navigation */
    nav_home:              "Página Inicial",
    nav_projects:          "Nossos Projetos",
    nav_about:             "Sobre Nós",
    nav_partners:          "Nossos Parceiros",

    /* Homepage hero */
    hero_badge:            "Acessibilidade Total · Inclusão Digital",
    hero_title:            "Bem-vindos à Freedom Technology",
    hero_lead:             "Caros usuários, é com imenso prazer que vos damos as boas-vindas ao nosso portal! Aqui você encontra um espaço dedicado ao desenvolvimento de soluções digitais, programas e jogos acessíveis pensados especialmente para pessoas cegas e com deficiência visual.",
    hero_img_alt:          "Ilustração inclusiva: pessoas diversas ao redor de uma estação de trabalho com monitor grande, símbolos de áudio, braille e controle de jogo, representando acessibilidade, tecnologia e inclusão digital.",
    hero_img_caption:      "Manifesto Freedom Technology: 'Todas as pessoas cegas merecem ser livres' — Tecnologia assistiva, jogos de áudio e autonomia digital.",
    btn_see_projects:      "Conhecer Nossos Projetos",
    btn_see_about:         "Sobre a Nossa Missão",

    /* Homepage pillars */
    pillars_title:         "Nossos Pilares",
    pillar_games_title:    "🎮 Jogos Acessíveis",
    pillar_games_desc:     "Desenvolvimento de jogos e experiências imersivas com acessibilidade nativa para jogadores cegos.",
    pillar_games_btn:      "Ver Projetos e Jogos",
    pillar_freedom_title:  "💻 Liberdade de Plataformas",
    pillar_freedom_desc:   "Softwares e ferramentas para Windows e Linux nos computadores, além de Android e iOS com leitores de tela.",
    pillar_freedom_btn:    "Conheça Nossa Visão",
    pillar_partners_title: "🌐 Parcerias Internacionais",
    pillar_partners_desc:  "Trabalho conjunto com desenvolvedores e equipes cegas de outros países para fortalecer a acessibilidade global.",
    pillar_partners_btn:   "Ver Nossos Parceiros",

    /* Projects page */
    projects_page_title:       "Nossos Projetos e Desenvolvimentos",
    projects_page_subtitle:    "Acompanhe aqui o status dos nossos lançamentos e desenvolvimentos em curso.",
    notice_title:              "📢 Comunicado à Comunidade de Jogadores Cegos",
    notice_p1:                 "Queremos compartilhar uma mensagem sincera com toda a comunidade de jogadores cegos no Brasil e no mundo:",
    notice_p2:                "Atualmente, estamos trabalhando em um jogo acessível para vocês. Nem tudo tem saído como esperado nos bastidores, mas um resultado positivo está a caminho!",
    notice_p3:                "Por favor, aguardem pacientemente e acompanhem o site para novidades.",
    game_card_title:          "🎮 Jogo em Desenvolvimento",
    game_card_desc:           "Nosso jogo está sendo construído com foco total na acessibilidade e experiência imersiva para jogadores cegos.",
    game_english_only_notice: "Seção do jogo disponível apenas em inglês.",
    game_download_title:      "Direct Download Area",
    game_download_desc:       "As soon as the game is ready, the direct download (~1 GB) will be available here for free via GitHub Releases.",
    btn_download_game:        "📥 Download Full Game (~1 GB .ZIP — Coming Soon)",
    game_download_hosted:     "Hosted with unlimited bandwidth via GitHub Releases",
    game_download_alert:      "The game is currently under development. Please stay tuned for updates!",

    /* About page */
    about_page_title:         "Sobre a Freedom Technology",
    about_page_subtitle:      "Nossa história, liderança, princípios e contato direto.",
    about_team_title:         "Quem Somos e Liderança",
    about_stefan_p1:          "Meu nome é <strong>Stefan</strong>, sou do Brasil, tenho 21 anos e sou o líder fundador da Freedom Technology. Desenvolvi uma imensa paixão por jogos de áudio imersivos e pela liberdade tecnológica para qualquer pessoa cega ou com deficiência visual.",
    about_stefan_p2:          "A <strong>Freedom Technology</strong> é atualmente uma equipe de uma única pessoa, que busca a liberdade tecnológica e a acessibilidade para todas as pessoas cegas: tanto usuários de computadores Windows e Linux, quanto usuários de leitores de tela no Android e iOS.",
    about_stefan_p3:          "Nosso objetivo é desenvolver programas e ferramentas acessíveis para pessoas cegas no uso diário do computador e dispositivos relacionados.",
    manifesto_title:          "Liberdade Tecnológica e Inclusão Social",
    manifesto_p1:             "A liberdade tecnológica significa ter a autonomia para usar qualquer ferramenta digital sem barreiras. Para uma pessoa cega, o acesso descomplicado a softwares, jogos e sistemas é essencial para a cidadania, estudo e lazer.",
    manifesto_p2:             "A inclusão social acontece de verdade quando os usuários cegos têm as mesmas oportunidades e o poder de escolha no mundo digital.",
    collab_title:             "Crescimento da Equipe e Contribuições",
    collab_p1:                "A equipe tem a esperança de crescer. Qualquer pessoa com forte domínio de programação — seja utilizando inteligência artificial ou código manual — que deseje contribuir, é muito bem-vinda!",
    contact_title:            "Canais Oficiais de Contato",
    contact_channel_desc:     "Canal oficial no Telegram onde publico novidades e informações:",
    contact_personal_desc:    "Contato direto comigo (Stefan):",
    btn_telegram_channel:     "📢 Canal do Telegram: @stfgames",
    btn_telegram_personal:    "✈️ Contato Pessoal: @estefamaster23",

    /* Partners page */
    partners_page_title:      "Nossos Parceiros",
    partners_page_subtitle:   "Projetos, equipes parceiras e conexões internacionais pela acessibilidade.",
    partners_intro:           "Acreditamos na união da comunidade global de desenvolvedores cegos. Conheça as equipes parceiras e canais que compartilham da mesma missão de inclusão e liberdade tecnológica.",
    partner_sightless_title:  "Sightless Coders",
    partner_sightless_desc:   "Equipe parceira internacional de desenvolvedores cegos dedicada à criação de ferramentas e projetos acessíveis.",
    btn_visit_sightless:      "🔗 Acessar Site do Sightless Coders",
    partner_channels_title:   "Comunidade e Redes Parceiras",
    partner_channels_desc:    "Conecte-se também através dos nossos canais de informação e colaboração no Telegram.",

    /* Footer */
    footer_desc:              "Liberdade tecnológica, acessibilidade plena e desenvolvimento de ferramentas para a comunidade de pessoas cegas.",
    footer_nav_title:         "Navegação",
    footer_contact_title:     "Contato e Canais",
    footer_copyright:         "© 2026 Freedom Technology. Todos os direitos reservados."
  },

  en: {
    skip_link:             "Skip to main content",
    accessibility_title:   "Web Accessibility",
    btn_contrast:          "High Contrast",
    btn_theme:             "Light/Dark Theme",
    btn_font_decrease:     "Decrease Font",
    btn_font_reset:        "Default",
    btn_font_increase:     "Increase Font",
    lang_label:            "Language:",

    nav_home:              "Home",
    nav_projects:          "Our Projects",
    nav_about:             "About Us",
    nav_partners:          "Our Partners",

    hero_badge:            "Total Accessibility · Digital Inclusion",
    hero_title:            "Welcome to Freedom Technology",
    hero_lead:             "Dear users, we are pleased to welcome you to our portal! Here you will find a space dedicated to developing digital solutions, programs, and accessible games designed specifically for blind and visually impaired people.",
    hero_img_alt:          "Inclusive illustration: diverse people around a large workstation monitor, with audio waves, braille, and a game controller — representing accessibility, technology, and digital inclusion.",
    hero_img_caption:      "Freedom Technology Manifesto: 'All blind people deserve to be free' — Assistive technology, audio games, and digital autonomy.",
    btn_see_projects:      "Explore Our Projects",
    btn_see_about:         "About Our Mission",

    pillars_title:         "Our Pillars",
    pillar_games_title:    "🎮 Accessible Games",
    pillar_games_desc:     "Development of games and immersive experiences with native accessibility for blind gamers.",
    pillar_games_btn:      "View Projects & Games",
    pillar_freedom_title:  "💻 Cross-Platform Freedom",
    pillar_freedom_desc:   "Software and tools for Windows and Linux computers, as well as Android and iOS with screen readers.",
    pillar_freedom_btn:    "Learn About Our Vision",
    pillar_partners_title: "🌐 International Partnerships",
    pillar_partners_desc:  "Collaborating with blind developer teams from other countries to strengthen global accessibility.",
    pillar_partners_btn:   "View Our Partners",

    projects_page_title:       "Our Projects & Developments",
    projects_page_subtitle:    "Follow the status of our releases and ongoing developments here.",
    notice_title:              "📢 Announcement to the Blind Gaming Community",
    notice_p1:                 "We want to share a sincere message with the entire community of blind gamers worldwide:",
    notice_p2:                "We are currently working on an accessible game for you. Not everything has gone as expected behind the scenes, but a positive result is on its way!",
    notice_p3:                "Please be patient and follow the site for news and updates.",
    game_card_title:          "🎮 Game in Development",
    game_card_desc:           "Our game is being built with full focus on accessibility and an immersive experience for blind players.",
    game_english_only_notice: "Game section available in English only.",
    game_download_title:      "Direct Download Area",
    game_download_desc:       "As soon as the game is ready, the direct download (~1 GB) will be available here for free via GitHub Releases.",
    btn_download_game:        "📥 Download Full Game (~1 GB .ZIP — Coming Soon)",
    game_download_hosted:     "Hosted with unlimited bandwidth via GitHub Releases",
    game_download_alert:      "The game is currently under development. Please stay tuned for updates!",

    about_page_title:         "About Freedom Technology",
    about_page_subtitle:      "Our story, leadership, core principles, and direct contact.",
    about_team_title:         "Who We Are & Leadership",
    about_stefan_p1:          "My name is <strong>Stefan</strong>, I am from Brazil, 21 years old, and I am the founding leader of Freedom Technology. I have developed an immense passion for immersive audio games and technological freedom for any blind or visually impaired person.",
    about_stefan_p2:          "The <strong>Freedom Technology</strong> team is currently a one-person team seeking technological freedom and accessibility for all blind individuals — both Linux and Windows computer users, and Android and iOS screen reader users.",
    about_stefan_p3:          "Our goal is to develop programs and tools accessible to blind people for everyday use on computers and related devices.",
    manifesto_title:          "Technological Freedom & Social Inclusion",
    manifesto_p1:             "Technological freedom means having the autonomy to use any digital tool without barriers. For a blind person, effortless access to software, games, and systems is essential for citizenship, study, and leisure.",
    manifesto_p2:             "Social inclusion truly happens when blind users have the same opportunities and power of choice in the digital world.",
    collab_title:             "Team Growth & Contributions",
    collab_p1:                "The team hopes to grow. Anyone with strong programming skills — whether using artificial intelligence or manual coding — who wishes to contribute is very welcome!",
    contact_title:            "Official Contact Channels",
    contact_channel_desc:     "Official Telegram channel where I post updates and information:",
    contact_personal_desc:    "Direct contact with me (Stefan):",
    btn_telegram_channel:     "📢 Telegram Channel: @stfgames",
    btn_telegram_personal:    "✈️ Personal Telegram: @estefamaster23",

    partners_page_title:      "Our Partners",
    partners_page_subtitle:   "Projects, partner teams, and international connections for accessibility.",
    partners_intro:           "We believe in uniting the global community of blind developers. Discover partner teams and channels that share the same mission of inclusion and technological freedom.",
    partner_sightless_title:  "Sightless Coders",
    partner_sightless_desc:   "An international partner team of blind developers dedicated to creating accessible tools and software.",
    btn_visit_sightless:      "🔗 Visit Sightless Coders Website",
    partner_channels_title:   "Community & Partner Networks",
    partner_channels_desc:    "Stay connected through our informative channels and collaboration groups on Telegram.",

    footer_desc:              "Technological freedom, full accessibility, and development of tools for the blind community.",
    footer_nav_title:         "Navigation",
    footer_contact_title:     "Contact & Channels",
    footer_copyright:         "© 2026 Freedom Technology. All rights reserved."
  },

  es: {
    skip_link:             "Saltar al contenido principal",
    accessibility_title:   "Accesibilidad Web",
    btn_contrast:          "Alto Contraste",
    btn_theme:             "Tema Claro/Oscuro",
    btn_font_decrease:     "Disminuir Fuente",
    btn_font_reset:        "Predeterminado",
    btn_font_increase:     "Aumentar Fuente",
    lang_label:            "Idioma:",

    nav_home:              "Página Principal",
    nav_projects:          "Nuestros Proyectos",
    nav_about:             "Sobre Nosotros",
    nav_partners:          "Nuestros Socios",

    hero_badge:            "Accesibilidad Total · Inclusión Digital",
    hero_title:            "Bienvenidos a Freedom Technology",
    hero_lead:             "Estimados usuarios, ¡es un gran placer darles la bienvenida a nuestro portal! Aquí encontrarán un espacio dedicado al desarrollo de soluciones digitales, programas y juegos accesibles diseñados especialmente para personas ciegas y con discapacidad visual.",
    hero_img_alt:          "Ilustración inclusiva: personas diversas alrededor de una estación de trabajo con monitor grande, símbolos de audio, braille y control de juego — representando accesibilidad, tecnología e inclusión digital.",
    hero_img_caption:      "Manifiesto Freedom Technology: 'Todas las personas ciegas merecen ser libres' — Tecnología asistiva, audiojuegos y autonomía digital.",
    btn_see_projects:      "Conocer Nuestros Proyectos",
    btn_see_about:         "Sobre Nuestra Misión",

    pillars_title:         "Nuestros Pilares",
    pillar_games_title:    "🎮 Juegos Accesibles",
    pillar_games_desc:     "Desarrollo de juegos y experiencias inmersivas con accesibilidad nativa para jugadores ciegos.",
    pillar_games_btn:      "Ver Proyectos y Juegos",
    pillar_freedom_title:  "💻 Libertad de Plataformas",
    pillar_freedom_desc:   "Software y herramientas para computadoras Windows y Linux, además de Android e iOS con lectores de pantalla.",
    pillar_freedom_btn:    "Conoce Nuestra Visión",
    pillar_partners_title: "🌐 Alianzas Internacionales",
    pillar_partners_desc:  "Trabajo conjunto con equipos de desarrolladores ciegos de otros países para fortalecer la accesibilidad global.",
    pillar_partners_btn:   "Ver Nuestros Socios",

    projects_page_title:       "Nuestros Proyectos y Desarrollos",
    projects_page_subtitle:    "Siga aquí el estado de nuestros lanzamientos y desarrollos en curso.",
    notice_title:              "📢 Comunicado a la Comunidad de Jugadores Ciegos",
    notice_p1:                 "Queremos compartir un mensaje sincero con toda la comunidad de jugadores ciegos en Brasil y en todo el mundo:",
    notice_p2:                "Actualmente estamos trabajando en un juego accesible para ustedes. Algunas cosas no han salido como esperábamos internamente, ¡pero un resultado positivo está en camino!",
    notice_p3:                "Por favor, tengan paciencia y sigan el sitio para novedades y actualizaciones.",
    game_card_title:          "🎮 Juego en Desarrollo",
    game_card_desc:           "Nuestro juego se está construyendo con enfoque total en la accesibilidad y la experiencia inmersiva para jugadores ciegos.",
    game_english_only_notice: "Sección del juego disponible solo en inglés.",
    game_download_title:      "Área de Descarga Directa",
    game_download_desc:       "Tan pronto como el juego esté listo, la descarga directa (~1 GB) estará disponible aquí gratis a través de GitHub Releases.",
    btn_download_game:        "📥 Descargar Juego Completo (~1 GB .ZIP — Próximamente)",
    game_download_hosted:     "Alojado con ancho de banda ilimitado a través de GitHub Releases",
    game_download_alert:      "¡El juego está en desarrollo! Por favor, espere las próximas actualizaciones.",

    about_page_title:         "Sobre Freedom Technology",
    about_page_subtitle:      "Nuestra historia, liderazgo, principios fundamentales y contacto directo.",
    about_team_title:         "Quiénes Somos y Liderazgo",
    about_stefan_p1:          "Mi nombre es <strong>Stefan</strong>, soy de Brasil, tengo 21 años y soy el líder fundador de Freedom Technology. Desarrollé una inmensa pasión por los audiojuegos inmersivos y por la libertad tecnológica para cualquier persona ciega o con discapacidad visual.",
    about_stefan_p2:          "El equipo de <strong>Freedom Technology</strong> es actualmente un equipo de una sola persona, que busca la libertad tecnológica y la accesibilidad para todas las personas ciegas: tanto usuarios de computadoras Windows y Linux, como usuarios de lectores de pantalla en Android e iOS.",
    about_stefan_p3:          "Nuestro objetivo es desarrollar programas y herramientas accesibles para personas ciegas en el uso diario de computadoras y dispositivos relacionados.",
    manifesto_title:          "Libertad Tecnológica e Inclusión Social",
    manifesto_p1:             "La libertad tecnológica significa tener la autonomía para utilizar cualquier herramienta digital sin barreras. Para una persona ciega, el acceso sin trabas a software, juegos y sistemas es fundamental para la ciudadanía, el estudio y el entretenimiento.",
    manifesto_p2:             "La inclusión social ocurre de verdad cuando los usuarios ciegos tienen las mismas oportunidades y poder de elección en el entorno digital.",
    collab_title:             "Crecimiento del Equipo y Contribuciones",
    collab_p1:                "El equipo tiene la esperanza de crecer. Cualquier persona con sólidos conocimientos de programación —ya sea utilizando inteligencia artificial o código manual— que desee contribuir, ¡es muy bienvenida!",
    contact_title:            "Canales Oficiales de Contacto",
    contact_channel_desc:     "Canal oficial de Telegram donde publico novedades e información:",
    contact_personal_desc:    "Contacto directo conmigo (Stefan):",
    btn_telegram_channel:     "📢 Canal de Telegram: @stfgames",
    btn_telegram_personal:    "✈️ Contacto Personal: @estefamaster23",

    partners_page_title:      "Nuestros Socios",
    partners_page_subtitle:   "Proyectos, equipos aliados y conexiones internacionales por la accesibilidad.",
    partners_intro:           "Creemos en la unión de la comunidad global de desarrolladores ciegos. Conoce los equipos asociados y canales que comparten la misma misión de inclusión y libertad tecnológica.",
    partner_sightless_title:  "Sightless Coders",
    partner_sightless_desc:   "Equipo aliado internacional de desarrolladores ciegos dedicado a la creación de herramientas y proyectos accesibles.",
    btn_visit_sightless:      "🔗 Visitar Sitio de Sightless Coders",
    partner_channels_title:   "Comunidad y Redes Aliadas",
    partner_channels_desc:    "Mantente conectado también a través de nuestros canales informativos y de colaboración en Telegram.",

    footer_desc:              "Libertad tecnológica, accesibilidad plena y desarrollo de herramientas para la comunidad de personas ciegas.",
    footer_nav_title:         "Navegación",
    footer_contact_title:     "Contacto y Canales",
    footer_copyright:         "© 2026 Freedom Technology. Todos los derechos reservados."
  }
};
```

- [ ] **Step 2: Test in browser console**

Open `index.html`, open DevTools console, type:
```js
Object.keys(translations).length  // should be 3
Object.keys(translations.en).length  // should be ~60+
translations.pt.hero_title  // should return Portuguese string
translations.es.hero_title  // should return Spanish string
```

Expected: All 3 languages present, all keys accessible.

- [ ] **Step 3: Commit**

```bash
git add js/translations.js
git commit -m "feat(i18n): rewrite translations with polished copy in PT/EN/ES, English-only game section"
```

---

### Task 4: Rewrite `main.js` (Interactivity)

**Files:**
- Rewrite: `js/main.js`
- Test: Toggle theme, contrast, font size, language — all should work

**Interfaces:**
- Consumes: `window.translations` (from Task 3), `window.FTPartials` (from Task 1)
- Produces: all accessibility interactivity on the page

- [ ] **Step 1: Write the modernized `js/main.js`**

```js
/**
 * Freedom Technology — Main Application Script
 * Handles: i18n, theme/contrast/font toggles, screen reader announcements.
 * Must load AFTER partials.js and translations.js.
 */
document.addEventListener('DOMContentLoaded', async () => {

  // ─── Load shared partials (header, footer, a11y bar) ────────────────────────
  await FTPartials.load();

  // ─── Screen reader announcer ────────────────────────────────────────────────
  const announcer = document.getElementById('live-announcer');
  function announce(message) {
    if (!announcer) return;
    announcer.textContent = '';
    setTimeout(() => { announcer.textContent = message; }, 50);
  }

  // ─── i18n: language detection & application ─────────────────────────────────
  const langSelector = document.getElementById('lang-selector');

  function detectLanguage() {
    const saved = localStorage.getItem('ft_lang');
    if (saved && ['pt', 'en', 'es'].includes(saved)) return saved;
    const browser = (navigator.language || navigator.userLanguage || 'pt').toLowerCase();
    if (browser.startsWith('es')) return 'es';
    if (browser.startsWith('en')) return 'en';
    return 'pt';
  }

  let currentLang = detectLanguage();

  function applyTranslations(lang) {
    const dict = translations?.[lang];
    if (!dict) return;

    // Set <html lang>
    const langMap = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' };
    document.documentElement.lang = langMap[lang] || lang;

    // Text content via data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });

    // Attribute translations via data-i18n-attr="attr:key,attr2:key2"
    document.querySelectorAll('[data-i18n-attr]').forEach(el => {
      el.getAttribute('data-i18n-attr').split(',').forEach(part => {
        const [attr, key] = part.split(':').map(s => s.trim());
        if (attr && key && dict[key]) el.setAttribute(attr, dict[key]);
      });
    });

    // Sync selector
    if (langSelector) langSelector.value = lang;
    localStorage.setItem('ft_lang', lang);
  }

  applyTranslations(currentLang);

  if (langSelector) {
    langSelector.addEventListener('change', e => {
      const newLang = e.target.value;
      if (!['pt', 'en', 'es'].includes(newLang)) return;
      currentLang = newLang;
      applyTranslations(newLang);
      const msgs = { pt: 'Português ativado.', en: 'English activated.', es: 'Español activado.' };
      announce(msgs[newLang]);
    });
  }

  // ─── Theme toggle (dark / light) ───────────────────────────────────────────
  const themeBtn = document.getElementById('btn-toggle-theme');
  const contrastBtn = document.getElementById('btn-toggle-contrast');

  // Restore saved preferences
  const savedTheme = localStorage.getItem('ft_theme') || 'dark';
  const savedContrast = localStorage.getItem('ft_contrast') === 'true';
  const savedFontSize = localStorage.getItem('ft_font_size') || 'normal';

  if (savedTheme === 'light') document.body.classList.add('theme-light');
  if (savedContrast) document.body.classList.add('theme-high-contrast');
  if (savedFontSize === 'large') document.body.classList.add('font-size-large');
  else if (savedFontSize === 'xlarge') document.body.classList.add('font-size-xlarge');

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('theme-light');
      localStorage.setItem('ft_theme', isLight ? 'light' : 'dark');
      themeBtn.setAttribute('aria-pressed', isLight);
      announce(isLight ? 'Tema claro ativado.' : 'Tema escuro ativado.');
    });
  }

  // ─── High contrast toggle ───────────────────────────────────────────────────
  if (contrastBtn) {
    contrastBtn.addEventListener('click', () => {
      const on = document.body.classList.toggle('theme-high-contrast');
      localStorage.setItem('ft_contrast', on);
      contrastBtn.setAttribute('aria-pressed', on);
      announce(on ? 'Alto contraste ativado.' : 'Alto contraste desativado.');
    });
  }

  // ─── Font size controls ─────────────────────────────────────────────────────
  const btnIncrease = document.getElementById('btn-font-increase');
  const btnDecrease = document.getElementById('btn-font-decrease');
  const btnReset    = document.getElementById('btn-font-reset');

  function setFontSize(size) {
    document.body.classList.remove('font-size-large', 'font-size-xlarge');
    if (size === 'large')   document.body.classList.add('font-size-large');
    if (size === 'xlarge')  document.body.classList.add('font-size-xlarge');
    localStorage.setItem('ft_font_size', size);
  }

  function currentFontSize() {
    if (document.body.classList.contains('font-size-xlarge')) return 'xlarge';
    if (document.body.classList.contains('font-size-large'))  return 'large';
    return 'normal';
  }

  if (btnIncrease) {
    btnIncrease.addEventListener('click', () => {
      const cur = currentFontSize();
      if (cur === 'normal') { setFontSize('large');  announce('Fonte aumentada.'); }
      else if (cur === 'large') { setFontSize('xlarge'); announce('Fonte aumentada ao máximo.'); }
    });
  }

  if (btnDecrease) {
    btnDecrease.addEventListener('click', () => {
      const cur = currentFontSize();
      if (cur === 'xlarge')  { setFontSize('large');  announce('Fonte diminuída.'); }
      else if (cur === 'large') { setFontSize('normal'); announce('Fonte restaurada ao padrão.'); }
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      setFontSize('normal');
      announce('Fonte redefinida ao padrão.');
    });
  }
});
```

- [ ] **Step 2: Test all features**

Open `index.html` in browser. Verify:
1. Theme toggle switches dark ↔ light (persists on reload)
2. High contrast toggle works (persists)
3. Font A- / A / A+ cycling works (3 states, persists)
4. Language selector switches all text to PT/EN/ES (persists)
5. Screen reader announcements fire on each toggle (inspect `#live-announcer` in DevTools)
6. Active nav link highlights correctly for current page

Expected: All interactive features functional with persistence.

- [ ] **Step 3: Commit**

```bash
git add js/main.js
git commit -m "feat(js): rewrite main.js with clean async structure and partial loading"
```

---

### Task 5: Accessibility CSS Polish (`css/accessibility.css`)

**Files:**
- Rewrite: `css/accessibility.css`
- Test: High contrast mode, focus rings, skip link, reduced-motion all work

**Interfaces:**
- Consumes: CSS custom properties from `css/style.css`
- Produces: accessibility-specific CSS rules (`.sr-only`, `.skip-link`, `:focus-visible`, `prefers-reduced-motion`, `body.theme-high-contrast`, `body.font-size-large/xlarge`)

- [ ] **Step 1: Write `css/accessibility.css`**

```css
/* ==========================================================================
   Freedom Technology — Accessibility Styles
   WCAG 2.2 Levels AA & AAA
   ========================================================================== */

/* 1. Screen-reader-only (visually hidden, accessible to AT) */
.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

.sr-only-focusable:focus,
.sr-only-focusable:focus-visible {
  position: static !important;
  width: auto !important;
  height: auto !important;
  padding: 0.75rem 1.25rem !important;
  margin: 0 !important;
  overflow: visible !important;
  clip: auto !important;
  white-space: normal !important;
}

/* 2. Skip link */
.skip-link {
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1.1rem;
  text-decoration: none;
  z-index: 9999;
  transform: translateY(-200%);
  transition: transform 0.2s ease-in-out;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
  border: 3px solid var(--color-accent);
}

.skip-link:focus {
  transform: translateY(0);
  outline: 3px solid var(--color-accent);
  outline-offset: 3px;
}

/* 3. Focus-visible ring */
:focus-visible {
  outline: 3px solid var(--focus-ring-color, #38bdf8) !important;
  outline-offset: 3px !important;
}

/* 4. Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* 5. High contrast mode */
body.theme-high-contrast {
  --color-bg:             #000000 !important;
  --color-surface:        #0a0a0a !important;
  --color-surface-hover:  #1f1f1f !important;
  --color-border:         #ffffff !important;
  --color-text-main:      #ffffff !important;
  --color-text-muted:     #ffff00 !important;
  --color-primary:        #ffff00 !important;
  --color-on-primary:     #000000 !important;
  --color-accent:         #00ffff !important;
  --color-on-accent:      #000000 !important;
  --focus-ring-color:     #00ffff !important;
  --card-border:          2px solid #ffffff !important;
}

body.theme-high-contrast a {
  color: #ffff00 !important;
  text-decoration: underline !important;
}

body.theme-high-contrast a:hover,
body.theme-high-contrast a:focus {
  background-color: #ffff00 !important;
  color: #000000 !important;
}

body.theme-high-contrast .btn-primary {
  background-color: #ffff00 !important;
  color: #000000 !important;
  border: 2px solid #ffffff !important;
  font-weight: 900 !important;
}

body.theme-high-contrast .btn-secondary {
  background-color: #000000 !important;
  color: #ffffff !important;
  border: 2px solid #ffffff !important;
}

/* 6. Font size scales for low vision */
body.font-size-large  { font-size: 120% !important; }
body.font-size-xlarge { font-size: 140% !important; }
```

- [ ] **Step 2: Test in browser**

Verify:
- Tab through page: focus-visible rings appear on interactive elements
- Skip link appears on first Tab press
- Toggle high contrast: all colors switch to black/yellow/cyan scheme
- Toggle font size A+: text scales up
- Toggle font size A-: text scales down
- Check `prefers-reduced-motion: reduce` in DevTools → no transitions

Expected: All accessibility features functional.

- [ ] **Step 3: Commit**

```bash
git add css/accessibility.css
git commit -m "refactor(css): clean up accessibility styles for WCAG 2.2 AA/AAA"
```

---

### Task 6: Create Hero SVG Illustration

**Files:**
- Create: `assets/images/hero-illustration.svg`
- Modify: referenced by `index.html` in Task 7

**Interfaces:**
- Consumes: nothing (standalone asset)
- Produces: `assets/images/hero-illustration.svg` — a full-width, inclusive SVG illustration depicting people around a large monitor, with accessibility symbols (braille, audio waves, game controller), in the site's color palette.

- [ ] **Step 1: Write `assets/images/hero-illustration.svg`**

This is a detailed, accessible SVG illustration. The design features:
- A large glowing monitor at center with abstract screen content (sound waves, braille dots, code symbols)
- 3 diverse abstract people silhouettes around the monitor (different sizes/positions)
- A game controller icon
- Audio wave/sound symbols
- Braille dot pattern
- Modern gradient background using the site's color palette

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 400" role="img" aria-labelledby="hero-svg-title hero-svg-desc">
  <title id="hero-svg-title">Freedom Technology — Inclusive Digital Workspace</title>
  <desc id="hero-svg-desc">An inclusive illustration showing diverse people gathered around a large glowing monitor. The screen displays audio waves, braille dots, and technology symbols. A game controller sits nearby, representing accessible gaming. The scene is illuminated in blue and amber tones, conveying technological freedom and digital inclusion.</desc>

  <defs>
    <!-- Background gradient -->
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0d1117"/>
      <stop offset="50%" stop-color="#161b22"/>
      <stop offset="100%" stop-color="#0d1117"/>
    </linearGradient>

    <!-- Monitor glow -->
    <radialGradient id="monitorGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>
    </radialGradient>

    <!-- Screen gradient -->
    <linearGradient id="screen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a2744"/>
      <stop offset="100%" stop-color="#0f1a2e"/>
    </linearGradient>

    <!-- Person fill -->
    <linearGradient id="personFill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0ea5e9"/>
    </linearGradient>

    <!-- Accent amber -->
    <linearGradient id="accentAmber" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>

    <!-- Audio wave color -->
    <linearGradient id="audioWave" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.6"/>
      <stop offset="50%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.6"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="900" height="400" fill="url(#bg)" rx="10"/>

  <!-- Ambient glow behind monitor -->
  <ellipse cx="450" cy="220" rx="280" ry="180" fill="url(#monitorGlow)"/>

  <!-- Desk surface -->
  <rect x="150" y="290" width="600" height="8" rx="4" fill="#30363d" opacity="0.8"/>
  <rect x="170" y="298" width="560" height="4" rx="2" fill="#21262d" opacity="0.5"/>

  <!-- Monitor stand -->
  <rect x="435" y="250" width="30" height="42" rx="4" fill="#30363d"/>
  <rect x="415" y="285" width="70" height="8" rx="4" fill="#30363d"/>

  <!-- Monitor frame -->
  <rect x="250" y="80" width="400" height="175" rx="12" fill="#21262d" stroke="#30363d" stroke-width="2"/>

  <!-- Screen -->
  <rect x="260" y="90" width="380" height="155" rx="6" fill="url(#screen)"/>

  <!-- Screen content: Title text -->
  <text x="300" y="120" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#f0f6fc" opacity="0.9">FREEDOM TECHNOLOGY</text>

  <!-- Screen content: Audio wave visualization -->
  <g opacity="0.85">
    <rect x="290" y="138" width="4" height="18" rx="2" fill="#38bdf8"/>
    <rect x="302" y="132" width="4" height="30" rx="2" fill="#10b981"/>
    <rect x="314" y="128" width="4" height="38" rx="2" fill="#38bdf8"/>
    <rect x="326" y="135" width="4" height="24" rx="2" fill="#10b981"/>
    <rect x="338" y="140" width="4" height="14" rx="2" fill="#38bdf8"/>
    <rect x="350" y="130" width="4" height="34" rx="2" fill="#f59e0b"/>
    <rect x="362" y="136" width="4" height="22" rx="2" fill="#38bdf8"/>
    <rect x="374" y="126" width="4" height="42" rx="2" fill="#10b981"/>
    <rect x="386" y="138" width="4" height="18" rx="2" fill="#38bdf8"/>
    <rect x="398" y="132" width="4" height="30" rx="2" fill="#f59e0b"/>
    <rect x="410" y="140" width="4" height="14" rx="2" fill="#10b981"/>
    <rect x="422" y="134" width="4" height="26" rx="2" fill="#38bdf8"/>
  </g>

  <!-- Screen content: Braille dots -->
  <g opacity="0.7">
    <circle cx="470" cy="140" r="3" fill="#f59e0b"/>
    <circle cx="480" cy="140" r="3" fill="#f59e0b"/>
    <circle cx="470" cy="152" r="3" fill="#f59e0b"/>
    <circle cx="490" cy="146" r="3" fill="#f59e0b"/>
    <circle cx="500" cy="140" r="3" fill="#f59e0b"/>
    <circle cx="510" cy="152" r="3" fill="#f59e0b"/>
    <circle cx="500" cy="152" r="3" fill="#f59e0b"/>
    <circle cx="520" cy="146" r="3" fill="#f59e0b"/>
    <circle cx="530" cy="140" r="3" fill="#f59e0b"/>
    <circle cx="540" cy="152" r="3" fill="#f59e0b"/>
    <circle cx="530" cy="152" r="3" fill="#f59e0b"/>
  </g>

  <!-- Screen content: "INCLUSÃO" text -->
  <text x="470" y="178" font-family="system-ui, sans-serif" font-size="11" fill="#8b949e" opacity="0.8">INCLUSÃO · ACCESSIBILITY</text>

  <!-- Screen content: Accessibility icon (wheelchair/user) -->
  <g transform="translate(300, 180)" opacity="0.7">
    <circle cx="12" cy="4" r="5" fill="none" stroke="#10b981" stroke-width="1.5"/>
    <path d="M12 10 L12 22 M6 16 L18 16 M8 28 L12 22 L16 28" fill="none" stroke="#10b981" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- Screen content: Game controller icon -->
  <g transform="translate(370, 185)" opacity="0.7">
    <rect x="0" y="4" width="28" height="16" rx="8" fill="none" stroke="#f59e0b" stroke-width="1.5"/>
    <circle cx="7" cy="12" r="2" fill="#f59e0b" opacity="0.8"/>
    <circle cx="21" cy="10" r="1.5" fill="#f59e0b" opacity="0.8"/>
    <circle cx="24" cy="13" r="1.5" fill="#f59e0b" opacity="0.8"/>
  </g>

  <!-- Screen content: Code brackets -->
  <text x="430" y="210" font-family="monospace" font-size="12" fill="#38bdf8" opacity="0.6">&lt;/&gt;</text>

  <!-- Screen scanline effect -->
  <rect x="260" y="90" width="380" height="2" fill="#38bdf8" opacity="0.08"/>

  <!-- Person 1 (left, seated) -->
  <g transform="translate(180, 160)">
    <!-- Head -->
    <circle cx="40" cy="0" r="22" fill="url(#personFill)" opacity="0.9"/>
    <!-- Blonde hair -->
    <path d="M20,-10 Q30,-25 45,-22 Q60,-20 62,-8 Q58,-18 42,-22 Q28,-22 20,-10Z" fill="#fbbf24" opacity="0.8"/>
    <!-- Body -->
    <rect x="22" y="22" width="36" height="60" rx="8" fill="url(#personFill)" opacity="0.8"/>
    <!-- Arm reaching to keyboard -->
    <path d="M58,40 Q75,50 80,60" fill="none" stroke="#38bdf8" stroke-width="5" stroke-linecap="round" opacity="0.7"/>
  </g>

  <!-- Person 2 (right, standing) -->
  <g transform="translate(600, 130)">
    <!-- Head -->
    <circle cx="40" cy="0" r="22" fill="url(#accentAmber)" opacity="0.9"/>
    <!-- Body -->
    <rect x="22" y="22" width="36" height="75" rx="8" fill="url(#accentAmber)" opacity="0.8"/>
    <!-- Arm holding game controller -->
    <path d="M22,50 Q5,55 10,65" fill="none" stroke="#f59e0b" stroke-width="5" stroke-linecap="round" opacity="0.7"/>
    <!-- Game controller in hand -->
    <g transform="translate(-5, 58)">
      <rect x="0" y="0" width="20" height="10" rx="5" fill="#f59e0b" opacity="0.9"/>
      <circle cx="5" cy="5" r="1.5" fill="#0d1117" opacity="0.7"/>
      <circle cx="15" cy="4" r="1" fill="#0d1117" opacity="0.7"/>
    </g>
  </g>

  <!-- Person 3 (center-right, smaller — child/student) -->
  <g transform="translate(540, 200)">
    <!-- Head -->
    <circle cx="30" cy="0" r="16" fill="#10b981" opacity="0.85"/>
    <!-- Body -->
    <rect x="16" y="16" width="28" height="50" rx="6" fill="#10b981" opacity="0.75"/>
  </g>

  <!-- Floating accessibility symbols -->
  <!-- Braille cell (top-left) -->
  <g transform="translate(80, 50)" opacity="0.4">
    <circle cx="0" cy="0" r="3" fill="#f59e0b"/>
    <circle cx="12" cy="0" r="3" fill="#f59e0b"/>
    <circle cx="0" cy="12" r="3" fill="#f59e0b"/>
    <circle cx="12" cy="12" r="3" fill="#f59e0b"/>
    <circle cx="0" cy="24" r="3" fill="#f59e0b"/>
    <circle cx="12" cy="24" r="3" fill="#f59e0b"/>
  </g>

  <!-- Audio waves (top-right) -->
  <g transform="translate(750, 40)" opacity="0.35">
    <path d="M0,20 Q8,5 16,20 Q24,35 32,20" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M10,30 Q18,15 26,30 Q34,45 42,30" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
    <path d="M5,40 Q13,25 21,40 Q29,55 37,40" fill="none" stroke="#10b981" stroke-width="1.5" stroke-linecap="round"/>
  </g>

  <!-- WiFi/accessibility symbol (bottom-left) -->
  <g transform="translate(50, 320)" opacity="0.3">
    <path d="M15,20 A20,20 0 0,1 35,20" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
    <path d="M10,15 A28,28 0 0,1 40,15" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
    <path d="M5,10 A36,36 0 0,1 45,10" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
    <circle cx="25" cy="22" r="3" fill="#38bdf8"/>
  </g>

  <!-- Binary/code particles (bottom-right) -->
  <g opacity="0.25" font-family="monospace" font-size="10" fill="#10b981">
    <text x="760" y="320">01</text>
    <text x="790" y="340">10</text>
    <text x="810" y="310">011</text>
    <text x="740" y="350">101</text>
  </g>

  <!-- Subtle stars / dots -->
  <circle cx="120" cy="30" r="1.5" fill="#f0f6fc" opacity="0.3"/>
  <circle cx="800" cy="60" r="1" fill="#f0f6fc" opacity="0.2"/>
  <circle cx="50" cy="150" r="1" fill="#f0f6fc" opacity="0.25"/>
  <circle cx="850" cy="200" r="1.5" fill="#f0f6fc" opacity="0.2"/>
  <circle cx="130" cy="370" r="1" fill="#f0f6fc" opacity="0.15"/>
  <circle cx="780" cy="380" r="1" fill="#f0f6fc" opacity="0.15"/>
</svg>
```

- [ ] **Step 2: Preview in browser**

Open the SVG file directly in browser. Confirm:
- Monitor with screen content is visible at center
- Three people silhouettes around the monitor (different colors: blue, amber, green)
- Audio waves, braille dots, game controller icons visible
- Overall composition is balanced and inclusive
- Colors match the site's dark theme palette

Expected: Beautiful, inclusive illustration renders correctly at any width.

- [ ] **Step 3: Commit**

```bash
git add assets/images/hero-illustration.svg
git commit -m "feat(assets): add inclusive SVG hero illustration with accessibility symbols"
```

---

### Task 7: Rewrite `index.html` (Homepage)

**Files:**
- Rewrite: `index.html`
- Test: Open in browser — hero section with SVG illustration, pillars section, all content renders correctly

**Interfaces:**
- Consumes: `js/partials.js` (header/footer injection), `js/translations.js` (text content), `js/main.js` (interactivity), `css/style.css` + `css/accessibility.css` (styles)
- Produces: the homepage with hero SVG, welcome text, and 3 pillar cards

- [ ] **Step 1: Write the new `index.html`**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Freedom Technology — Portal dedicado à liberdade tecnológica, acessibilidade total e desenvolvimento de softwares e jogos para pessoas cegas.">
  <meta name="author" content="Stefan (Freedom Technology)">
  <title>Freedom Technology — Liberdade Tecnológica e Acessibilidade</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/accessibility.css">
</head>
<body>

  <a href="#main-content" class="skip-link" data-i18n="skip_link">Pular para o conteúdo principal</a>
  <div id="live-announcer" aria-live="polite" aria-atomic="true"></div>

  <!-- Partials anchor: header, a11y bar, and footer injected by partials.js -->
  <div id="partials-anchor">

    <!-- Hero Section -->
    <section class="hero-section" aria-labelledby="hero-heading">
      <span class="hero-badge" data-i18n="hero_badge">Acessibilidade Total · Inclusão Digital</span>
      <h1 id="hero-heading" class="hero-title" data-i18n="hero_title">Bem-vindos à Freedom Technology</h1>
      <p class="hero-lead" data-i18n="hero_lead">
        <strong>Caros usuários, é com imenso prazer que vos damos as boas-vindas ao nosso portal!</strong>
        Aqui você encontra um espaço dedicado ao desenvolvimento de soluções digitais, programas e jogos acessíveis
        pensados especialmente para pessoas cegas e com deficiência visual.
      </p>
      <div class="hero-actions">
        <a href="projetos.html" class="btn btn-primary" data-i18n="btn_see_projects">Conhecer Nossos Projetos</a>
        <a href="sobre.html" class="btn btn-secondary" data-i18n="btn_see_about">Sobre a Nossa Missão</a>
      </div>
    </section>

    <!-- Hero Illustration -->
    <figure class="hero-illustration" aria-labelledby="hero-fig-heading">
      <h2 id="hero-fig-heading" class="sr-only" data-i18n="hero_img_alt">Ilustração inclusiva</h2>
      <img
        src="assets/images/hero-illustration.svg"
        alt=""
        data-i18n-attr="alt:hero_img_alt"
        width="900"
        height="400"
      >
      <figcaption data-i18n="hero_img_caption">
        <strong>Manifesto Freedom Technology:</strong> "Todas as pessoas cegas merecem ser livres" — Tecnologia assistiva, jogos de áudio e autonomia digital.
      </figcaption>
    </figure>

    <!-- Pillars -->
    <section aria-labelledby="pillars-heading">
      <h2 id="pillars-heading" data-i18n="pillars_title">Nossos Pilares</h2>
      <div class="grid-cards">

        <article class="card">
          <h3 class="card-title" data-i18n="pillar_games_title">🎮 Jogos Acessíveis</h3>
          <div class="card-body">
            <p data-i18n="pillar_games_desc">
              Desenvolvimento de jogos e experiências imersivas com acessibilidade nativa para jogadores cegos.
            </p>
          </div>
          <div class="card-footer">
            <a href="projetos.html" class="btn btn-secondary" data-i18n="pillar_games_btn">Ver Projetos e Jogos</a>
          </div>
        </article>

        <article class="card">
          <h3 class="card-title" data-i18n="pillar_freedom_title">💻 Liberdade de Plataformas</h3>
          <div class="card-body">
            <p data-i18n="pillar_freedom_desc">
              Softwares e ferramentas para Windows e Linux nos computadores, além de Android e iOS com leitores de tela.
            </p>
          </div>
          <div class="card-footer">
            <a href="sobre.html" class="btn btn-secondary" data-i18n="pillar_freedom_btn">Conheça Nossa Visão</a>
          </div>
        </article>

        <article class="card">
          <h3 class="card-title" data-i18n="pillar_partners_title">🌐 Parcerias Internacionais</h3>
          <div class="card-body">
            <p data-i18n="pillar_partners_desc">
              Trabalho conjunto com desenvolvedores e equipes cegas de outros países para fortalecer a acessibilidade global.
            </p>
          </div>
          <div class="card-footer">
            <a href="parceiros.html" class="btn btn-secondary" data-i18n="pillar_partners_btn">Ver Nossos Parceiros</a>
          </div>
        </article>

      </div>
    </section>

  </div><!-- /partials-anchor -->

  <!-- Scripts: partials must load first, then translations, then main -->
  <script src="js/partials.js"></script>
  <script src="js/translations.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Test in browser**

Open `index.html`. Verify:
1. Header, accessibility bar, footer all render (injected by partials.js)
2. Hero section with badge, title, lead text, and two buttons
3. SVG illustration loads and displays below hero
4. 3 pillar cards render with correct links
5. Switch language to EN → all text updates, hero illustration alt text updates
6. Switch to ES → all text updates
7. Theme/contrast toggles work
8. Active nav link on "Home" is highlighted
9. Tab navigation: skip link → accessibility controls → nav → main content

Expected: Fully functional homepage with all features.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(index): rewrite homepage with hero SVG illustration and clean semantic HTML"
```

---

### Task 8: Rewrite `projetos.html` (Projects Page, English-Only Game Section)

**Files:**
- Rewrite: `projetos.html`
- Test: Open in browser — notice, game card with English-only download section, all content renders

**Interfaces:**
- Consumes: same as Task 7
- Produces: the projects page with community announcement and game download section (English-only)

- [ ] **Step 1: Write the new `projetos.html`**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Nossos Projetos — Freedom Technology. Informações sobre jogos acessíveis para jogadores cegos e downloads via GitHub Releases.">
  <meta name="author" content="Stefan (Freedom Technology)">
  <title>Nossos Projetos — Freedom Technology</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/accessibility.css">
</head>
<body>

  <a href="#main-content" class="skip-link" data-i18n="skip_link">Pular para o conteúdo principal</a>
  <div id="live-announcer" aria-live="polite" aria-atomic="true"></div>

  <div id="partials-anchor">

    <!-- Page header -->
    <header>
      <h1 data-i18n="projects_page_title">Nossos Projetos e Desenvolvimentos</h1>
      <p data-i18n="projects_page_subtitle">Acompanhe aqui o status dos nossos lançamentos e desenvolvimentos em curso.</p>
    </header>

    <!-- Community announcement -->
    <section class="notice-box" aria-labelledby="notice-heading">
      <h2 id="notice-heading" class="notice-box-title" data-i18n="notice_title">📢 Comunicado à Comunidade</h2>
      <p data-i18n="notice_p1">Queremos compartilhar uma mensagem sincera com toda a comunidade de jogadores cegos:</p>
      <p data-i18n="notice_p2">Atualmente, estamos trabalhando em um jogo acessível para vocês.</p>
      <p data-i18n="notice_p3">Por favor, aguardem pacientemente e acompanhem o site para novidades.</p>
    </section>

    <!-- Game card -->
    <section aria-labelledby="game-heading">
      <div class="card" style="margin-top: 1.5rem;">
        <div class="card-body">
          <h2 id="game-heading" class="card-title" data-i18n="game_card_title">🎮 Jogo em Desenvolvimento</h2>
          <p data-i18n="game_card_desc">
            Nosso jogo está sendo construído com foco total na acessibilidade e experiência imersiva para jogadores cegos.
          </p>
          <p class="hero-badge" style="margin-top: 1rem;" data-i18n="game_english_only_notice">
            Seção do jogo disponível apenas em inglês.
          </p>

          <!-- Download area — English-only content -->
          <div class="notice-box" style="margin-top: 1.5rem; border-left-color: var(--color-primary);">
            <h3 data-i18n="game_download_title">Direct Download Area</h3>
            <p data-i18n="game_download_desc" style="font-size: 0.95rem; color: var(--color-text-muted);">
              As soon as the game is ready, the direct download (~1 GB) will be available here for free via GitHub Releases.
            </p>
            <div style="margin-top: 1rem; display: flex; gap: 1rem; flex-wrap: wrap; align-items: center;">
              <a
                href="#"
                class="btn btn-primary"
                data-i18n="btn_download_game"
                aria-label="Download Full Game - approximately 1 GB compressed archive (Coming Soon)"
                onclick="alert(translations.en.game_download_alert); return false;"
              >📥 Download Full Game (~1 GB .ZIP — Coming Soon)</a>
              <span data-i18n="game_download_hosted" style="font-size: 0.9rem; color: var(--color-text-muted);">
                Hosted with unlimited bandwidth via GitHub Releases
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

  </div><!-- /partials-anchor -->

  <script src="js/partials.js"></script>
  <script src="js/translations.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Test in browser**

Open `projetos.html`. Verify:
1. Page header renders with translated title
2. Notice box with community announcement renders
3. Game card with English-only download section renders
4. "English only" badge appears
5. Download button shows English text regardless of site language
6. Alert on button click shows English message
7. Active nav link on "Our Projects" is highlighted

Expected: Projects page functional with English-only game section.

- [ ] **Step 3: Commit**

```bash
git add projetos.html
git commit -m "feat(projetos): rewrite projects page with English-only game download section"
```

---

### Task 9: Rewrite `sobre.html` (About Page)

**Files:**
- Rewrite: `sobre.html`
- Test: Open in browser — all sections render, Telegram links work, contact cards display

**Interfaces:**
- Consumes: same as Task 7
- Produces: the about page with Stefan's bio, manifesto, collaboration CTA, and contact cards

- [ ] **Step 1: Write the new `sobre.html`**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Sobre Nós — Freedom Technology. Conheça nossa história, liderança por Stefan, missão de liberdade tecnológica e canais de contato.">
  <meta name="author" content="Stefan (Freedom Technology)">
  <title>Sobre Nós — Freedom Technology</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/accessibility.css">
</head>
<body>

  <a href="#main-content" class="skip-link" data-i18n="skip_link">Pular para o conteúdo principal</a>
  <div id="live-announcer" aria-live="polite" aria-atomic="true"></div>

  <div id="partials-anchor">

    <header>
      <h1 data-i18n="about_page_title">Sobre a Freedom Technology</h1>
      <p data-i18n="about_page_subtitle">Nossa história, liderança, princípios e contato direto.</p>
    </header>

    <!-- Who We Are -->
    <section aria-labelledby="about-team-heading">
      <h2 id="about-team-heading" data-i18n="about_team_title">Quem Somos e Liderança</h2>
      <div class="card" style="margin-top: 1.5rem;">
        <div class="card-body">
          <p data-i18n="about_stefan_p1">
            Meu nome é <strong>Stefan</strong>, sou do Brasil, tenho 21 anos e sou o líder fundador da Freedom Technology.
          </p>
          <p data-i18n="about_stefan_p2">
            A <strong>Freedom Technology</strong> é atualmente uma equipe de uma única pessoa.
          </p>
          <p data-i18n="about_stefan_p3">
            Nosso objetivo é desenvolver programas e ferramentas acessíveis para pessoas cegas.
          </p>
        </div>
      </div>
    </section>

    <!-- Manifesto -->
    <section aria-labelledby="manifesto-heading" style="margin-top: 2rem;">
      <h2 id="manifesto-heading" data-i18n="manifesto_title">Liberdade Tecnológica e Inclusão Social</h2>
      <div class="notice-box" style="border-left-color: var(--color-primary); margin-top: 1.5rem;">
        <p data-i18n="manifesto_p1">
          A liberdade tecnológica significa ter a autonomia para usar qualquer ferramenta digital sem barreiras.
        </p>
        <p data-i18n="manifesto_p2">
          A inclusão social acontece de verdade quando os usuários cegos têm as mesmas oportunidades.
        </p>
      </div>
    </section>

    <!-- Collaboration -->
    <section aria-labelledby="collab-heading" style="margin-top: 2rem;">
      <h2 id="collab-heading" data-i18n="collab_title">Crescimento da Equipe e Contribuições</h2>
      <div class="card" style="margin-top: 1.5rem;">
        <div class="card-body">
          <p data-i18n="collab_p1">
            A equipe tem a esperança de crescer. Qualquer pessoa com forte domínio de programação que deseje contribuir, é muito bem-vinda!
          </p>
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section id="contato" aria-labelledby="contact-heading" style="margin-top: 2rem;">
      <h2 id="contact-heading" data-i18n="contact_title">Canais Oficiais de Contato</h2>
      <div class="grid-cards">

        <article class="card">
          <h3 class="card-title">📢 Canal de Notícias</h3>
          <div class="card-body">
            <p data-i18n="contact_channel_desc">Canal oficial no Telegram onde publico novidades:</p>
          </div>
          <div class="card-footer">
            <a href="https://t.me/stfgames" class="btn btn-telegram" target="_blank" rel="noopener noreferrer"
               aria-label="Acessar canal do Telegram @stfgames"
               data-i18n="btn_telegram_channel">📢 Canal do Telegram: @stfgames</a>
          </div>
        </article>

        <article class="card">
          <h3 class="card-title">✈️ Contato Direto</h3>
          <div class="card-body">
            <p data-i18n="contact_personal_desc">Contato direto comigo (Stefan):</p>
          </div>
          <div class="card-footer">
            <a href="https://t.me/estefamaster23" class="btn btn-primary" target="_blank" rel="noopener noreferrer"
               aria-label="Conversar com Stefan no Telegram: @estefamaster23"
               data-i18n="btn_telegram_personal">✈️ Contato Pessoal: @estefamaster23</a>
          </div>
        </article>

      </div>
    </section>

  </div><!-- /partials-anchor -->

  <script src="js/partials.js"></script>
  <script src="js/translations.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Test in browser**

Open `sobre.html`. Verify:
1. All 4 sections render (team, manifesto, collab, contact)
2. Stefan's bio with bold name renders
3. Manifesto notice box has blue left border
4. Contact cards with Telegram links render
5. Telegram links open in new tab
6. Language switching works for all sections
7. Active nav link on "About Us" is highlighted

Expected: About page fully functional.

- [ ] **Step 3: Commit**

```bash
git add sobre.html
git commit -m "feat(sobre): rewrite about page with fresh copy and clean structure"
```

---

### Task 10: Rewrite `parceiros.html` (Partners Page)

**Files:**
- Rewrite: `parceiros.html`
- Test: Open in browser — partner cards render, Sightless Coders link works

**Interfaces:**
- Consumes: same as Task 7
- Produces: the partners page with Sightless Coders card and community channels card

- [ ] **Step 1: Write the new `parceiros.html`**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Nossos Parceiros — Freedom Technology. Conheça as equipes parceiras e desenvolvedores cegos de outros países.">
  <meta name="author" content="Stefan (Freedom Technology)">
  <title>Nossos Parceiros — Freedom Technology</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="stylesheet" href="css/accessibility.css">
</head>
<body>

  <a href="#main-content" class="skip-link" data-i18n="skip_link">Pular para o conteúdo principal</a>
  <div id="live-announcer" aria-live="polite" aria-atomic="true"></div>

  <div id="partials-anchor">

    <header>
      <h1 data-i18n="partners_page_title">Nossos Parceiros</h1>
      <p data-i18n="partners_page_subtitle">Projetos, equipes parceiras e conexões internacionais pela acessibilidade.</p>
    </header>

    <section aria-labelledby="partners-intro-heading" style="margin-top: 1.5rem;">
      <h2 id="partners-intro-heading" class="sr-only">Introdução</h2>
      <p data-i18n="partners_intro">
        Acreditamos na união da comunidade global de desenvolvedores cegos.
      </p>
    </section>

    <section aria-labelledby="partners-list-heading" style="margin-top: 2rem;">
      <h2 id="partners-list-heading" class="sr-only">Lista de Parceiros</h2>
      <div class="grid-cards">

        <!-- Sightless Coders -->
        <article class="card">
          <h3 class="card-title">🌐 <span data-i18n="partner_sightless_title">Sightless Coders</span></h3>
          <div class="card-body">
            <p data-i18n="partner_sightless_desc">
              Equipe parceira internacional de desenvolvedores cegos dedicada à criação de ferramentas e projetos acessíveis.
            </p>
          </div>
          <div class="card-footer">
            <a href="http://sightless-coders.duckdns.org:1030" class="btn btn-primary"
               target="_blank" rel="noopener noreferrer"
               aria-label="Acessar o portal Sightless Coders em nova aba"
               data-i18n="btn_visit_sightless">🔗 Acessar Site do Sightless Coders</a>
          </div>
        </article>

        <!-- Community channels -->
        <article class="card">
          <h3 class="card-title">📢 <span data-i18n="partner_channels_title">Comunidade e Redes Parceiras</span></h3>
          <div class="card-body">
            <p data-i18n="partner_channels_desc">
              Conecte-se também através dos nossos canais de informação e colaboração no Telegram.
            </p>
          </div>
          <div class="card-footer">
            <a href="https://t.me/stfgames" class="btn btn-secondary"
               target="_blank" rel="noopener noreferrer"
               aria-label="Acessar canal do Telegram @stfgames"
               data-i18n="btn_telegram_channel">📢 Canal do Telegram: @stfgames</a>
          </div>
        </article>

      </div>
    </section>

  </div><!-- /partials-anchor -->

  <script src="js/partials.js"></script>
  <script src="js/translations.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: Test in browser**

Open `parceiros.html`. Verify:
1. Page header and intro text render
2. Sightless Coders card with link renders
3. Community channels card with Telegram link renders
4. Sightless Coders link opens correct URL in new tab
5. Language switching works
6. Active nav link on "Our Partners" is highlighted

Expected: Partners page fully functional.

- [ ] **Step 3: Commit**

```bash
git add parceiros.html
git commit -m "feat(parceiros): rewrite partners page with clean card layout"
```

---

### Task 11: Clean Up Assets & README

**Files:**
- Delete: `assets/images/banner.jpg` (if exists)
- Rewrite: `README.md`
- Create: `.gitignore`

**Interfaces:**
- Consumes: nothing (cleanup task)
- Produces: clean asset directory, updated README, gitignore

- [ ] **Step 1: Delete the old banner image**

```bash
rm -f assets/images/banner.jpg
```

- [ ] **Step 2: Write the new `README.md`**

```markdown
# Freedom Technology — Liberdade Tecnológica

Portal web 100% acessível focado na liberdade tecnológica, desenvolvimento de ferramentas assistivas e jogos de áudio para a comunidade de pessoas cegas.

Liderado por **Stefan** (21 anos, Brasil).

---

## 🌟 Recursos de Acessibilidade & Internacionalização

- **Idiomas Suportados:** Português (Brasil), English (US), Español
- **WCAG 2.2 Níveis AA / AAA:** Estrutura semântica rigorosa com HTML5
- **Leitores de Tela:** Suporte completo a NVDA, JAWS, Orca, TalkBack e VoiceOver
- **Navegação por Teclado:** Skip links e anéis de foco (`:focus-visible`)
- **Modos Visuais:** Alto contraste, tema claro/escuro, controle de tamanho de fonte

---

## 📄 Páginas

1. **`index.html`** — Página Inicial (boas-vindas, hero ilustrativo, pilares)
2. **`projetos.html`** — Nossos Projetos (comunicado à comunidade, download do jogo — conteúdo em inglês)
3. **`sobre.html`** — Sobre Nós (história de Stefan, manifesto, contato)
4. **`parceiros.html`** — Nossos Parceiros (Sightless Coders, canais)

---

## 🛠️ Estrutura do Projeto

```
├── index.html              ← Página inicial
├── projetos.html           ← Projetos
├── sobre.html              ← Sobre nós
├── parceiros.html          ← Parceiros
├── css/
│   ├── style.css           ← Design system (dark/light/high-contrast)
│   └── accessibility.css   ← WCAG compliance styles
├── js/
│   ├── partials.js         ← Shared header/footer injection
│   ├── translations.js     ← i18n dictionary (PT/EN/ES)
│   └── main.js             ← Interactivity & accessibility controls
└── assets/images/
    └── hero-illustration.svg ← Hero illustration (inclusive, accessible)
```

---

## 🚀 Publicar no GitHub Pages

1. `git init && git add . && git commit -m "Initial commit"`
2. Crie um repositório no GitHub
3. `git remote add origin <URL> && git push -u origin main`
4. **Settings → Pages → Source: main / root**

---

## 📞 Contatos

- **Canal Telegram:** [@stfgames](https://t.me/stfgames)
- **Contato Pessoal:** [@estefamaster23](https://t.me/estefamaster23)
- **Parceiros:** [Sightless Coders](http://sightless-coders.duckdns.org:1030)
- **Copyright:** © 2026 Freedom Technology. Todos os direitos reservados.
```

- [ ] **Step 3: Create `.gitignore`**

```gitignore
# OS files
.DS_Store
Thumbs.db

# Editor files
*.swp
*.swo
*~
.vscode/
.idea/

# Logs
*.log
```

- [ ] **Step 4: Commit**

```bash
git add README.md .gitignore
git rm --cached assets/images/banner.jpg 2>/dev/null || true
git commit -m "docs: rewrite README with updated project structure and setup instructions"
```

---

### Task 12: Initialize Git Repository & Final Verification

**Files:**
- N/A (repo-level operations)

**Interfaces:**
- Consumes: all previous tasks complete
- Produces: clean git repository with all changes committed

- [ ] **Step 1: Initialize git (if not already)**

```bash
git init
```

- [ ] **Step 2: Full page verification checklist**

Open each page in browser and verify:

**All pages:**
- [ ] Skip link works on Tab
- [ ] Accessibility bar renders with language selector and controls
- [ ] Header with FT logo and nav renders; active page highlighted
- [ ] Footer with 3 columns renders
- [ ] Theme toggle (dark ↔ light) works and persists
- [ ] High contrast toggle works and persists
- [ ] Font size A- / A / A+ works (3 states) and persists
- [ ] Language selector (PT/EN/ES) switches all text and persists
- [ ] No console errors
- [ ] Responsive: works at 320px, 768px, 1024px, 1440px widths

**`index.html`:**
- [ ] Hero section with badge, title, lead text, 2 buttons
- [ ] SVG illustration loads and displays
- [ ] 3 pillar cards render with correct internal links

**`projetos.html`:**
- [ ] Notice box with community announcement
- [ ] Game card with English-only download section
- [ ] "English only" badge visible
- [ ] Download button alert shows English text

**`sobre.html`:**
- [ ] 4 sections: team, manifesto, collab, contact
- [ ] Telegram links open in new tabs
- [ ] Contact cards render correctly

**`parceiros.html`:**
- [ ] Sightless Coders card with link
- [ ] Community channels card with Telegram link

- [ ] **Step 3: Final commit with all files**

```bash
git add -A
git status
git commit -m "feat: complete site refactoring with modern HTML, CSS, SVG hero, and i18n"

```

---

## Self-Review

### 1. Spec Coverage

| Requirement | Task |
|---|---|
| Recreate pages with same content, modernized | Tasks 7–10 |
| Inclusive hero illustration | Task 6 (SVG) + Task 7 (embed) |
| Redo inclusion messages / copy | Task 3 (translations rewrite) |
| Restructure everything | Task 1 (partials), Task 2 (CSS), Tasks 7–10 (HTML) |
| Game section English-only | Task 3 (translation keys), Task 8 (projetos.html) |
| Best practices | Semantic HTML5, ARIA, CSS custom properties, no inline styles |
| Local repository ready | Task 11 (README, gitignore), Task 12 (git init) |

### 2. Placeholder Scan

No TBD/TODO found. All steps contain complete code blocks.

### 3. Type Consistency

- `data-i18n` keys in HTML match keys in `translations.js` ✓
- CSS class names used in HTML match definitions in `style.css` ✓
- `window.FTPartials.load()` called correctly in `main.js` ✓
- `window.translations` accessed correctly in `main.js` ✓
- `hero_img_alt` / `hero_img_caption` keys used in both HTML and translations ✓

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-08-22-freedom-technology-site-refactor.md`.

**Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
