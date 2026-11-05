# NexaPag V2.6 | Microbot Liquid Morph
Four image-generated translucent morph animations are used directly as 9-frame animated WebP assets, each with a static last-frame PNG for a stable finish.

| Category | Opening form | Final icon | Palette |
|---|---|---|---|
| Alimentação | rounded droplet | fork + spoon | coral/apricot |
| Compras | rounded rectangle | shopping bag | lavender/violet |
| Transporte | rounded triangle | car | teal/mint |
| Casa | roof-like pentagon | home | raspberry/rose |

Playback: nine frames × 160ms (1440ms); first animation triggered when its expense card enters the scroll viewport via IntersectionObserver, with original 110ms stagger. User tap replays independently. At ~1350ms, a brief crossfade hands over to the last-frame static asset. Reduced-motion users see the final PNG without animation.

Icon artwork fits visually inside a 44x44px interactive target; old 24px outline remains a fallback if the PNG fails. Retains original data, wallet, orbs, and five fixed navigation tabs.

Assets are local under public/assets; no runtime CDN dependency. Chrome local QA used 320px, 390px, 1440px plus reduced-motion; added Playwright regression tests.