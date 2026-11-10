# Shared product listings

- All listing screens use `src/components/product/ProductCard.tsx`: home/catalog, search, dealer storefront, brand details and favorites.
- Home, search, brand details and favorites render 6 columns on screens at least 1100px wide, 3 on tablet and 2 on mobile. Dealer grids keep their existing sidebar-aware column counts.
- Favorites explicitly mark saved items as favorites and scope query caches to the signed-in user.
- Backend favorites now reuse `CatalogService.ProjectProducts` so images, variant prices, variant IDs and stock match catalog cards. Previously every favorite returned a null variant and zero stock.
- Cart/order rows and the product detail page retain their specialized layouts.
- Frontend verification: 116 tests, typecheck, Expo lint and web export passed. Backend regression `FavoriteCatalogFlowTests` added; execution blocked by installed SDK 9 versus required .NET 10.
