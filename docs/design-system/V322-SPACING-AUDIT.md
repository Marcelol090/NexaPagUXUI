# V3.22 — spacing & visual rhythm

Base: 52ec81c9 (V3.21.6). Keep V2.8 layout anatomy and all current financial data, motions, wallet pocket transforms, bot assets, carousel and navigation. Add one opt-in static-content CSS layer, preserving all earlier styles for baseline captures.

Tokens: 4/8/12/16/24/32 CSS px. Body 12px, captions 10–11px, section titles 16px; tabular numbers and controlled responsive wrapping. Use green semantic color tokens independently for light and dark. Controls in section headers have 44px minimum height. Cards keep approved radius and materials. A container query—not viewport alone—handles small handset widths.

References: https://developer.apple.com/design/tips/ ; https://developer.apple.com/design/human-interface-guidelines/layout ; https://support.google.com/accessibility/android/answer/7101858 ; https://elements.envato.com/learn/ux-ui-design-trends .

QA: Playwright covers 320, 390, 1440px × light/dark × five tabs; captures all screens, 390px before/after toggling the spacing attribute, expanded categories, writes measured metrics. Baseline CI 42530971474 had 92 passed and four pre-existing wallet-pocket failures. Do not claim those failures are resolved by typography/spacing. No Android or root Visualize changes.
