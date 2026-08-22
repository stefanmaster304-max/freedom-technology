# Freedom Technology — Technological Freedom & Accessibility

A fully accessible web portal dedicated to technological freedom, assistive tools, and audio games for the blind community.

Led by **Stefan** (21, Brazil).

---

## Features

- **100% English** — Clean, accessible content for a global audience
- **WCAG 2.2 AA/AAA** — Semantic HTML5, proper ARIA, focus management
- **Screen reader support** — NVDA, JAWS, VoiceOver, TalkBack, Orca
- **Keyboard navigation** — Skip links, visible focus rings, logical tab order
- **Visual modes** — Dark (default), Light, High Contrast
- **Font scaling** — Three sizes: default, large, extra-large
- **Reduced motion** — Respects `prefers-reduced-motion`
- **No dependencies** — Pure HTML/CSS/JS, zero build tools, zero CDN
- **Responsive** — Works from 320px to 4K

---

## Pages

| Page | Description |
|------|-------------|
| `index.html` | Homepage — hero illustration, welcome, three pillars |
| `projetos.html` | Projects — community announcement, game in development |
| `sobre.html` | About — Stefan's story, manifesto, contact |
| `parceiros.html` | Partners — Sightless Coders, community channels |

---

## Structure

```
├── index.html                Homepage
├── projetos.html             Projects
├── sobre.html                About
├── parceiros.html            Partners
├── css/
│   ├── style.css             Design system (dark/light/high-contrast)
│   └── accessibility.css     WCAG compliance styles
├── js/
│   ├── partials.js           Shared header/footer injection
│   └── main.js               Interactivity & a11y controls
└── assets/images/
    └── hero-illustration.svg Inclusive SVG hero illustration
```

---

## Deploy to GitHub Pages

```bash
git init && git add . && git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

Then: **Settings → Pages → Source: main / root**

---

## Contact

- **Telegram Channel:** [@stfgames](https://t.me/stfgames)
- **Personal Telegram:** [@estefamaster23](https://t.me/estefamaster23)
- **Partners:** [Sightless Coders](http://sightless-coders.duckdns.org:1030)

**Copyright:** © 2026 Freedom Technology. All rights reserved.
