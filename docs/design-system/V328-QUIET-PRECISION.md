# V3.28 Quiet Precision — research and design rationale
Date: 2026-11-24. Base 7886c83c / V3.27; prior CI succeeded. Maintain green fixed field, five tabs, existing bot assets, financial values, wallet detail and layout. No Android changes.

## Evidence vs forecast
- Yang et al. (2026), https://doi.org/10.1080/10447318.2026.2630289 : controlled eye-tracking/PAD experiments (36 young adults); task-related motion attracted attention; irrelevant motion may distract. Not a field trial or universal duration prescription.
- Huhtala et al., https://cris.vtt.fi/en/publications/animated-ui-transitions-and-perception-of-time-a-user-study-on-an : early appearance of destination influences perceived speed.
- 2026 review: https://www.sciencedirect.com/science/article/pii/S305074132600025X : functional motion categories, restrained meaningful consistent motion.
- NN/g: https://www.nngroup.com/articles/animation-purpose-ux/ and https://www.nngroup.com/articles/animation-duration/ ; https://www.nngroup.com/articles/how-to-test-digital-icons/ : contextual recognition and interpretation.
- Apple: https://developer.apple.com/design/human-interface-guidelines/icons and https://developer.apple.com/design/human-interface-guidelines/materials : optical consistency, material used selectively.
- Chrome: https://developer.chrome.com/docs/modern-web-guidance/guides/ui-behaviors/scroll-entry-exit-effects : prefer transform/opacity, respect reduced motion.
- WCAG https://www.w3.org/TR/WCAG22/ : reduced motion, target size and contrast; complete conformance not asserted.
- Practitioner commentary: https://www.reddit.com/r/UI_Design/comments/1xkqx0w/ai_slop_unsloped/ and https://www.reddit.com/r/UXDesign/comments/1y149dn/vibecoded_ai_slop_examples/ (Nov 2026). Anecdotes, not scientific studies.
2027 prediction: restrained expressive identity + legible data, fewer simultaneous decorative effects, better native behavior. Not an empirically verified future trend.

## Implementation
Original vector navigation family 24-unit grid, optical 21px display, 1.85-unit rounded stroke, stable labels. Megaphone for Ads, chart for expenses, home, payment card, checked document. Sun instead of ambiguous sparkle for light theme. Preserve 58px dock and 44px touch heights. Shared micro-motion timings 120/180/240/280ms; no page translation on every rerender; keep existing expressive card morphs and gesture behavior. One rAF scroll chrome update, stable green, no forced scrolling/parallax; subtle separation line. Canvas IntersectionObserver skips offscreen paints and reuses canvas on preference change. No performance benchmark claimed. Static styles reduce competing shadows and improve weekly legends. Existing infinite assets remain; a comprehensive user-facing pause policy and real-device profiling are follow-up work.

## QA
Playwright four widths × two themes × five tabs, glyph link/weight, stable background, responsive widths and canvas deduplication. Screenshots at 390px. Test results required before claiming validated. Human usability and icon recognition testing not yet performed.
