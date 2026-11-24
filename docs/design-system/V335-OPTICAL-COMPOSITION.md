# V3.35 — Optical Composition
Exclusive lineage: V3.28 Quiet Precision → V3.33 → V3.34 → V3.35, /v2.html. No V9.xx changes.

## Diagnosis
The previous V3.34 CI #155 completed with 141 passed, 1 failed: at 320px the final disclosure gap was 59px (maximum 30px). A narrow-screen rule on #heroRegion assigned --orb-stage-height locally, overriding the measured parent value; a minimum 280px stage also created unnecessary reserve. Both are addressed by measuring actual content plus 8px and writing the measured value directly to the stage. Existing 49-frame morphs retained. Do not weaken the regression assertion.

Static inspection found accumulated 10/12/13/14/16px insets, different card radii, independent financial footer flow, row padding that changes by module, and inherited SVG weights. These are normalized by role, not by centering every piece of content.

## Research and design decisions
- Android grid guidance: https://developer.android.com/design/ui/mobile/guides/layout-and-content/grids-and-units (8dp underlying grid, responsive adaptation).
- Apple layout and icon guidelines: https://developer.apple.com/design/human-interface-guidelines/layout and https://developer.apple.com/design/human-interface-guidelines/icons (alignment, hierarchy, optical padding).
- NN/g proximity: https://www.nngroup.com/articles/gestalt-proximity/ (group related content through spacing).
- WCAG 2.2 https://www.w3.org/TR/WCAG22/ and non-text contrast https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast (legible controls; decorative edges are not automatically required to be 3:1).
These support principles; the concrete dimensions below are NexaPag design choices, not universally proven optimal.

## Composition contract
Shared content rails unchanged. Main cards: 22px radius, 1px keyline, 16px inner padding (12px narrow), 12px gaps (8px narrow), 24px between sections. Inner panels 14px radius; small controls 12px. Separators are quieter than outer edges. No generic thick borders or repeated shadow stacks. Preserve bank art, orb contours and existing 44px toolbar, 58px dock, 21px nav glyph and 48px dock hit areas.
Section icon 18px; navigation/review 21px; transaction tile 36px / glyph 18px; offer tile 40px / glyph 20px. SVG icon symbol outlines normalized from 2 to 1.85 on existing shared symbol set. Optical center here means aligned bounding boxes; individual path perceptual balance still requires rendered inspection.
Money-insight cards use shared header/amount/body/track/footer rows and a hidden layout placeholder for refund (not a fake progress bar). Transactions use icon/copy/value grid; amounts retain right alignment, semantic colors, tabular figures. Category rows keep 44px microbots and independent amount and chevron columns; 320px wraps to two rows without clipping. Calendar columns share grid and centered bars. Offer/review text grouped by proximity; wallet folders retain brand-specific materials and content rails.
 
## QA
New Playwright spec checks 4 viewport widths, 2 themes, all 5 tabs: symmetric rails, radius/edge thickness, card overflow, equal financial card heights/amount alignment, review glyph center within 1px; captures 390px screenshots. Retain all previous tests, including the 30px disclosure gap cap. Static JS parse and CSS braces checked. Actual browser run, screenshot inspection and Android device QA are outstanding at submission. Native resource migration not in scope.
