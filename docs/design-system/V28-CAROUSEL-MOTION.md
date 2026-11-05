# NexaPag V2.8 · Reference MP4 background motion
- Extracted three distinct reference materials from 20261105-2130-24.0806667.mp4: coral silk, lavender ripple with floating orb, chartreuse folded-silk waves. Source captions and frame boundaries were cropped away.
- Three looping 30fps motions use forward/backward mirrored timing to avoid a visible cut at the end of the source. Original cropped 320×290 material is interpolated into 384×250 video for small carousel surfaces.
- Each slide ships WebM and MP4 fallback, plus WebP poster. All asset media totals under 190 KB.
- Material color grading follows card semantics, with per-theme gradient overlays to keep finance labels readable.
- Videos play only while the home carousel is expanded and page visible, pause when collapsed or switching tabs, and are hidden for prefers-reduced-motion.
- UX checks: 320, 390, 1440 px, no runtime exceptions, horizontal overflow 0, media decoded/played, and all three paused on collapse.
- Other modules (spending category morphs, weekly liquid orbs, refunds, goal, wallets, five-tab dock) are unchanged. Android app remains untouched.
