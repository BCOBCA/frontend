# Shared product card

- Use the dealer storefront card as the single product listing component on home, search, dealer, brand and favorites screens.
- Preserve contain images, discount badge, two-line title, current/original prices, actual review/sold data and stock-aware cart action.
- Preserve favorites and service consultation. Missing review data must not produce fabricated statistics or rendering errors.
- Keep cart/order line items and product detail layouts specialized.

Implementation: test shared rendering/actions, consolidate the card, migrate listings, then verify typecheck, lint, tests and browser layouts. Favorites must receive the same purchasable variant/stock information as catalog listings.
