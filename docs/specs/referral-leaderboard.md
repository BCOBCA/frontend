# Referral leaderboard reference

Match supplied desktop reference: red trophy banner; week/month/quarter/all tabs; compact ranked member table with top-three row accents; personal position, benefits, referral-link sharing sidebar. Mobile stacks sidebar below table. Reuse AffiliateRankIcon's bronze/silver/gold/blue-platinum/purple-diamond graphics, display actual tier from configuration independently of numeric leaderboard position. No invented members, referral counts, rates, prizes, current rank or links.

API extension: `period=week|month|quarter|all`, Vietnam calendar boundaries, count unique currently eligible referrals by QualifiedAt within the selected window. Eligibility still requires a completed/paid order. Lifetime successful referrals determine tier/rate. Add avatar, tier rank, isMe and personal leaderboard entry outside current page; preserve pagination fields. Authenticated controller determines current user. No schema changes.

Implement/test server time windows and paged/personal ranking, then presentational screen/route with real queries and scoped errors. Referral sharing uses the invitation API. Verify focused/full tests, TypeScript/lint, web export and desktop/mobile fixture. Do not deploy or modify business data.
