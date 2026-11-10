# Banner carousel

## Requirements and plan
- Auto-advance every 3000ms when this screen is focused and the app active; wrap last→first. Do not run a timer for a single banner.
- Preserve desktop image containment/blurred fill and mobile framing.
- Overlay white pagination dots at the bottom; active dot is an elongated pill. Pressing a dot selects that banner; manual swipes synchronize selection and reset the timer.
- No pause/resume button or dot backdrop per user preference. White dots sit close to the bottom edge; pause during dragging and clean up timers/listeners on unmount.
- Keep the selected banner aligned on viewport resize and reset cleanly when banner IDs/order change.
- Verify with typecheck, ESLint, web export and real browser observations of timer, dots and manual selection.

## Verification
- Typecheck, ESLint, 10 existing API/session tests and web export passed.
- Real Chrome observations confirmed looped active indices at 3011ms and 3022ms intervals on a 390px touch viewport; selecting a dot aligned the corresponding slide and elongated only its white indicator (24px vs 7px).
- Checked desktop/mobile layout, transparent dot backdrop, lowered dots and absence of pause control. Timers stop on blur/background and clean up on unmount; reduced motion uses instant transitions.
- Independent review found no blockers. Native device swipe gestures were not verified.
