# Shipping address editor

- Redesigned `/address/new` and `/address/[id]` using the supplied white/red split-card reference. Added an SVG map-pin/package illustration, delivery benefits, labeled icon fields, default switch and cancel/save actions. Phone layout stacks the intro and form.
- User explicitly chose the current two-level province → ward catalog, omitting districts. `src/services/address-locations.ts` uses [Province Open API v2](https://provinces.open-api.vn/), validates responses and preserves padded code strings. Requests omit session credentials, time out after 15 seconds, and are cached through React Query for a day.
- Province changes clear the previous ward. Selectors support Vietnamese search without accents, loading, retry and empty states, and close when their route loses focus. Unknown existing codes remain visible instead of being silently replaced.
- Existing address GET/POST/PUT contracts and edit hydration remain intact. Added Vietnamese validation messages, submission disabling and a safe navigation fallback for direct links.
- Verification: 8 focused tests, TypeScript and full ESLint passed. Browser preview exercised live province/ward catalogs, search, parent reset, default toggle and validated submission payload (`01` / `00004`). Desktop and 375px screenshots checked; no horizontal overflow. Keyboard submission showed required-field errors.
- Authenticated persistence was not exercised: the isolated preview origin received the existing session API CORS rejection. Preview used the real form and public catalog; no account or saved address was modified. Temporary preview route removed.
- Existing address list/order rendering still displays location codes; changing those consumers was outside this page redesign.
