# Cart guest and empty states

- Match supplied references with centered pink cart illustrations, bold headings, muted descriptions and red icon buttons. Keep the existing header/navigation and occupied-cart behavior.
- Guest: “Đăng nhập để xem giỏ hàng”; “Vui lòng đăng nhập để lưu trữ giỏ hàng, đồng bộ trên mọi thiết bị và mua sắm nhanh chóng hơn.” Button opens `/login`; cart query remains disabled.
- Signed-in successful empty response: “Giỏ hàng của bạn đang trống”; “Hãy khám phá hàng ngàn sản phẩm hấp dẫn và thêm vào giỏ ngay nhé!” Button opens `/categories`.
- Hide total/checkout bar for guests and empty carts. Do not show empty state during loading or API failure. Preserve quantity changes, selection, removal and checkout when items exist.
- Plan: regression tests first; add state component and SVG illustration using existing packages; wire cart; verify tests, TypeScript, ESLint and browser if available.
- Commands: `npm test`, `npm run typecheck`, `node node_modules/eslint/bin/eslint.js app src/components/cart tests/cart-states.test.tsx`.
