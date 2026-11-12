# Collaboration catalog

- Route `/info/collaboration`; existing home shortcut resolves here. `/affiliate` remains wallet management.
- Separate affiliate product card: image, name, real review summary, current/original price, effective rank commission, link action; no cart mutation.
- Card uses the standard product card's white background, 1.1 image ratio and spacing. Price area shows red `Kiếm …đ` (server-estimated commission, including zero), followed by current product price and crossed-out original price side by side. Commission rate is omitted from the card; discount percentage appears only on the upper-left badge. Screen reader label identifies estimated commission. Server budget/cap calculation remains authoritative.
- The affiliate grid caps actual image dimensions to the home catalog's responsive card width (6/3/2 columns and its gutters), while preserving the affiliate layout. Wider affiliate cards no longer enlarge product images beyond the standard catalog size.
- Card gaps are 14px. Media container height follows the capped image height instead of wider card dimensions; image-to-title gap is 6px to avoid excess whitespace.
- Link action is an outlined `Lấy link` button below prices, with Link2 icon, loading/disabled states and existing copy/share behavior. No upper-right link icon.
- Category strip loads all category pages; horizontal ScrollView supports touch/trackpad and left/right buttons with its scrollbar hidden. Root category selection includes descendants server-side.
- Authenticated catalog `/affiliate/products`, wallet `/affiliate`, existing link creation `/affiliate/links`. User-scoped queries; guest login state. Link action prevents duplicate clicks and retains manual copy/share if clipboard fails.
- Four desktop columns with income/help sidebar; two mobile columns. Loading, error/retry, empty and pagination states.
- Small-screen header uses the shared one-row back/title/search-icon/notification layout. Search opens in the existing popover and submits to the affiliate catalog filter; desktop keeps the inline controlled search input.
- Validation: 372 frontend tests passed, TypeScript passed, targeted ESLint passed, web export passed. Full lint remains blocked by pre-existing `OrderDetailView.tsx` parse error at line 94.
- Browser with synthetic API fixtures: desktop layout, last category reachable/filterable, income masking, link creation/copy fallback, no cart requests; mobile viewport/content both 375px, horizontal categories, two columns, no console errors. Fixtures are not production data.
- No dependencies, deployment or commit added for this feature.
