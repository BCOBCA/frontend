# Floating search on mobile subpages

- Shared Header collapses search below 1024px on routes with a back button and no controlled search input. The one-row header retains back/title/search/notifications. Home and dedicated controlled search inputs continue using direct entry; desktop navigation remains inline.
- Search opens `HeaderSearchPopover` in a transparent cross-platform Modal, anchored to measured header bottom + 8px. The panel floats over content without changing page layout and focuses its input after showing.
- Close via X, outside tap, Escape/native back, or route blur. Input keeps its draft until submission. Search still trims whitespace, limits queries to 200 characters and uses the existing search route/callback.
- Submission waits for modal focus restoration, blurs the old search trigger, then navigates, avoiding focus left on an outgoing screen. Desktop/controlled submissions retain their existing callback flow.
- Verified 193 tests across 43 files, TypeScript and ESLint. Browser at 390px confirmed header height 60px, panel top 68px, unchanged content position, input autofocus, Escape dismissal and trimmed `Laptop` navigation with the popup removed. Existing bottom tabs remain in place. No saved account/address data was modified.
