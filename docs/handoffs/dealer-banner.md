# Dealer banner refresh

- `src/components/dealers/DealerHero.tsx`: replace the flat storefront SVG with a generated 3D storefront background matching the supplied red reference; white/gold two-line heading, no eyebrow, rounded corners and compact mobile copy. Keep the existing side information panel and shared header.
- `assets/dealer-banner-3d.png`: local bundled 2172×724 artwork with an empty text area on the left, red/ivory storefront, location pin and parcels on the right. Text remains accessible native UI text, not baked into the asset.
- Keep factual discovery/follow copy rather than unsupported product/authenticity promises from the visual reference.
- On React Native Web, explicitly set ImageBackground imageStyle width/height to 100% so intrinsic image dimensions do not crop the artwork to its empty left side.
- Verified frontend typecheck, ESLint, desktop and mobile browser rendering; no horizontal overflow. No changes to dealer APIs, data or notification screens.
