# Favorites guest screen

- Match the supplied reference: a centered pink shopping bag/heart illustration, bold Vietnamese login heading, muted two-line explanation and red login button with user icon, on the existing light page background.
- Guest copy: “Đăng nhập để sử dụng danh sách yêu thích”; “Lưu lại những sản phẩm bạn yêu thích, theo dõi dễ dàng và mua sắm nhanh hơn mọi lúc, mọi nơi.” Button opens `/login`.
- Keep the current authenticated favorites DataList, product navigation and pagination. Guests must not fetch favorites.
- Use existing React Native inline styles and react-native-svg for a local vector illustration, following existing illustration components. No dependency or backend changes.
- Plan: add regression tests for guest copy/navigation/no query and authenticated list; implement guest presentation; run tests, typecheck, ESLint, and browser QA if available.
- Commands: `npm test`, `npm run typecheck`, `node node_modules/eslint/bin/eslint.js app/favorites.tsx src/components/favorites tests/favorites.test.tsx`.
