# Voucher discount titles

Voucher cards and their conditions dialogs derive titles from discountType and discountValue: FIXED 20000 displays `Giảm 20.000đ`; PERCENT 15 displays `Giảm 15%`. Shipping titles identify the shipping discount. Ignore legacy name/code as the benefit title; keep existing badges, terms and actions.

Use the existing TypeScript/React component patterns and vi-VN number formatting. No API/schema changes or dependencies. Implement a shared frontend formatter, then update card/dialog consumers and seller card heading. Verify focused voucher UI tests, client typecheck/lint and browser rendering.

## Consistent card template

Use the promotions page's compact pink ticket card for shop details, discovery and the personal wallet, including point rewards. Preserve the issuer badge before/after collection, derived benefit title and order terms. Point rewards show their cost/paid points within the same template. Owned cards open conditions; discovery cards retain claim/redemption behavior. Match grid breakpoints and fallback spacing across these consumers. Verify focused card/consumer tests, typecheck, lint and a browser preview.

All three details dialogs must share one component for backdrop, close controls, layout and voucher terms. Preserve redemption confirmation/error/pending handling and the personal wallet's collection date and shopping action as contextual content. Verify opening shop/discovery/wallet details and pending close protection.
