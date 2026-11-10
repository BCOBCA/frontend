# Check-in success notification

- Replaced the persistent “Bạn nhận được … điểm” inline text on promotions with one top overlay saying **“Bạn đã điểm danh hôm nay”** after successful check-in.
- `TopToast` slides down/fades in, stays about 3 seconds, then slides up and unmounts. Close action dismisses immediately. Accessible alert/live region, safe-area positioning, constrained width, no modal or full-page touch blocking. Animation is stopped on unmount.
- `Page` gains an optional overlay rendered outside its ScrollView so the toast stays at the top while content scrolls. Only check-in success activates it; opening an already-checked-in page does not. Points/membership invalidation, disabled button and error handling remain intact.
- Validation: 147 frontend tests passed, TypeScript, targeted lint and web export passed. Regression reproduced the old inline message before the fix. Browser with local-only fixtures at 390 px confirmed one alert at top12 px, width358 px, no overflow, no inline reward text, then zero alerts after timeout. No production check-in or points were changed.
