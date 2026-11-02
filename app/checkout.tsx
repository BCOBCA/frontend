import { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Circle, CircleCheck } from 'lucide-react-native';
import { Button, Field, LoginNotice, Page, Status } from '../src/components/common/ui';
import { request } from '../src/services/api';
import { queryClient, useAuth } from '../src/stores/auth';
import type { Address, Cart, CheckoutPreview, Order } from '../src/types/api';
import { colors, money, styles as s } from '../src/theme';
export default function Checkout() {
  const user = useAuth(state => state.user);
  const [addressId, setAddressId] = useState('');
  const [voucher, setVoucher] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState('');
  const [note, setNote] = useState('');
  const key = useRef('');
  const attemptKey = useRef('');
  const cart = useQuery({ queryKey: ['cart'], queryFn: () => request<Cart>('GET', '/cart'), enabled: !!user });
  const addresses = useQuery({ queryKey: ['addresses'], queryFn: () => request<Address[]>('GET', '/addresses'), enabled: !!user });
  const preview = useQuery({ queryKey: ['checkout-preview', appliedVoucher, cart.data?.selectedTotal, cart.data?.selectedCount], queryFn: () => request<CheckoutPreview>('POST', '/orders/preview', { voucherCode: appliedVoucher || null }), enabled: !!user && !!cart.data?.selectedCount, staleTime: 0 });
  const completed = (order: Order) => { void queryClient.invalidateQueries({ queryKey: ['cart'] }); void queryClient.invalidateQueries({ queryKey: ['orders'] }); void queryClient.invalidateQueries({ queryKey: ['membership'] }); router.replace({ pathname: '/order/[id]', params: { id: order.id } }); };
  const checkout = useMutation({ mutationFn: () => { key.current ||= `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`; attemptKey.current = key.current; return request<Order>('POST', '/orders', { addressId: addressId || addresses.data?.find(x => x.isDefault)?.id || addresses.data?.[0]?.id, paymentMethod: 'COD', voucherCode: appliedVoucher || null, note, expectedTotal: preview.data?.totalAmount, expectedCartHash: preview.data?.cartHash }, { 'Idempotency-Key': attemptKey.current }); }, onSuccess: completed, onError: async () => {
    if (useAuth.getState().user?.id !== user?.id) return;
    try { const existing = await request<Order | null>('GET', `/orders/requests/${encodeURIComponent(attemptKey.current)}`); if (existing) { completed(existing); return; } } catch { /* Preserve the original checkout error if connectivity is still unavailable. */ }
    void preview.refetch();
  } });
  return <Page title="Thanh toán" back>{!user ? <LoginNotice /> : <View style={s.padded}><Status loading={cart.isLoading || addresses.isLoading} error={cart.error || addresses.error || checkout.error} retry={() => { void cart.refetch(); void addresses.refetch(); }} /><Text style={s.title}>Địa chỉ nhận hàng</Text>
    {addresses.data?.map((address, index) => { const selected = addressId ? address.id === addressId : address.isDefault || !addresses.data?.some(x => x.isDefault) && index === 0; return <Pressable accessibilityRole="radio" accessibilityState={{ selected }} disabled={checkout.isPending} key={address.id} style={[s.card, s.row]} onPress={() => { setAddressId(address.id); key.current = `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`; }}>{selected ? <CircleCheck color={colors.primary} /> : <Circle color={colors.muted} />}<View style={{ flex: 1 }}><Text style={s.body}>{address.recipientName} · {address.phone}</Text><Text style={s.small}>{address.addressLine}, {address.wardCode}, {address.provinceCode}</Text></View></Pressable>; })}
    <Button title="Thêm địa chỉ" outline onPress={() => router.push('/address/new')} />
    <View style={s.card}><Text style={s.title}>Thanh toán khi nhận hàng (COD)</Text><Status loading={preview.isFetching} error={preview.error} retry={() => void preview.refetch()} />{preview.data && <><Text style={s.body}>Tiền hàng: {money(preview.data.subtotal)}</Text><Text style={s.body}>Giảm giá: {money(preview.data.discountAmount)}</Text><Text style={s.body}>Phí giao hàng: {money(preview.data.shippingFee)}</Text><Text style={s.price}>Tổng thanh toán: {money(preview.data.totalAmount)}</Text></>}</View>
    <Field label="Mã voucher (nếu có)" value={voucher} editable={!checkout.isPending} onChangeText={setVoucher} autoCapitalize="characters" maxLength={50} />
    <Button title="Áp dụng voucher" outline disabled={checkout.isPending} onPress={() => { setAppliedVoucher(voucher.trim().toUpperCase()); key.current = `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`; }} />
    <Field label="Ghi chú" value={note} editable={!checkout.isPending} onChangeText={value => { setNote(value); key.current = `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`; }} multiline maxLength={2000} />
    <Button title={checkout.isPending ? 'Đang đặt hàng...' : 'Đặt hàng'} disabled={checkout.isPending || preview.isFetching || !preview.data || !!preview.error || !cart.data?.selectedCount || !addresses.data?.length || !!cart.error || !!addresses.error} onPress={() => checkout.mutate()} />
  </View>}</Page>;
}
