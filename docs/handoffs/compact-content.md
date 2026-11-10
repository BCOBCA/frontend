# Compact content across web and native

## Requirements and plan
1. Reduce shared body text 16→14, titles 20→18, prices 17→15; keep secondary text readable at 13.
2. Reduce shared card/page spacing and status/empty-state whitespace. Keep buttons and fields at least 44px high, preserve font scaling.
3. Compact screen-specific home shortcuts, brand filters, product cards, member and cart layouts and mobile navigation.
4. Validate typecheck, ESLint, existing tests, web export and representative desktop/mobile screenshots.

All routes using shared theme styles inherit the new density. Auth forms already have compact styling. No global zoom, transforms, backend, routing or business-rule changes.

## Verification
- Typecheck, ESLint, 10 existing API/session tests and web export passed.
- Headless Chrome checked home, member, cart, promotions and forgot-password at desktop/narrow viewport sizes. Kept the 72px mobile footer to avoid clipping tab labels; its icons are smaller.
- Independent review found no blocking regressions. Shared typography and spacing are used across routes; native font scaling remains enabled.
- Native device rendering and populated product/cart states were not verified. The local backend is unavailable, so screenshots show connection errors or signed-out states.
