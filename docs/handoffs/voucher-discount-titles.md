# Voucher discount titles

- `src/services/voucher-display.ts` derives benefit titles from discountType/discountValue: `Giảm 20.000đ`, `Giảm 15%`, or shipping discount text. Legacy names do not affect the title.
- OfferCard uses this title in both layouts and accessible labels; shop/promotions conditions dialogs share the formatter.
- SellerVoucherCard uses the discount as its heading, keeping the code in the metadata row.
- Verified: 20 frontend and 12 seller voucher/promotions tests, both typechecks, frontend targeted lint and seller lint. Real OfferCard browser preview showed fixed/percentage titles with an unrelated legacy name. Screenshot capture timed out.
- No API/database changes in this follow-up; preserve unrelated worktree edits.

## Shop details

- Discovery voucher details now identify the issuer using `storeId/storeName`, matching the shop identity in the card badge and personal-wallet details. Platform offers identify the platform.
- Discovery and collected-voucher dialogs clarify that a shop minimum applies to eligible products of that shop. Collected-voucher details also use the derived benefit title.
- Added a regression opening shop-offer details from the discovery card, a platform-issuer case, and a collected shop voucher case. All 21 related tests, frontend typecheck and targeted lint passed.
- Browser verified the real personal-wallet dialog: `Voucher của shop: Cửa hàng QQ`, the shop-specific minimum, benefit title and collected status are visible.

## Unified card template

- OfferCard now renders one compact pink ticket layout for discovery, shop details and owned vouchers, including point rewards. Issuer badges remain visible after redemption; points appear as a separate line. Claim, redeem, disabled/busy and owned-detail actions retain their behavior.
- Percentage cards consistently show both minimum spend and cap. Shop grid fallback spacing now matches discovery and wallet.
- Verified 36 focused card/consumer/admin tests, typecheck and targeted lint. Browser comparison of nine real cards confirmed identical backgrounds, borders, radii and widths across the three contexts, with the expected action labels and point states.

## Unified details dialog

- Discovery, shop details and the personal wallet use `OfferDetails` for the same modal, backdrop/close controls, sizing, typography and benefit/issuer/eligibility/expiry terms. `OwnedOfferDetails` now only supplies collection metadata and its shopping action.
- Discovery retains redemption confirmation, balance text, errors and action controls. All close paths are guarded while pending.
- Verified 35 existing focused tests plus 3 shared-dialog tests, including shop detail opening, issuer identity, personal collection information and pending close protection.
- Typecheck and targeted lint passed. Browser preview opened all three contexts and confirmed matching shared terms; wallet retained collection date and shopping action. The shared panel measures 460px with 18px radius, 20px padding and 14px spacing.
