# Member subpage navigation

- Shared `Page` accepts `footerTab`. Address list, add/edit address and personal profile opt into the member footer; their standard headers show at all viewport widths.
- `PrimaryTabFooter` uses the existing five `primaryTabs`, colors, icon/label sizes and 88px + bottom-safe-area layout. It uses `router.navigate` and explicit selected semantics, so buttons occupy equal widths and avoid extra route pushes.
- Footer renders only below the shared 1024px breakpoint and outside `(tabs)`. Existing tab navigator routes never receive a second footer. Other stack pages are unchanged unless opted in.
- Footer is a sibling after the flex scroll view, reserving its own height and safe-area padding. Content can scroll fully above it; desktop uses the header navigation.
- Verification: shared header/footer tests cover destinations, member selection, desktop cutoff, duplicate prevention and opt-in scope. Browser preview at 390x844 confirmed five 78px-wide tabs, active member state, footer y=756..844 and the scrolled save button entirely above it. Synthetic form data only; no saved address changed. Temporary route removed.
