# V3.34 — Frame Coherence
Base: V3.33 on main (4b5fd260223a07675ca6237000fceea7dff7ffa6), V3.28 Quiet Precision lineage only. Scope /v2.html; index.html/V9.xx excluded.

## Recording evidence
Source: 20261124-1641-52.4877943.mp4, 452×838, 30 fps, 1172 decoded frames, 39.066633 s. Frame indexes zero-based. All frames processed for mean grayscale interframe change; contact sheets at 30-frame cadence and denser 5–10-frame samples of transitions reviewed visually. Not a human inspection of each full-resolution frame, and compression prevents rigorous contrast measurement from recording. Approximate intervals:
- 0–78 / 0–2.6s: compact bots appear after initial blank; retain approved artwork.
- 84–96 / 2.8–3.2s: financial flow control crosses greeting while hero height interpolates; opaque transition blob obscures target.
- 120–156 / 4.0–5.2s: switching to spending leaves excess stage space and low-contrast inactive tabs.
- 162–192 / 5.4–6.4s: refund morph and delayed reveal; repeated stagger makes information late.
- 210–335 / 7–11.2s: goal/refund card footer wraps and scroll edge appears as white stripe; transaction spacing.
- 360–525 / 12–17.5s: category transitions and calendar dates with weak contrast; distinguish future days.
- 540–660 / 18–22s: expense replay and period state, stable exact amounts retained.
- 690–760 / 23–25.3s: repeated decorative blooms and generic review orb, no category meaning.
- 780–870 / 26–29s: large wallet blank region, shared card lands while header/summary fade from zero, arrows and cards remain original.
- 990–1171 / 33–39.03s: green dark theme merges background and cards, repetitive bloom; stronger reading hierarchy required.

## Implemented
Measured disclosure heights replace monotonically growing 360/376px reserve. Stage reserves destination during flight to avoid live controls crossing greeting; controls temporarily hidden and inert to pointer during motion, one 160ms content reveal, reverse holds stage. This chooses immediate layout reservation over the old simultaneous height tween; shared element remains animated. Preserve 49-keyframe flight and original artwork. Existing spending card/chips use darker ink. 
Dark base moves to neutral forest charcoal #101713, fixed 278px atmosphere remains constant across tabs, soft edge replaces hard stripe, reading films preserved. Strengthen inactive calendar and secondary text, remove decorative overview/offer glows, separate review categories using tag/transfer/duplicate glyphs, preserve original category animated WebP. Microbot lifecycle settles on reduced-motion/background/error and optical boxes match. Wallet destination sections visible immediately; only card travels. Preserve 44px toolbar, 58px dock, 21px nav glyph, financial ledger and demo status.
Research: Apple HIG Materials https://developer.apple.com/design/human-interface-guidelines/materials ; Scroll views https://developer.apple.com/design/human-interface-guidelines/scroll-views ; NN/g https://www.nngroup.com/articles/animation-purpose-ux/ and https://www.nngroup.com/articles/animation-duration/ ; WCAG 2.2 https://www.w3.org/TR/WCAG22/. Guidance supports readable material, meaningful motion, and contrast targets, not specific mandated NexaPag colors or timings.

## QA gates
Prior main V3.33 had 137 browser tests passed. New frame samples assert no visible controls overlapping greeting and bounded final gap at 320/390/430, dark/light field invariance, semantic review glyphs. Re-run all existing tests and inspect generated screenshots/traces before merge. No new actual-device capture, no Android changes, no new generated animated asset. No claim of full WCAG conformance.
