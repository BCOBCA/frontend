# Affiliate policy reference redesign

## Complete policy upgrade

- Preserve existing banner/artwork, colors, sidebar, rank icons and CTA behavior. Expand to 12 numbered sections: scope, eligibility, member referral, ranks, rank updates, product commission/examples, reconciliation/refunds, wallet/payout, rights/duties, prohibited conduct, disputes/changes and at least 10 FAQ.
- Keep ranks sourced from the existing Admin-backed API. Add a public read-only `/affiliate/policy` endpoint for whitelisted metadata and explicitly configured attribution/approval timing. Publication dates/version/approval evidence default to unpublished; never derive from build time or current date. Unimplemented fee/threshold/payout/priority settings remain null/unpublished.
- Explicitly distinguish member referrals for rank from attributed product orders for commission. Explain one count per invited member, no reset on upgrade, invalid/refunded orders, product caps/budgets and refund recovery without changing existing business services.
- Label unapproved legal terms as a draft. No invented SLA, legal entity, contract waiver, automatic consent or penalty. Complaint paths use existing feedback flow plus configured contact when present; preserve statutory rights.
- Examples are illustrative calculations using a rate returned by API (not fixed 2/3/5/7/10 data); use exact current cent-rounding convention and show product cap/budget assumptions.
- Slices: (1) backend configuration contract/tests; (2) data/content helpers and regression tests; (3) add sections and responsive navigation using existing presentation; (4) tests, lint, frontend/backend builds, browser verification and handoff.
- Boundaries: no DB/schema, Admin mutation UI, rank-setting changes, or edits to other user pages. No automatic legal approval/publication or deployment.
- Backend checks: workspace `.tools/dotnet/dotnet.exe test backend/BCOBCA.Tests --filter FullyQualifiedName~AffiliatePolicy`; frontend checks: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.

- Replace only `/info/affiliate`; preserve all other info routes and existing account affiliate screens.
- Match reference: desktop sidebar with six section links, pink illustrated introduction banner, overview/benefits, four steps, API-backed rank/commission table, eligibility, payout explanation and expandable FAQ. Stack panels and wrap navigation on mobile.
- Rank thresholds and commission rates come from public `GET /affiliate/ranks`; show loading/error/retry/empty states without sample rates. Referral qualification and payout copy follow existing application rules; avoid promising timing or fees not configured by the system.
- Navigation scrolls the content to each section; join opens `/affiliate-ranks` when authenticated, `/login` otherwise. Guide jumps to steps; payout opens the existing withdrawal flow after login.
- Existing React Native styles, Lucide and SVG illustration components; no new packages/backend changes.
- Plan: add route/interaction/data regression tests; implement illustration and policy screen; route affiliate info to screen; verify tests, TypeScript, ESLint and browser availability.
- Commands: `npm test`, `npm run typecheck`, `node node_modules/eslint/bin/eslint.js src/screens/AffiliatePolicyScreen.tsx src/components/affiliate/AffiliatePolicyArt.tsx app/info tests/affiliate-policy.test.tsx`.
