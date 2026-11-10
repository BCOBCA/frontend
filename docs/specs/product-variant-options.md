# Product variant options

- Show separate option groups from each product's variants: color, storage, size and other scalar attributes. Do not infer clothing sizes or storage from unstructured product names.
- Selecting an option must resolve to an actual in-stock variant, preserving other selected attributes where possible. Price, stock and cart requests use that variant's ID. Disable options with no stock; never create nonexistent combinations in the UI.
- Preserve a flat selector when legacy or inconsistent variant data cannot form complete attribute groups. Recognize explicit labeled demo variant names from the deployed legacy API while the new additive DTO fields are pending deployment.
- Add optional variant `attributes` (object) and `isSample` fields to the detail API; existing fields remain compatible. Reset selection by product ID.
- User authorized demo variants with unchanged prices and redistribution of existing total stock. Preserve original variant IDs/SKUs/reservations and existing cart/order references. No clothing products exist in the current 21-product dataset; support size selection through reusable UI/tests.
- Plan: test selection logic → implement API/selector → prepare and preview demo variants → backup/apply/read back → typecheck, lint, tests, web build and browser checks.
