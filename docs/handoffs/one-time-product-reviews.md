# One-time product reviews

- `ReviewForm`: starts at zero stars with explicit rating validation. Content grows/shrinks from 112px using native content-size events and web textarea measurement. Existing reviews render stars, selectable content, images and seller reply without editing controls.
- `ReviewDialog`: reviewed items use “Xem đánh giá”; multi-item selection retains access to first reviews for other items. Busy guard remains active through cache refresh.
- `OrderItem.hasReview` / backend `OrderItemDto.HasReview`: additive flag projected in both order list/detail queries. All-reviewed orders show “Xem đánh giá”; detail labels follow each item. `canReview` still means delivery eligibility.
- Backend `ReviewService.SaveAsync`: existing reviews always return 409, including identical retries and hidden/moderated history. Existing unique index plus serializable transaction prevents concurrent duplicates; save conflicts return 409. Seller replies remain editable.
- Submit refreshes `my-review`, `reviews`, `orders`, `order` before dismissal. Failed submissions recheck the saved review to recover from duplicate requests.
- Validation: 489 frontend tests; typecheck; focused ESLint. .NET 10 solution builds and PublishedReviews, ReviewImagesJson, FinanceFlow integration tests pass (3 tests, scratch PostgreSQL databases).
- Browser: actual form/dialog/card with stub API; initial empty stars, rating-required error, input growth/shrink, post-submit label and read-only reopening with reply verified. Mobile viewport 375px; larger viewport also checked. Native device rendering was not exercised.
- No database migration/dependency changes. Restart/deploy frontend and API together to expose the new item flags and server restriction. Isolated Windows PostgreSQL tests require starting the database outside the restricted sandbox so worker signals and database cleanup succeed.
