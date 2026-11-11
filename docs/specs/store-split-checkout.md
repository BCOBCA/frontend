# Store checkout, seller vouchers and GHN sandbox

## Accepted behavior

- One checkout creates one independent order per selected store; independent products, code, stock, payments, state, history and refunds. Historic orders remain unchanged.
- Each store has a seller-voucher selector below its products. Platform and shipping vouchers are selected separately below the store cards. Allow one merchandise voucher per store plus one platform and one shipping voucher.
- Voucher.StoreId identifies seller scope; null is platform scope. Preserve product/brand/category restrictions. Never guess seller scope from brand identity.
- Apply seller savings within their store first. Platform minimum uses original eligible merchandise across the entire checkout, excluding shipping. A 300,000 minimum qualifies from several smaller products/stores.
- Apply the platform discount only to the largest remaining eligible product line. Percentage savings use remaining eligible merchandise; clamp at that one line's remaining amount. Never spread leftover discount to another product. Stable ties: ProductId then VariantId.
- Obtain an individual GHN quote for every store using its registered sandbox pickup shop, selected recipient and parcel metadata. Redeem a shipping voucher once and distribute its savings only across eligible quoted fees, capped by each fee.
- Preserve exact totals with decimal arithmetic. Use whole-dong allocation for integral inputs; display grouped thousands without fractional digits.
- Record one redemption per voucher per checkout and its actual per-order applications. Cancel releases only after all benefiting children cancel. Unaffected children retain their accepted amounts; refund policy unchanged.
- Save all children and selected cart removal atomically. Retries/recovery return the original complete group. Validate accepted expected total and cart hash before commit.

## UI and interaction

Follow the supplied TikTok reference: white shop cards, compact product rows, shop voucher row and pale shipping strip with fee/ETA. Platform/shipping selectors and one combined summary follow below. Remove repeated per-store money tables. Mobile total/savings/order bar sits outside scrolling; desktop summary sits alongside products. Preserve existing address, note and COD behavior.

## GHN boundary

- Sandbox only: https://dev-online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/preview. No production URL/switch, booking or live-order creation.
- Backend-only Shipping__Ghn__TestToken. Admin binds each Store.GhnTestShopId to the store's verified test pickup warehouse.
- ProductInput accepts optional parcel weight/dimensions. Missing or oversized data prevents quoting; never invent weights or replacement shipping fees.
- Resolve public two-level Vietnamese address codes to names and send is_new_to_address=true. Never confuse administrative codes with GHN internal IDs.
- Quote after seller/platform merchandise discounts. Package estimate sums weight, uses max length/width and stacks heights. Actual carrier measurement/booking is outside scope.
- Restrict token to GHN requests, disable redirects, validate HTTP/JSON status, nonnegative fee, empty preview order code and ETA. Fail closed on errors. Tests use HTTP fakes and disposable databases.

## Contract and project structure

- Checkout/recovery keep first-order fields and add checkoutGroupId/checkoutOrders. Order listing filters by group under authenticated ownership. Multi-store success opens the group; single-store opens detail.
- Preview supplies storeOrders, issuer/application store IDs, shop/platform discount totals, ETA and pricingPolicy STORE_PRODUCT_MAX_V1. Client rejects incompatible previews.
- Nullable migrations: Orders.CheckoutGroupId, Vouchers.StoreId, Stores.GhnTestShopId and Products parcel fields. Preserve old rows; guard unsafe downgrade after multi-store/seller scope is used.
- Backend: BCOBCA.BLL/{Common,Services,Interfaces,DTOs}, BCOBCA.DAL/{Entities,Configurations,Migrations}, BCOBCA.Tests. Frontend: app/{checkout,orders}.tsx, src/components/{checkout,common}, services/checkout-vouchers.ts, types/api.ts, theme/index.ts and tests.

## Implementation tasks and validation

1. Add pure pricing/provider boundary tests, explicit DTOs and nullable migrations.
2. Apply scoped vouchers, quote GHN staging, create children atomically, preserve retry/cancel/refund rules.
3. Implement scoped selectors, server totals, success list and mobile footer; inspect at desktop/390/320 widths.
4. Review changes and migrations; record setup/validation in docs/handoffs/store-split-checkout.md.

Backend requires .NET 10: dotnet test BCOBCA.Tests from backend. Frontend: npm test; npm run typecheck; npm run lint; npm run build. Use disposable databases only. Follow existing explicit DTO records, small pure pricing functions and serializable transactions. No dependencies, live schema migration, deployment or real carrier shipment creation are part of this implementation.
