# V3.36 — Human Motion System
Exclusive lineage: V3.28 Quiet Precision via V3.33–3.35. Target /v2.html. No V9.xx changes.

## Evidence and limits
Huhtala et al. CHI 2010, Animated UI transitions and perception of time: https://cris.vtt.fi/en/publications/animated-ui-transitions-and-perception-of-time-a-user-study-on-an/ — earlier presentation of the destination dominated perceived speed in the studied mobile image transitions.
Kraft & Hurtienne 2017: https://doi.org/10.1145/3098279.3098566 — lightweight transitions can aid orientation in the tested mobile interfaces.
Yang et al. 2026: https://doi.org/10.1080/10447318.2026.2630289 — eye-tracking/PAD study, task-relevant motion directs attention, irrelevant motion can distract. Not evidence that one duration works for every user.
2026 review: https://www.sciencedirect.com/science/article/pii/S305074132600025X — motion design relates timing, perception and functional purpose.
NN/g: https://www.nngroup.com/articles/animation-duration/ — typical 100–500ms range, dependent on distance and complexity.
Apple HIG: https://developer.apple.com/design/human-interface-guidelines/motion — feedback, consistency and interruptibility.
Android physics-based motion: https://developer.android.com/distribute/aep/aep-req-physics-based-motion and Android Views SpringAnimation https://developer.android.com/develop/ui/views/animations/spring-animation — continuous velocity on gesture retargeting; future native implementation without Compose.
Rendering: https://web.dev/articles/animations-overview and https://web.dev/articles/animations-guide — avoid expensive layout/paint when transform/opacity are sufficient.
WCAG: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions — nonessential interaction motion can be disabled (AAA).
Reddit practitioner discussion https://www.reddit.com/r/UXDesign/comments/1vepfxe/do_you_find_product_microanimations_useful_or/ and https://www.reddit.com/r/UXDesign/comments/1l028zi — contextual microinteractions versus excess; anecdotal, not scientific proof.

## Motion contract
All durations ms, never frame-count dependent. Feedback 120, local state 160, tab 160, disclosure 240, carousel 320, wallet shared card 400/340, expression 360, chart replay 520, signature orb open/close/switch 540/440/420, reveal at 50% of the animation clock. First-visit visible microbot stagger 40ms capped 120ms. Maintain 49 authored/interpolated WAAPI keyframes; display refresh is independent. Asset WebP frame counts unchanged. Timing choices are initial product hypotheses, not a validated human preference ranking.
Discrete arrival cubic-bezier(.16,.84,.24,1); no decorative overshoot for amounts, text or cards. Morph shape preserved. Rapid requests during an opening can finish the current flight before processing queued intent, rather than waiting its full duration; this is fast-forward/handoff, not velocity-preserving spring physics. Controls remain protected during geometry-changing flight. Reduced motion settles to usable state.

## Integration audit
Home: preserve anchored atmosphere and approved shapes; reveal via Animation.currentTime, cancel stale reveal RAF, pause background media; only current carousel video plays. Keep 320px measured stage and prior gap assertion.
Expenses: retain categories/calendar DOM and focus on period selection; immediately render accurate numbers and graph, explicit replay only for chart, cancel mini-rhythm via WAAPI, no repeated category autoplay per session. The earlier CI #161 had four failures (68px overflow in .spending-chart at all widths): remove protruding decorative pseudo-element; also eliminate invisible overview/offer ornaments, keep wallet summary bloom inside panel. No weakening overflow checks.
Ads: brief CTA feedback, local toast, preserved composition; external integrations still demo/unconnected.
Cards: 320ms deck position, 400/340ms shared flight, 160ms outgoing content fade; keep live context and existing brand assets. Native spring migration remains separate; current deck still uses timed CSS phases.
Review: update row and remaining count in place, check glyph feedback, no whole-page render. Status announced by live region, completed action disabled. Demo events unchanged.

## Validation and future research
New Playwright coverage checks period identity/focus, exact amount, chart offset, reduced-motion interruption, ads demo feedback, wallet visibility and in-place review completion, and WAAPI duration/keyframes. Earlier #161: 142 passed, 4 failed. #161 V3.34 narrow gap tests passed; current revision needs full CI and screenshot inspection. Do not claim real-device frame rate or human preference validated. Suggested device study: counterbalanced A/B timings with actual Android devices at 60/90/120Hz; record interaction latency, missed frames, task completion, error rate, comfort and preference; include reduced-motion users. Frame budgets approximately 16.7/11.1/8.3ms respectively, not fixed simulation steps. No Android Kotlin changes or new assets in this PR.
