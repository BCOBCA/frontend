# About landing page

Replace the public `/info/about` placeholder with a responsive product landing page for Báo chí Online BCA. User clarified the content should introduce the web/app, not publish company/legal/contact details. Preserve the existing red/white shell, back navigation and member footer.

Design: image-backed red storefront hero using the existing local dealer banner; product exploration CTA and store CTA; quick links; short mission/value story; an illustrated buying journey paired with actual app capabilities; an Affiliate invitation with policy link; accessible FAQ accordion; final discovery/support CTA. Avoid invented metrics, endorsements, official affiliations, guarantees or contact details. Product illustration is decorative and contains no fake live orders or active controls.

Implementation: presentational AboutView + AboutScreen using shared Page; dispatch the about slug in the existing info route without changing other information pages. Use existing React Native/Expo image/Lucide/theme modules, no dependencies or backend changes. Actions lead to existing routes and FAQ supports keyboard/screen readers. Stack at mobile widths; no horizontal overflow.

Checks: focused content/navigation/route tests, `npm run typecheck`, `node node_modules/eslint/bin/eslint.js . --no-cache`, `npm test`, `npm run build`; inspect actual view at desktop/375px and test FAQ in a browser fixture.
