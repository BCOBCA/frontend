# My orders cards

Match the supplied reference using the existing red/white theme: compact code/date header with copy control and status pill, shop heading, first product image/name/variant/quantity/line amount per shop, then total and state-specific actions. Show +N other products for hidden lines, linking to full details. Stack gracefully on phones with 44px controls. Preserve authentication, paging, checkout-group filters, loading/error/empty states and historic multi-shop orders.

The list API adds optional items with existing order-item metadata; fetch the current page's lines in a single batch scoped to authorized order IDs. No schema changes or new dependencies. Existing cancellation rules remain PENDING+UNPAID. Shipping links to order details; completed orders link to reviews and allow returning to the product page to purchase again when a single product is present. Missing/deleted product images use a package fallback.

Implementation order: additive API and ownership regression assertion; presentational OrderListCard; route actions/copy/error feedback; focused tests; TypeScript/lint; desktop/mobile browser fixture. Commands: `npm test`, `npm run typecheck`, `npm run lint`; backend targeted `dotnet test --filter FullyQualifiedName~StoreSplitCheckoutFlowTests` with .NET 10.
