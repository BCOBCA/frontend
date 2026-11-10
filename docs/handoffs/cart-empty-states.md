# Cart guest and empty presentation

- Added `CartEmptyState` and `CartIllustration` using existing React Native/SVG packages. Guest illustration includes shopping bags and a lock; empty-cart illustration shows a cart with pink foliage. Responsive centered headings, descriptions and red icon buttons follow supplied references.
- Guests see “Đăng nhập để xem giỏ hàng” and `/login` action. Signed-in users with a successful empty cart response see “Giỏ hàng của bạn đang trống” and `/categories` action.
- Cart total/checkout footer now appears only for authenticated carts containing items. Loading/errors do not display the empty state. Existing item selection, quantity, removal and checkout behavior retained.
- Verified 66 tests, TypeScript and targeted ESLint. Five regression cases cover guest login/query gating, empty-cart navigation, loading/error guards, and occupied-cart checkout. Chrome visual QA blocked by existing browser-profile conflict; actual rendered appearance remains unverified.
