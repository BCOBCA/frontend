# Published product reviews and shop replies

Buyer order list/detail honors server `canReview`, allowing reviews after verified delivery even before COD settlement. Existing completed-order fallback remains for old responses. Reviews now publish immediately and the editor success copy reflects this. Public product review feeds and the buyer editor render optional seller replies as escaped text, with shop name and timestamp.

Buyer order list/detail review actions now open `ReviewDialog` in place. Single-item orders open the form directly; multi-item orders offer a product/variant picker, with the clicked detail item preselected. Shared `ReviewForm` loads the buyer's existing review, preserves images, validates stars/content, displays replies and invalidates review caches after saving. Pending saves block close/item switching and duplicate submits. Successful saves close the dialog and show a toast. The existing `/review/[id]` route remains for notification links and reuses the same form.

Popup verification: 484 frontend tests passed; final focused 13 tests, TypeScript and ESLint passed. Isolated Chrome checked 1440px/390px, rating selection, input/save, reopening an existing review, multi-product selection, blocked close while saving, unchanged URL, zero nested buttons/overflow/console errors. External API requests were intercepted with local fixtures; no live reviews were created. Temporary preview files removed; screenshots/script remain under workspace `.local/buyer-review-*`.

Reply inbox/native push targets use `Review` + order-item ID and open `/review/[id]`. Live notification invalidations include `reviews` and `my-review`; account-scoped editor query keys prevent cache reuse between accounts. Dirty buyer drafts are preserved on live reply refresh.

Backend requires migration `20261121075810_PublishedReviewsAndSellerReplies` before deployment. See parent `backend/docs/handoffs/published-reviews-and-seller-replies.md`. No live migration, real push delivery or deployment performed. 478 FE tests, TypeScript and targeted lint passed, including immediate-delivery review controls, public reply escaping and notification routing.
