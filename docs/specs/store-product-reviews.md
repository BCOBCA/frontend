# Store product reviews

## Requirements
- Store header shows public product count and store average rating alongside followers above the description; allow wrapping on narrow screens. Format ratings as `4.0 ★ / 5 đánh giá` using the actual count, including in the product detail summary; no ratings shows "Chưa có đánh giá". Add optional productCount to DealerDto using the public catalog scope, without extra client requests.
- The store detail Reviews tab lists all published product reviews owned by that store, including reviews for inactive products; preserve the purchase store snapshot.
- Show buyer name, stars, content, images, timestamp and an existing seller reply using the product review presentation. Each review has a button opening `/product/{productId}`.
- Order by creation time descending with a stable ID tie breaker. Paginate so every review remains accessible without unbounded requests.
- Preserve product review behavior. Show loading, retry and empty states; do not show hidden or pending reviews.

## Contract and scope
- Add public `GET /api/dealers/{id:guid}/reviews?page=1&pageSize=20`, returning the existing `PageResult<ReviewDto>`. Missing, inactive or deleted dealers return 404.
- Reuse existing review ownership and reply data; no database migration or dependency changes.

## Plan and verification
1. Add backend regression coverage for store isolation, visibility, newest-first pagination, replies and unavailable dealers; implement the endpoint and run focused .NET tests.
2. Share the product review feed with the store tab; test rendering, query scope, pagination and product navigation. Run frontend tests, typecheck and lint.
3. Inspect the browser and record verification/limitations in the handoff.
