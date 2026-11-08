# NexaPag V3.20 · In-Place Wallet Pocket Motion
Source: user's 1000267920.mp4, 864×1920, 24 fps, 8.96 seconds. The reference shows a dark stitched sleeve with three card edges, a tapped card lifting vertically, and repeated selection of different cards. The existing NexaPag wallet has bank-specific folders and a modal detail. This revision adds the directly interactive pocket as the **primary** wallet section, preserving all four bank folders and their original modal for legacy workflows.

## Motion contract
- Collapsed: all cards remain behind the stitched pocket with tinted upper edges visible.
- Press a card or selector: active card lifts ≈95px; other cards return to a shallow stack; easing cubic-bezier(.18,.88,.22,1), 780ms. No full-page route change, modal or fake bank balance.
- Select a different card: card order and elevation interpolate in one CSS transition, without replacing the DOM node.
- Input: touch swipe horizontally, card press, 3 dots, arrow controls, ArrowLeft/ArrowRight/Home/End, focus support, reduced motion, live announcements.
- Finance: Nubank Ultravioleta •4821, Itaú Personnalité •7310, Inter Black •2044. No invented account/card balance, spend limits or card transactions.
- Primary palette respects NexaPag's forest dark matte, with each original bank color used only on the individual card.
- The selected card summary below updates in place, retaining the five dock tabs and existing category tracking.

## QA
Screen widths 320/390/430, dark/light, pointer gesture, keyboard navigation, reduced-motion, existing bank-folder open/close and card selection.