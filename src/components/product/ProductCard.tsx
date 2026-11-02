import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Heart, Phone, Package } from 'lucide-react-native';
import { useMutation } from '@tanstack/react-query';
import type { Product } from '../../types/api';
import { colors, money, styles as s } from '../../theme';
import { request } from '../../services/api';
import { queryClient, useAuth } from '../../stores/auth';
import { Status } from '../common/ui';

export function ProductCard({ item, width }: { item: Product; width: number }) {
  const user = useAuth(state => state.user);
  const favorite = item.isFavorite;
  const mutation = useMutation({ mutationFn: () => request(favorite ? 'DELETE' : 'PUT', `/favorites/${item.id}`), onSuccess: async () => {
    await Promise.all(['products', 'brand-products', 'product', 'favorites'].map(name => queryClient.invalidateQueries({ queryKey: [name] })));
  } });
  const open = () => router.push({ pathname: '/product/[id]', params: { id: item.id, service: item.isService ? '1' : '0' } });
  return <View style={{ width, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 9, padding: 8, gap: 12 }}>
    <Pressable accessibilityRole="button" accessibilityLabel={item.name} onPress={open}>
      {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={{ width: '100%', aspectRatio: 1.35 }} contentFit="cover" accessibilityLabel={item.name} /> : <View style={[s.center, { aspectRatio: 1.35, backgroundColor: colors.background }]}><Package color={colors.muted} size={36} /></View>}
    </Pressable>
    {!item.isService && <Pressable accessibilityRole="button" disabled={mutation.isPending} accessibilityLabel={favorite ? 'Bỏ yêu thích' : 'Thêm yêu thích'} onPress={() => user ? mutation.mutate() : router.push('/login')} style={{ alignSelf: 'flex-end', padding: 8 }}><Heart size={23} color={colors.muted} fill={favorite ? colors.primary : 'transparent'} /></Pressable>}
    <Pressable accessibilityRole="button" onPress={open}><Text numberOfLines={3} style={s.body}>{item.name}</Text></Pressable>
    {item.price !== null && <Text style={s.price}>{money(item.salePrice ?? item.price)}</Text>}
    {item.isService && <Pressable accessibilityRole="button" onPress={open} style={[s.row, { justifyContent: 'center', paddingVertical: 9, borderWidth: 1, borderRadius: 8, borderColor: colors.primary }]}><Phone size={22} color={colors.primary} /><Text style={{ color: colors.primary, fontSize: 15, fontWeight: '600' }}>Tư vấn ngay</Text></Pressable>}
    <Status error={mutation.error} />
  </View>;
}
