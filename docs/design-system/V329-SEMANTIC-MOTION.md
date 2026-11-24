# V3.29 — Semantic Motion / Research-driven design
Scope: v2.html only, on top of V3.28 Quiet Precision. No Android/Kotlin, API or ledger changes.
## Evidence and limits
- Kraft & Hurtienne, MobileHCI 2017: lightweight orientation transitions can help mental models, without additional time or workload in their study. https://doi.org/10.1145/3098279.3098566
- Motion design review 2026: https://www.sciencedirect.com/science/article/pii/S305074132600025X
- Murano & Pandey 2024: parallax preferences and task times did not differ significantly; no claim of superior usability. https://doi.org/10.1007/978-3-031-76821-7_9
- NN/g on parallax and icon semantics: https://www.nngroup.com/articles/parallax-usability/ ; https://www.nngroup.com/articles/icon-usability/
- Apple scroll-edge material: https://developer.apple.com/videos/play/wwdc2025/219/
- Google expressive design research: https://design.google/library/expressive-material-design-google-research
- WCAG 2.2: https://www.w3.org/TR/WCAG22/ ; Android Views touch targets: https://developer.android.com/guide/topics/ui/accessibility/views/apps-views
- Community observations (not empirical studies): https://www.reddit.com/r/UI_Design/comments/1xkqx0w/ai_slop_unsloped/ ; https://www.reddit.com/r/UXDesign/comments/1ut0n4d/what_makes_design_obvious_as_ai_created/
## Decisions
1. Keep the 278px fixed green atmospheric field in both themes. Scroll updates only the optical edge opacity, clamped to y/48, using the existing passive scroll listener and rAF. No scroll-jacking, additional animated blur, or content translation.
2. 160ms near-opaque crossfade on true tab changes only; no whole-page entry on filtering or rerender. Existing orb, wallet, graph and carousel choreography retained. Reduced-motion disables new tab animation.
3. 21px navigation glyph, 24-unit vector geometry, 1.85-unit new symbol stroke, round cap/join, stable label and 48px minimum target on dock; preserve 44px top toolbar. No generic sparkle for goals, calendar or offers. Receipt, transfer and refund are distinct. Refund uses amber rather than an outgoing red amount. Original bank and category assets retained.
4. No blanket recoloring or new decorative tiles. Contrast tokens for financial glyphs in light and dark. Numeric tabular figures. Small selective glyphs on actionable section headings.
5. Proposed future work (not included): component-level optical material consolidation, independently benchmark existing orb playback, icon recognition study with real users, Android Views port. 2027 trends are hypotheses, not validated outcomes.
## QA
Existing V3.27 persistence tests retained. New tests across 320/390/430/1440, both themes, five tabs, SVG bounds, targets, semantic transaction glyphs and reduced motion. CI required before merging; no actual-device claim. Aim for AA text contrast 4.5:1, essential non-text contrast 3:1, 16.7ms/60Hz or 8.3ms/120Hz frame budget. Measure contrast against actual composited backgrounds and profile Android separately.

## Regression correction
CI run 45425511823: 119 passed, 11 failed. All 11 reported first failures were caused by changes to approved 44px toolbar targets or 21px dock glyphs. Restore those dimensions rather than relaxing legacy assertions. New browser run required.
