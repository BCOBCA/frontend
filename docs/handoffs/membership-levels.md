# Membership levels and affiliate ranks

Update 2026-11-04: level now uses valid lifetime earned points, superseding earlier available-balance notes below. Spending reduces available points without lowering level; refund reversals still remove earned points. Card progress and total use lifetime; a separate “Điểm có thể sử dụng” row shows available points. Purchase rule is floor(net merchandise /10000), excluding shipping; backend deployment must set `Membership__SpendPerPoint=10000`. Existing balances/history are preserved. See sibling backend `docs/handoffs/lifetime-membership-points.md`. Verified 99 backend/37 frontend tests, TypeScript/ESLint and browser fixtures at 320/390/768/1024/1440px.

## Confirmed rules
- Member level uses `availablePoints`, not lifetime earnings or spending. Spending/refunds/debt repayment can lower a level.
- Lv.1–Lv.10 thresholds: 0, 100, 300, 600, 1000, 1600, 2500, 4000, 6000, 10000.
- Affiliate ranks are independent: Đồng (0 / 2%), Bạc (10 / 3%), Vàng (30 / 5%), Bạch kim (70 / 7%), Kim cương (150 / 10%).
- Count distinct referred customers with at least one currently completed, paid order. Repeated orders do not multiply the count; pending/unpaid/refunded orders do not qualify.
- Rates are final percentages on merchandise value, not bonuses added to a base rate. Existing commission rows retain their recorded rates and amounts.
- Benefits per level have not been supplied; leave editable lists empty. No automatic discount or voucher grants were invented.

## Frontend
- `MemberLevelProgress` puts the current level to the right of the member heading and renders the gold progress bar, remaining points and available balance.
- Progress comes from the server; there are no hardcoded business thresholds in frontend source.
- Progress is relative to the current level's minimum and next level's minimum. At the exact threshold, the new level starts at 0%; Lv.10 shows 100% with no next-level message.
- Example: 1400 points → Lv.5, 200 points to Lv.6, 66.67% through the current level.
- Per the updated guest presentation requirement, signed-out members show default Lv.1, 0 points and 100 points remaining to Lv.2. This preview uses the original default threshold; authenticated members always use API configuration. Missing authenticated API data still uses placeholders.
- Tapping the level opens `/membership-levels`, listing all ten configured thresholds and benefits.
- Affiliate page displays the separate rank, final rate and successful-referral count; `/affiliate-ranks` lists rank policies. Leaderboard counts successful referrals and also displays affiliate rank.

## API and admin contracts
- `GET /api/membership` adds optional `levelInfo`: `level`, `minPoints`, `nextLevel`, `nextLevelMinPoints`, `pointsToNextLevel`, `progressPercent`, `benefits`.
- `GET /api/membership/levels`: public list of `{ level, minPoints, benefits: string[] }`. Only policy definitions are public; personal point balances and point history still require authentication.
- `PUT /api/admin/membership/levels`: `{ levels: [...] }`, exactly ten unique ordered levels starting at 0 points, with strictly increasing thresholds. Each level supports up to 20 benefit descriptions of 500 characters each.
- `GET /api/affiliate` adds `rankInfo`: current rank/name/rate, successful referrals, next-rank details.
- `GET /api/affiliate/ranks`: public list of `{ rank, name, minSuccessfulReferrals, commissionRate }`; personal balances and rank progress still require authentication.
- `PUT /api/admin/affiliate/ranks`: `{ ranks: [...] }`, exactly five ranks starting at 0 referrals with strictly increasing referral thresholds and nondecreasing rates. Rates are fractions (e.g. `0.02` = 2%).
- Both PUT routes require Admin/SuperAdmin at the controller and current active-account/role validation in the service. Changes are transactional and audited. The admin interface itself is a later feature.

## Backend and migration
- `MembershipLevelRules` and `AffiliateRankRules` own validation and calculations; `LoyaltyQueries` reads persisted policies and successful referral counts.
- Membership GET derives the current level from current balance/configuration, so admin threshold updates and future point spending cannot expose a stale stored tier.
- Check-in, order accrual and refund reversal also refresh the stored `TierId`.
- Apply `20261104103000_AddMembershipLevelsAndAffiliateRanks` after `20261104093000_AllowPhoneOnlyRegistration` before deploying the updated API.
- Migration seeds exact user-provided thresholds/rates, retains the original base tier ID, backfills current member tier IDs and creates the five-rank table.
- Rollback maps members back to the original tier before removing higher-tier definitions, preserving account/point/commission records.
- Legacy `Affiliate__CommissionRate` is no longer used or required at startup; rank rates in the database are authoritative. Existing environment settings may remain during deployment.
- Migrations were tested against temporary databases; no external/deployed database was changed.

## Verification
- Backend: 91 tests passed using workspace .NET 10.0.403 and a dedicated local PostgreSQL cluster, including boundaries, check-in promotion, balance demotion, admin permissions/config changes, distinct referrals, unpaid/refunded exclusions and migration rollback/reapply.
- Frontend: 26 tests and typecheck passed; web export built successfully.
- Browser screenshots at 320, 390, 768 and 1440px use isolated API fixtures; the real financial/API behavior is covered by backend integration tests.
- Final ESLint run passed without warnings. Browser checks passed for Lv.5 progress, ten level rows, Lv.10 cap and guest placeholders, with zero runtime exceptions.
- Additional finance regression passed: changing admin rates leaves existing commission rates/amounts intact, and the obsolete environment commission rate is ignored.
- Expo emitted the complete `dist` export but kept its CLI process alive; stopped the lingering processes after artifact generation and successful browser checks. The isolated PostgreSQL test server was also stopped.

## Point details update
- A small red circled exclamation mark beside Lv. links to `/membership-levels`.
- The page includes personal point totals/history navigation, ten level definitions/benefits, and earning/reversal/debt-repayment explanations matching current backend rules.
- Guests can read policies/calculation explanations; personal totals/history remain protected and show a sign-in action.
- Descriptions avoid hardcoding current spending-per-point or check-in rewards because those settings are configurable. The page does not introduce new redemption/discount behavior.
- Verified: 27 frontend tests, typecheck, ESLint; API build with zero warnings/errors; isolated browser checks at 320/390/768/1440px including clicking the exclamation icon and public guest policy access.

## Card information links
- Redeemable-point placement: MemberLevelProgress shows the label/value together, right-aligned directly under the level and above the progress bar. Verified element geometry and no overflow at 320/390/768/1024/1440px; TypeScript/targeted ESLint pass.
- Level list update: `/membership-levels` uses compact rounded rows with level, minimum points, first-benefit preview and a chevron. Each row independently expands/collapses all configured benefits; empty configurations show the existing update message. No per-level icons, current-level badges or current-row highlights. Native/web use the same component; existing point summary/rules remain.
- Verified TypeScript, targeted ESLint and browser interaction at 320/390/768/1440px with API fixtures: ten collapsed rows, expand/collapse, full benefit contents, empty state and no horizontal overflow.
- Update 2026-11-04: the subsequent product Affiliate feature supersedes earlier rank thresholds with 0/10/30/60/100 (2/3/5/7/10%). See `product-affiliate.md`; membership level thresholds are unchanged.

### Decorative SVG web warning fix
- MemberStar, AffiliateCoinIcon and MemberPointsIcon omit the native `accessible` prop on web and use `aria-hidden`; native retains `accessible=false`.
- Regression test reproduces React's non-boolean `accessible` DOM warning before the fix; 37 frontend tests, typecheck and targeted ESLint pass after it.
- Verified `/member` with development Metro in Chrome: three decorative SVGs have `aria-hidden=true`, no SVG has an `accessible` DOM attribute and the reported React warning is absent. The configured external API separately rejects the temporary localhost:8084 origin via CORS.
- The two member cards have a small red circled exclamation beside each title. Their existing detail buttons keep their wallet/history destinations.
- Affiliate card information opens `/affiliate-ranks`: private balance/rank summary, commission calculation, successful-referral rules, leaderboard link and the five configurable rank policies.
- Member point card information opens `/membership-levels`: point summary/history, earning/deduction rules and ten configurable levels.
- Public rank/level policies are readable before sign-in. Personal data is not fetched or shown to signed-out visitors.
- Verified: TypeScript, ESLint, 27 frontend tests, API build and isolated browser checks. Both card icons were clicked at 320px/1440px; Affiliate balances/rank/rules and guest privacy behaved as expected. Public policy requests use test fixtures in browser checks.
