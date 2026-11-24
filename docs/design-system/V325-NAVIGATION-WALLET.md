# V3.25 / Navigation & Wallet polish

- One moving dock selection with always-visible labels; stable equal-width destinations. Compact visual controls with 44px hit areas, 1px borders, 1.8px glyph stroke, 4/8/12/16/24px spacing.
- Native centered wallet carousel, keyboard and mouse drag, bounded controls, scroll-settled selection rather than a fixed timeout lock. Animated reverse shared element restores original stack state and fades outgoing detail.
- Keep actual bank identities; missing per-card values remain unavailable. Preserve original video backgrounds, orbs, light/dark themes and V2.8 structure.
- Guidance: https://developer.apple.com/design/human-interface-guidelines/tab-bars ; https://developer.chrome.com/docs/modern-web-guidance/guides/ui-components/carousel ; https://www.w3.org/WAI/tutorials/carousels/ .
- Previous CI: 105 pass, 3 fail in pocket position test; fix actual page entrance movement and measure relative to stationary scene. New tests capture light/dark detail and check centering, button widths and return.
