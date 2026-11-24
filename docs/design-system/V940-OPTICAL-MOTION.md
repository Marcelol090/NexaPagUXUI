# Visualize 9.40 — Optical Motion & Glyph System
## Scope
Production target is the root of https://nexapaguxui.vercel.app/ (source index.html). Do not use v2.html or PR #27 as design baseline. No Android, API, database, or live finance integration changes.
## Architecture
- Lumen, Verdi, Forest and Emerald fields remain device-level siblings of the scrolling surface. Scroll never changes field coordinates, opacity, shader variables or layout.
- Passive scroll event + a single scheduled requestAnimationFrame updates only a clamped optical edge (0–48px). Header remains compact, without a duplicate blur layer.
- Existing dock stays icon-only by approved 9.38 contract, with accessible names and aria-current. Five 48px targets, new 23px glyphs on a 24-unit grid, rounded 1.85 stroke. Section glyphs are semantic, category pigment remains on the icon and surface rather than a redundant tile.
- On real tab change only, 180ms heading animation and 240ms glyph settle; no opacity/transform on screenContent (a backdrop root would break acrylic sampling). Local re-render suppresses repeated chart reveal. Existing financial face, orb canvas and ranking engine remain.
- Both Workbench no-motion and OS reduced-motion guard new transitions, including interrupting active financial replay. No scrolling animation forced by the update.
- Lumen hero film increased from glass-opacity × .80 to × .94; metrics from × .86 to × .96. Hero filter remains Workbench-controlled, with moderated saturation. Respect no-optics, flat-glass, reduced-transparency and high-contrast fallbacks. Category gradient strength remains unchanged.
- Demonstration transactions now classify expense, income and refund independently. Refund uses amber and its own return glyph, not income green. Filtered samples do not claim to add up to total model values.
## Research rationale
Lightweight orientation motion: Kraft & Hurtienne (MobileHCI 2017), https://doi.org/10.1145/3098279.3098566 ; restrained parallax: https://www.nngroup.com/articles/parallax-usability/ ; touch target guidance: https://developer.android.com/guide/topics/ui/accessibility/views/apps-views ; icon recognition: https://www.nngroup.com/articles/icon-usability/ ; accessibility: https://www.w3.org/TR/WCAG22/. Chosen timing/film coefficients are design hypotheses, not proven optimal values. The icon-only layout is an intentional existing product constraint; test recognition with users before any future change.
## QA
Root route tests at 320, 390, 430 and 1440 CSS px, five tabs, scroll-field invariance, glyph bounds, semantic filters, reduced motion, Workbench controls. Previous root regressions retained with release title updated. Test on a real Android device and measure frame timings/contrast before porting. CI must pass before merge; no deployment claim.
