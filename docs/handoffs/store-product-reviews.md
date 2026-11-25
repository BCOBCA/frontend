# Store product reviews

- Header shows followers, public productCount and `4.0 ★ / 5 đánh giá` in one wrapping row above the description. Uses the existing dealer response; missing product count shows an em dash, no rating shows "Chưa có đánh giá". Product detail summary uses the same average/star/count order.

- Store detail Reviews tab renders StoreReviews, sharing ReviewFeed with ProductReviews to preserve buyer, stars, images, timestamps and ReviewReply presentation.
- Each review opens its own `/product/{productId}`. Separate `store-reviews` query cache; pagination provides access to every published review. Newest-first order is enforced by the backend.
- API: `GET /api/dealers/{storeId}/reviews?page=1` returns existing paged ReviewDto.
- Verified: 537 tests across 106 frontend test files; typecheck and lint pass. Backend focused store/reply integration tests pass against isolated PostgreSQL.
- Browser: actual tab renders; API on the existing development server was unavailable for this request. Local fixture preview confirmed review content, replies, timestamps, product buttons and pagination controls in the accessibility tree. Screenshot capture stalled; mobile and interactive pagination checks remain unverified.
- Restart/deploy the updated backend to serve the new endpoint. No schema changes introduced by this feature.
