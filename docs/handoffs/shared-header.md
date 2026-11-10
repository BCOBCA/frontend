# Shared header — 2026-11-04

- `src/components/common/ui.tsx`: home and child pages share search and primary navigation. Child pages with `back` replace the logo/site name with a 44px back target and page title; back retains existing history/home fallback.
- Desktop keeps one row; mobile child pages put back/title above search/notifications. Home retains its compact logo/search/notification row. Search retains controlled catalog behavior or navigates to categories on submit on other pages.
- Desktop branding/back-title uses the same fixed 240px slot without shrinking, so page title length cannot move search/navigation. Browser assertions compare search and all five link rectangles between Home, Contact and the longer membership-level page at 1024/1440/1920px; positions and sizes match exactly.
- Increase desktop space between branding/title and search to 56px; mobile home adds 4px between logo and search. Keep enough width for all five desktop tab labels at the 1024px breakpoint.
- Verified: TypeScript, targeted ESLint, 37 frontend tests and isolated Chrome using API fixtures. Home/contact checked at 320/390/768/1024/1440/1920px: search present, correct logo versus back/title, five desktop links, mobile notifications and no horizontal overflow. Screenshots visually inspected on mobile and desktop.
