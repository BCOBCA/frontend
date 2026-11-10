# Brand discovery and product covers

- Replace the horizontal brand filter with the supplied searchable brand directory: heading, search, All/A–Z filters, six-column logo grid on desktop, twelve initial entries and incremental reveal. Search and letters compose; changing either resets the reveal count. Preserve catalog product filtering when choosing a brand.
- Replace home logo tiles with six wide `coverUrl` cards, ordered ASUS, Apple, Dell, HP, LG, Lenovo where present. Three desktop columns, two mobile columns, source aspect ratio about 4.3:1, rounded corners. Reuse the directory on `/brands` with brand-detail navigation.
- Update all twenty database cover URLs with pastel-wave banners using actual brand logos and matching product imagery. Keep contact/profile fields and ownership intact; use new Cloudinary public IDs so old covers remain available.
- Plan: progress/filter tests; build responsive directory and cover grid; wire catalog and brands routes; compose, inspect and upload covers; update only the twenty cover URLs in a transaction; verify TypeScript, ESLint, Vitest and real-browser search/letters/reveal/selection/responsive layout.
- Commands in frontend: `npm test`, `npm run typecheck`, `npm run lint`. No dependencies, financial changes or schema changes. Preserve unrelated working changes.
