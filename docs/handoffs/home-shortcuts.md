# Home utility shortcuts

## Requirements and plan
- Keep Mini game, Yêu thích, Tin tức and Ưu đãi.
- Add Góp ý (MessageSquare → `/feedback`), Về chúng tôi (Info → `/info/about`), Cộng tác (Handshake → `/info/collaboration`), Đại lý (Store → `/info/dealers`), Liên hệ (Phone → `/info/contact`).
- Reuse existing pages. Add explicit coming-soon entries to the information route for the three unavailable features.
- Distribute shortcuts across the available desktop width; allow horizontal scrolling with a visible scroll indicator on narrow screens.
- Verify typecheck, ESLint, web export and representative routes in a browser. No backend or authentication changes.

## Verification
- Typecheck, ESLint and web export passed; independent route/accessibility review found no blockers.
- Headless Chrome checked desktop/mobile home and all three coming-soon routes. Interactive clicking/swiping and device-native rendering were not tested because browser connectors are unavailable.
