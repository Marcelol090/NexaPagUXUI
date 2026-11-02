# NexaPag UXUI 9.21 · Motion & Art Direction Contract

**Status:** Implemented in PR 9.21 branch; not the Android UI; UXUI is a Vite/GSAP/Canvas prototype with illustrative transactions. This document describes actual controls and required acceptance gates.

## Signature of the visual experience
Forest matte creates distance. Acrylic cards are visual foreground. Category pigments convey accounting data. Liquid stays inside analytical bubbles. Do not multiply glass effects across offers, toolbar actions or transaction rows.

### Rules against generic AI-style compositions
- If removing the NexaPag wordmark makes the screen interchangeable with an arbitrary SaaS dashboard, restore product-specific decisions (weekly financial goal, heatmap, transaction context), not additional glow.
- Every border radius, glyph, shader or motion transition must help scan, group, choose or understand a financial value.
- Glass on a card is acceptable **only if** data remains readable through all phases of the shader.
- Do not display fake “live” partner catalog values as actual deals. All values in this UXUI lab are illustrative.
- Never animate 10+ transaction cards on each tab switch, rotate unrelated icons, or place LiquidOrbs in product discovery.
- Preserve original typography, Wood/Sage/Forest pigments, finance semantics (expense/red, income/green, refund/yellow) and five route labels.

## Motion scale · actual Workbench controls
| Preset | Duration | Stagger | Vertical travel | Hover lift | Compression |
|---|---:|---:|---:|---:|---:|
| Sutil | 160 ms | 12 ms | 3 px | .5 px | 1% |
| Equilibrado (default) | 220 ms | 18 ms | 6 px | 1 px | 1.5% |
| Expressivo | 300 ms | 28 ms | 8 px | 2 px | 2% |

The Workbench retains fully editable controls. The explicit bounds are: duration 90–400ms, stagger 0–50ms, travel 0–12px, lift 0–4px, press 0–3%; silhouette, geometry, shadow and ambient shader controls remain separate.

### Choreography budget
- Maximum **6 visual surfaces** in one tab change. A large transaction list must never enter the choreography.
- Every one-shot preview completes in at most **500 ms**, dynamically reducing delay between items if needed.
- Changes in app state use subdued opacity + short translation; never a perpetual glow on static financial status.
- Presets do not reset phone geometry or overwrite the Material Engine glass calibration.
- Default card shadow unchanged until the user explicitly edits the shadow control.
- `prefers-reduced-motion`, pause and background tab stop decorative replay; the information remains intact.
- Forest shaders and LiquidOrb physics retain their own animation budgets and independent pause logic.

## Why these decisions
Material 3 and IBM Carbon describe motion as continuity and causal feedback, not blanket decoration. Svelte 5 supports FLIP and Web Animations API, but this Vite implementation already has a lightweight real-component preview. A new framework dependency would increase complexity without a demonstrated need.

- Material motion: https://m3.material.io/styles/motion/easing-and-duration/tokens-specs
- Carbon choreography: https://carbondesignsystem.com/elements/motion/choreography/
- Svelte transition WAAPI/reduced motion: https://svelte.dev/docs/svelte/transition
- Source-grounded design critique: https://notlikeus.art/

Reddit discussions provide useful qualitative critique of generic layouts and overanimation but are not a replacement for usability tests or technical standards.

## Before promoting to production
```sh
npm install --no-audit --no-fund
npm run check:syntax
npm run test:design
npm run check:impact
npm run build
npm run test:e2e
```

QA includes Workbench on desktop 1920×1080 / 1366×768, mobile 390/320px, controls actually changing computed component states, five-tab data continuity, empty/reduced-motion, no horizontal overflow, and screenshot comparisons.

**The Graphify service was not available in this session (zero authorized workspaces).** The local graph artifact is a dependency check, not a substitute for a Graphify index.
