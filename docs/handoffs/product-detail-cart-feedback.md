# Product detail cart feedback

- Product detail now publishes add success through the existing global top toast. Failure uses the exact message `Lỗi: thêm giỏ hàng thất bại` with error tone.
- Removed inline cart success/link and cart mutation error from the purchase panel. Favorite errors retain their existing handling.
- Cart invalidation and buy-now checkout navigation preserved; buy-now success does not emit an add-success toast.
- Validation: 18 focused tests (detail callbacks/markup, product card, product purchase, toast store), TypeScript and targeted ESLint. No authenticated cart changes or real purchases performed during verification.
