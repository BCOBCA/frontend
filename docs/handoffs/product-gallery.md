# Product gallery navigation

- All product/service detail pages now use `src/components/product/ProductGallery.tsx`.
- Root cause: the API already returned five image URLs, but the full-width horizontal pager hid its scrollbar and had no thumbnails, arrows or page count, so desktop users could only discover the first image.
- Added visible thumbnails with selected state, previous/next controls and a live image count. Mobile paging/swiping remains available; controls and swipe position stay synchronized. The gallery measures its actual container width instead of assuming viewport width.
- Primary image fallback, deduplication and empty-image state are supported. Product ID keys reset gallery state when navigating to another product. No database or backend changes were necessary.
- Verified: 128 frontend tests, typecheck, lint and web export. Desktop iPhone X navigation changed from `1 / 5` to `2 / 5`; clicking the fifth thumbnail displayed image five and disabled the next button. Mobile 390px rendered all five thumbnails without page overflow.
