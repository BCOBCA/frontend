# Buyer/admin integration for shop vouchers

- Existing `/dai-ly/[slug]` product panel includes ShopVouchers; promotions panel renders the same live section instead of its old placeholder. Uses existing OfferCard and claim API, account/store-keyed paginated query and shared voucher cache invalidation. Guests are sent to login; collected cards stay non-claimable on the shop page.
- Voucher and OwnedVoucher DTOs append optional storeId/storeName. Buyer cards identify the issuing shop, wallet details distinguish shop/platform. Existing available-only wallet and checkout picker retained; no duplicate wallet or code-copy UI added.
- Shop vouchers must be collected before checkout, including the legacy single-code path. Existing store-scoped picker and independently selected shop/platform/shipping slots remain unchanged.
- Admin route `/admin-vouchers` is reachable from member menu only for Admin/SuperAdmin. Role gate prevents private queries; backend also checks roles. Supports shop/search/status/date filters, paging/statistics, detail and paged usage history, disable reason/confirmation/audit history. Existing buyer card reused in management list.
- Requires backend AddSellerVoucherManagement migration and API deployment. No additional dependencies or production fixtures.
- Browser QA with actual temporary API/database verified admin shop filtering/disable history and buyer claim appearing in the existing wallet; no application console errors in buyer/admin flows. Production database untouched.
- Final validation: 520 buyer tests, TypeScript and lint passed; shop claim tests cover login gating, store/account query scoping and existing-wallet cache refresh. Admin tests cover role gating and the management query contract.
