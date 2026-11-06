# V3.8 · Production bundling fix
## Confirmed root cause from CI, 06 Nov 2026
Vite logged: `<script src="./assets/nexapag-orb-motion-35.js"> in "/v2.html" can't be bundled without type="module" attribute`. As a result the JS existed in git but never shipped to dist. The screenshot/video showed the old carousel transition because the actual orb click interceptor did not exist on the deployed page.
## Fix
Load `assets/nexapag-orb-motion-35.js` through `<script type="module">`, so Vite/Rollup compiles it into dist and v2.html references its output. CI build checks controller fingerprint and linked entry. End-to-end test asserts `window.NexaOrbFlowV35` is defined and 16-frames/three-orb actions work.
## Visual continuity
Stable 76–90px orb geometry, no outer scale drift. Internal refraction continues. Existing FLIP-like ghost remains from V3.7, plus accessible reduced motion, dark/light and original 5-tab structure.