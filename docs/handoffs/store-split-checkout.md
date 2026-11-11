# Store checkout and GHN sandbox

- Checkout creates one Order per StoreId in one transaction; children share nullable CheckoutGroupId. Payments/reservations/seller records/history/notifications and existing order-based finance/refunds remain independent. The original request key locates the group on retry/recovery. Historic combined orders stay unchanged.
- StoreVoucherPricing separates seller codes (Voucher.StoreId) from platform/shipping codes. One seller code per store stacks with one platform and one shipping code. Seller savings stay within that store; platform minimum uses original eligible merchandise across the checkout, while its discount hits only the largest remaining eligible product line. Ties use ProductId/VariantId. Savings are capped at that line, not redistributed.
- One VoucherUsage per voucher per checkout. OrderVoucherApplication records actual contributions, including seller/platform applications on the same child. Cancel restores only after all benefiting children are cancelled; refund policy unchanged. Surviving orders are never repriced.
- Preview supplies server store amounts, issuer/application store IDs, seller/platform totals, ETA and pricingPolicy STORE_PRODUCT_MAX_V1. Client rejects older responses. Multi-store success opens an owned checkoutGroupId-filtered list with store names; one store opens detail.
- UI follows the supplied TikTok reference: white shop cards, shop voucher rows, compact shipping strips, separate global voucher rows and one summary. CheckoutSubmitBar sits in Page.footer outside scrolling on mobile. VND formatting hides fractional digits; legacy fractional records retain underlying precision.

## GHN sandbox setup

1. With .NET 10, apply reviewed migrations SplitCheckoutByStore and StoreVoucherAndGhnTestShipping to the intended development database: `dotnet tool run dotnet-ef database update --project BCOBCA.DAL --startup-project BCOBCA.API` from backend. No business database was migrated during implementation.
2. Set Shipping__Ghn__TestToken in backend/.env to a GHN sandbox token. Never put it in EXPO_PUBLIC_* or chat. Restart the backend after configuration.
3. As admin, bind the registered test pickup warehouse with `PUT /api/admin/stores/{id}/shipping-test`, body `{ "ghnTestShopId": 123 }`. Verify that its GHN pickup address is the store's origin. Ordinary sellers cannot rebind pickup warehouse IDs.
4. Product endpoints accept shippingWeightGrams (1-50,000), shippingLengthCm/shippingWidthCm/shippingHeightCm (1-200). Omitted fields preserve existing metadata. Package estimates sum weights, use maximum length/width and stacked heights; oversized packages are rejected.
5. Seller voucher creation uses the existing voucher endpoint with storeId. Owners may create ordinary coupons only for their own stores; platform/point/level rules require admin. Old vouchers remain platform-scoped. Existing used/claimed voucher edit protections remain.

GhnQuoteClient uses only the hardcoded staging preview endpoint. No production switch, live-order creation or shipment booking. It resolves existing public province/ward codes to destination names, uses the two-level GHN address flag, after-discount merchandise COD, per-store registered origin and provider ETA. Missing credentials/parcel data never silently fall back to a fixed or free fee.

Official contracts: [GHN preview](https://developer.ghn.vn/vi/docs/order/preview), [request fields and two-level addresses](https://developer.ghn.vn/vi/docs/order/create). Tokens are sent only to GHN, not the location directory; redirects disabled. Direct staging GET /shop/all returned HTTP 401 with Token is not valid on 2026-11-11. The user confirmed the supplied token belongs to production; it was removed from the ignored sandbox configuration. Shipping__Ghn__TestToken is intentionally empty pending a credential from developer.ghn.dev. No production request was attempted. Direct quote verification is pending a valid sandbox token and registered pickup shop. Provider contracts are tested with HTTP fakes.

## Verification

- Pure tests cover aggregate minimum, one-product platform cap, stacking seller/platform/shipping, scope authorization and invalid provider responses. Disposable PostgreSQL tests cover retries, ownership, cancellation, rollback and independent COD/refund effects.
- Frontend tests cover scoped selection, preserving other stores' codes, pricing policy/address refresh, totals, formatting and filtered success navigation. TypeScript, lint and web export are checked.
- An isolated browser fixture uses actual checkout components and fake data, without real order writes. Mobile bottom bar, scoped picker, separate global rows, whole-VND text and 320/390/desktop overflow are inspected.
- Schema migrations and deployment have not been applied to business data. Direct GHN staging calls require the setup above.

- Final source validation: 179 backend tests and 286 frontend tests pass; TypeScript, uncached ESLint and web export pass. The application requires IShippingQuoteService; fixed quotes exist only in TestOrders fixtures, never as a runtime fallback. EF reports no pending model changes. Browser fixture checked mobile 320/390 and desktop; independent shop picker opens through keyboard interaction, only its own coupon is present; no horizontal overflow or console errors.
