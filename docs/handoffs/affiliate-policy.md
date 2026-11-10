# Affiliate policy screen

- Latest upgrade: see `affiliate-policy-complete.md` for 12 sections, configuration-backed legal metadata, 14 FAQ and current verification results. Earlier entries below describe the original reference-design work.

- `/info/affiliate` now renders `AffiliatePolicyScreen`; other info routes retain their previous content.
- Desktop sidebar and mobile wrapped navigation scroll to overview, steps, ranks, payment, conditions and FAQ. Rules offset accounts for stacked mobile layout. FAQ questions expand individually.
- Pink banner uses local SVG `AffiliatePolicyArt` (phone, megaphone, coins, gift); no new dependencies. Join routes guests to login and members to affiliate information; payout uses existing withdrawal route.
- Rank table uses public `/affiliate/ranks` and shared query key; thresholds/rates are not hardcoded. Loading/error/retry/empty states supported. Rates formatted with up to two decimal percentage places.
- Referral qualification copy reflects `LoyaltyQueries.SuccessfulReferralsAsync`: at least one COMPLETED, PAID order per referred user. Withdrawal explanation follows existing withdrawal screen; no promised payout time or invented fee schedule.
- Verified 69 tests, TypeScript and targeted ESLint. Browser QA unavailable due to existing Chrome profile conflict; responsive layout and artwork remain unverified in the browser.

## Banner reference refinement

- Rank table refinement: compact rows, pale pink two-line header, bold red API-backed rates; local SVG star coins in bronze/silver/gold/blue and a faceted purple diamond replace generic award icons. Rank visuals follow configured rank order.

- Compact desktop banner (170px minimum), smaller typography/spacing, 36px desktop buttons and artwork at the right edge. Mobile keeps stacked content and 44px buttons. Both CTA destinations unchanged.
- Replaced SVG with built-in imagegen illustration saved as `assets/affiliate-policy-banner.png`, displayed with contain. Original generated asset retained.
- Generation prompt: glossy red megaphone, red-bordered shopping-cart phone, gold coins, pink gift with gold ribbon and red percent tag on blush pink waves; no text. Built-in imagegen tool used.
- Background follow-up: edited the existing artwork with built-in imagegen to remove only the pink backdrop/waves and keep foreground objects. Saved transparent result at `assets/affiliate-policy-banner.png`; banner color remains `#FFECEF`. Verified four background sample pixels have alpha 0, so the image uses the banner background without a rectangular seam. Original generated files retained.
