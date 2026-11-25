# Floating support and share

- `FloatingActions` mounts inside the root session gate after session restoration. Auth screens hide it. Route-keyed content resets open popup state on navigation.
- Two white 44px circular buttons sit at right/bottom, clearing the mobile tab bar and safe area. Support opens a six-item popover; sharing opens a centered modal. Both support backdrop dismissal and platform Back/Escape through Modal.
- Sharing layout now uses a plain View without a vertical scroll container, reduces QR size based on viewport height, keeps the URL on one line, and reserves status text space. Top process icons use brighter red with filled user/cart/gift icons to match the updated reference.
- Per user clarification, hotline/chat/callback are interface-only and show an inline pending-configuration message. Favorites, feedback and about navigate to existing routes.
- Share uses `Linking.createURL(pathname)` with no current query string, generates a real QR locally with existing bwip-js/SvgXml dependencies, copies via expo-clipboard, and shares via native Share or Web Share with clipboard fallback. No new dependencies.
- Short-link presentation is present but disabled until a real `shortUrl` is passed. Referral process illustration matches supplied reference; no referral tracking or shortened-link backend was added.
- Verification: 500 frontend tests, typecheck, lint and web export passed. Browser verification unavailable: Chrome DevTools profile busy; Browser runtime reports no connected browsers.
