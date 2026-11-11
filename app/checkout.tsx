import { useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { LoginNotice, Page } from '../src/components/common/ui';
import { CheckoutView } from '../src/components/checkout/CheckoutView';
import { CheckoutSubmitBar } from '../src/components/checkout/CheckoutSubmitBar';
import { canSelectCartItem } from '../src/services/cart';
import { request } from '../src/services/api';
import { checkoutAffiliateToken } from '../src/services/affiliate-source';
import { selectCheckoutVoucher } from '../src/services/checkout-vouchers';
import { queryClient, useAuth } from '../src/stores/auth';
import type { Address, Cart, CheckoutPreview, Order } from '../src/types/api';
export default function Checkout() {
  const { width } = useWindowDimensions();
  const user = useAuth(state => state.user);
  const [addressId, setAddressId] = useState('');
  const [voucherCodes, setVoucherCodes] = useState<string[] | null>(null);
  const [note, setNote] = useState('');
  const key = useRef('');
  const attemptKey = useRef('');
  const source = useRef<{ key: string; token: string | null }>({ key: '', token: null });
  const cart = useQuery({ queryKey: ['cart'], queryFn: () => request<Cart>('GET', '/cart'), enabled: !!user });
  const addresses = useQuery({ queryKey: ['addresses'], queryFn: () => request<Address[]>('GET', '/addresses'), enabled: !!user });
  const selectedAddress = addresses.data?.find(item => item.id === addressId) ?? addresses.data?.find(item => item.isDefault) ?? addresses.data?.[0];
  const cartSelection = cart.data?.items.filter(item => item.isSelected).map(item => [item.id, item.variantId, item.quantity, item.unitPrice, item.isAvailable, item.availableStock]);
  const preview = useQuery({ queryKey: ['checkout-preview', user?.id, voucherCodes, cartSelection, selectedAddress?.id], queryFn: async () => {
    const result = await request<CheckoutPreview>('POST', '/orders/preview', { voucherCodes: voucherCodes ?? [], autoSelectVouchers: voucherCodes === null, addressId: selectedAddress?.id });
    if (!Array.isArray(result.vouchers) || !Array.isArray(result.appliedVoucherCodes)) throw new Error('Chưa tải được kho voucher. Vui lòng thử lại.');
    if (result.pricingPolicy !== 'STORE_PRODUCT_MAX_V1') throw new Error('Chưa tải được giá thanh toán mới. Vui lòng thử lại.');
    const stores = [...new Set(cart.data?.items.filter(item => item.isSelected).map(item => item.storeId))];
    if (stores.length > 1 && (!Array.isArray(result.storeOrders) || result.storeOrders.length !== stores.length || stores.some(id => !result.storeOrders!.some(order => order.storeId === id)))) throw new Error('Chưa tải được chi tiết đơn theo cửa hàng. Vui lòng thử lại.');
    return result;
  }, enabled: !!user && !!cart.data?.selectedCount && !!selectedAddress, staleTime: 0, placeholderData: (previous, previousQuery) => previousQuery?.queryKey[1] === user?.id ? previous : undefined });
  const completed = (order: Order) => { void queryClient.invalidateQueries({ queryKey: ['cart'] }); void queryClient.invalidateQueries({ queryKey: ['orders'] }); void queryClient.invalidateQueries({ queryKey: ['membership'] }); void queryClient.invalidateQueries({ queryKey: ['vouchers'] }); if (order.checkoutGroupId && order.checkoutOrders && order.checkoutOrders.length > 1) router.replace({ pathname: '/orders', params: { checkoutGroupId: order.checkoutGroupId } }); else router.replace({ pathname: '/order/[id]', params: { id: order.id } }); };
  const checkout = useMutation({ mutationFn: async () => { key.current ||= `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`; attemptKey.current = key.current; if (source.current.key !== key.current) source.current = { key: key.current, token: await checkoutAffiliateToken() }; return request<Order>('POST', '/orders', { addressId: selectedAddress?.id, paymentMethod: 'COD', voucherCodes: preview.data?.appliedVoucherCodes ?? [], note, expectedTotal: preview.data?.totalAmount, expectedCartHash: preview.data?.cartHash, ...(source.current.token ? { affiliateVisitToken: source.current.token } : {}) }, { 'Idempotency-Key': attemptKey.current }); }, onSuccess: completed, onError: async () => {
    if (useAuth.getState().user?.id !== user?.id) return;
    try { const existing = await request<Order | null>('GET', `/orders/requests/${encodeURIComponent(attemptKey.current)}`); if (existing) { completed(existing); return; } } catch { /* Preserve the original checkout error if connectivity is still unavailable. */ }
    void preview.refetch();
  } });
  const resetAttempt = () => { key.current = `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`; };
  const disabled = checkout.isPending || cart.isLoading || addresses.isLoading || cart.isFetching || addresses.isFetching || preview.isFetching || !!cart.error || !!addresses.error || !!checkout.error || !!preview.error || !preview.data || !selectedAddress || !cart.data?.selectedCount || !cart.data.items.some(item => item.isSelected) || cart.data.items.some(item => item.isSelected && !canSelectCartItem(item));
  return <Page title="Thanh toán" back bodyStyle={{ paddingHorizontal: width < 600 ? 12 : 16, paddingTop: 12, paddingBottom: 24 }} footer={user && width < 1000 ? <CheckoutSubmitBar total={preview.data?.totalAmount} count={cart.data?.selectedCount ?? 0} saving={(preview.data?.discountAmount ?? 0) + (preview.data?.shippingDiscountAmount ?? 0)} disabled={disabled} busy={checkout.isPending} onOrder={() => checkout.mutate()} /> : undefined}>
    {!user ? <LoginNotice /> : <CheckoutView cart={cart.data} addresses={addresses.data ?? []} addressId={selectedAddress?.id ?? ''} preview={preview.data}
      automaticVouchers={voucherCodes === null} note={note} busy={checkout.isPending} hideSubmitButton={width < 1000}
      loading={cart.isLoading || addresses.isLoading} refreshing={cart.isFetching || addresses.isFetching} previewLoading={preview.isFetching}
      error={cart.error || addresses.error || checkout.error} previewError={preview.error}
      onAddress={id => { setAddressId(id); resetAttempt(); }} onAddAddress={() => router.push('/address/new')} onCart={() => router.push('/cart')}
      onSelectVoucher={(category, code) => { setVoucherCodes(selectCheckoutVoucher(preview.data?.vouchers ?? [], preview.data?.appliedVoucherCodes ?? [], category, code)); resetAttempt(); }}
      onAutoVouchers={() => { if (voucherCodes === null) void preview.refetch(); else setVoucherCodes(null); resetAttempt(); }}
      onNote={value => { setNote(value.slice(0, 200)); resetAttempt(); }} onOrder={() => checkout.mutate()}
      onRetry={() => { void cart.refetch(); void addresses.refetch(); checkout.reset(); }} onRetryPreview={() => void preview.refetch()} />}
  </Page>;
}
