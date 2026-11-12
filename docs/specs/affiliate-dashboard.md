# Affiliate dashboard redesign

## Goal
Replace `/affiliate` with the supplied wallet/referral dashboard. Keep `/info/collaboration` as product discovery. Desktop: wallet/share cards, full-width rank progress and six navigation tiles. Mobile: stacked cards, compact shared header and member footer. Red/pink palette, wallet/plane/rank SVG art, existing typography and icons.

## Data and behavior
- Existing user-scoped GET `/affiliate`, `/affiliate/invitation`, public `/affiliate/ranks`.
- Wallet: available, pending, debt, referral code/count, lifetime non-reversed commission sum. Add optional `totalCommission` response field; no migration. Never infer lifetime total from current wallet balances.
- Rank/progress/next threshold/rate from API/config, no invented 100-referral milestone or nonzero progress. Highest-rank state explicit.
- Copy the server-issued invitation URL; QR encodes that URL locally using existing bwip-js. Accessible dismissible modal, selectable fallback URL, share action, disabled buttons until URL loads. No sample QR or real external sharing during verification.
- Retain `/referrals`, `/leaderboard`, `/withdrawals`, `/withdrawal` and wallet ledger entry `/wallet-transactions`. Remove `/affiliate-ranks` and `/commissions` pages and their dashboard tiles per updated request; rank details use `/info/affiliate`. Auth/login/loading/error/retry states; no stale private account data.

## Steps
1. Add total commission aggregate and extend affiliate-flow regression assertions.
2. Build wallet/rank art and dashboard presentation, navigation and invitation/QR card.
3. Wire route and user-scoped queries; test navigation/data/QR/copy plus empty/highest-rank states.
4. Run frontend tests, typecheck, targeted lint, web export; backend affected flow. Browser desktop/mobile with synthetic fixtures.

## Conventions and boundaries
Use existing Page/Header, theme, AffiliateRankIcon, affiliateProgress and gridItemWidth. Keep UI components separate from query containers; Expo 58/React Native 0.88 APIs follow installed docs. No dependencies, shared database modifications, commits or deployment. Preserve unrelated working changes.

## Commands
`npm test`, `npm run typecheck`, `npx eslint <changed files> --no-cache`, `npm run build`; .NET 10 `dotnet test BCOBCA.Tests --filter FullyQualifiedName~ProductAffiliateFlowTests` against isolated scratch database.
