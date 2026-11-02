import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ShoppingCart, Minus, Plus, Trash2, Square, SquareCheck } from 'lucide-react-native';
import { router } from 'expo-router';
import { Header, Button, Status, LoginNotice } from '../../src/components/common/ui';
import { queryClient, useAuth } from '../../src/stores/auth';
import { request } from '../../src/services/api';
import { colors, money, styles as s } from '../../src/theme';
import type { Cart, CartItem } from '../../src/types/api';

export default function CartScreen() {
  const user = useAuth(state => state.user);
  const cart = useQuery({ queryKey: ['cart'], queryFn: () => request<Cart>('GET', '/cart'), enabled: !!user });
  const mutation = useMutation({ mutationFn: ({ item, quantity, selected, remove }: { item: CartItem; quantity?: number; selected?: boolean; remove?: boolean }) => request(remove ? 'DELETE' : 'PUT', `/cart/items/${item.id}`, remove ? undefined : { quantity: quantity ?? item.quantity, isSelected: selected ?? item.isSelected }), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['cart'] }) });
  return <SafeAreaView style={[s.page, { backgroundColor: colors.primary }]} edges={['top', 'left', 'right']}><Header title="Giỏ hàng" />
    <ScrollView style={s.page} contentContainerStyle={[s.container, { flexGrow: 1, padding: 16, gap: 12 }]}>
      {!user ? <LoginNotice /> : <>
        <Status loading={cart.isLoading} error={cart.error || mutation.error} retry={() => void cart.refetch()} />
        {cart.data?.items.length === 0 && <View style={[s.center, { paddingTop: 32 }]}><ShoppingCart color={colors.disabled} size={112} strokeWidth={1} /><Text style={[s.muted, { fontSize: 18, marginTop: 24 }]}>Giỏ hàng trống</Text></View>}
        {cart.data?.items.map(item => <View key={item.id} style={s.card}><Text style={s.small}>{item.brandName}</Text><View style={s.row}><Pressable accessibilityRole="checkbox" accessibilityState={{ checked: item.isSelected, disabled: mutation.isPending }} accessibilityLabel={`Chọn ${item.name}`} disabled={mutation.isPending} onPress={() => mutation.mutate({ item, selected: !item.isSelected })} style={{ padding: 8 }}>{item.isSelected ? <SquareCheck color={colors.primary} /> : <Square color={colors.muted} />}</Pressable>
          {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={{ width: 64, height: 64 }} contentFit="cover" /> : null}
          <View style={{ flex: 1, gap: 6 }}><Text style={s.body}>{item.name}</Text><Text style={s.small}>{item.variantName}</Text>{!item.isAvailable && <Text style={s.error}>Sản phẩm ngừng kinh doanh</Text>}<Text style={s.price}>{money(item.unitPrice)}</Text></View></View>
          <View style={s.between}><View style={s.row}><Pressable accessibilityRole="button" accessibilityLabel="Giảm số lượng" disabled={mutation.isPending || item.quantity <= 1} onPress={() => mutation.mutate({ item, quantity: item.quantity - 1 })} style={{ padding: 10 }}><Minus color={colors.text} size={18} /></Pressable><Text style={s.body}>{item.quantity}</Text><Pressable accessibilityRole="button" accessibilityLabel="Tăng số lượng" disabled={mutation.isPending || item.quantity >= item.availableStock} onPress={() => mutation.mutate({ item, quantity: item.quantity + 1 })} style={{ padding: 10 }}><Plus color={colors.text} size={18} /></Pressable></View><Pressable accessibilityRole="button" accessibilityLabel={`Xóa ${item.name}`} disabled={mutation.isPending} onPress={() => mutation.mutate({ item, remove: true })} style={{ padding: 10 }}><Trash2 size={20} color={colors.muted} /></Pressable></View>
        </View>)}
      </>}
    </ScrollView>
    <View style={{ backgroundColor: colors.surface }}><View style={[s.container, s.between, { padding: 16 }]}><View><Text style={s.body}>Tổng tiền:</Text><Text style={s.price}>{money(cart.data?.selectedTotal ?? 0)}</Text></View><Button title={`Mua hàng (${cart.data?.selectedCount ?? 0})`} disabled={!user || !cart.data?.selectedCount || !!cart.error || mutation.isPending} onPress={() => router.push('/checkout')} /></View></View>
  </SafeAreaView>;
}
