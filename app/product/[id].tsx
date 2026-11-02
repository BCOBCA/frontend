import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Field, Page, Status } from '../../src/components/common/ui';
import { request } from '../../src/services/api';
import { queryClient, useAuth } from '../../src/stores/auth';
import { colors, money, styles as s } from '../../src/theme';
import type { Product } from '../../src/types/api';
import { ProductReviews } from '../../src/components/product/ProductReviews';

const schema = z.object({ customerName: z.string().min(2).max(150), phone: z.string().regex(/^\+?[0-9]{9,15}$/), email: z.union([z.email(), z.literal('')]), description: z.string().min(5).max(10000) });
export default function ProductDetail() {
  const { id, service } = useLocalSearchParams<{ id: string; service?: string }>();
  const user = useAuth(state => state.user);
  const { width } = useWindowDimensions();
  const [variantId, setVariantId] = useState('');
  const product = useQuery({ queryKey: ['product', id, service], queryFn: () => request<Product>('GET', `/${service === '1' ? 'services' : 'products'}/${id}`) });
  const variant = product.data?.variants?.find(item => item.id === (variantId || product.data?.variantId));
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { customerName: user?.fullName ?? '', phone: user?.phone ?? '', email: user?.email ?? '', description: '' } });
  const consult = useMutation({ mutationFn: (values: z.infer<typeof schema>) => request('POST', '/services/requests', { serviceId: id, ...values }) });
  const add = useMutation({ mutationFn: () => request('POST', '/cart/items', { productId: id, variantId: variant?.id, quantity: 1 }), onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['cart'] }) });
  const fields = { customerName: 'Họ tên', phone: 'Số điện thoại', email: 'Email', description: 'Nội dung cần tư vấn' };
  return <Page title={product.data?.isService ? 'Chi tiết dịch vụ' : 'Chi tiết sản phẩm'} back><Status loading={product.isLoading} error={product.error} retry={() => void product.refetch()} />
    {product.data && <View style={s.padded}>{product.data.imageUrls?.length ? <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>{product.data.imageUrls.map(url => <Image key={url} source={{ uri: url }} style={{ width: Math.min(width, 1180) - 32, height: 260 }} contentFit="contain" accessibilityLabel={product.data!.name} />)}</ScrollView> : product.data.imageUrl ? <Image source={{ uri: product.data.imageUrl }} style={{ width: '100%', height: 260 }} contentFit="contain" /> : null}
      <Text style={s.title}>{product.data.name}</Text>{product.data.price !== null && <Text style={s.price}>{money(variant ? variant.salePrice ?? variant.price : product.data.salePrice ?? product.data.price)}</Text>}
      <Text style={s.body}>{product.data.description}</Text><Button title="Xem thương hiệu" outline onPress={() => router.push({ pathname: '/brand/[id]', params: { id: product.data!.brandId } })} />
      {product.data.isService ? <View style={s.card}><Text style={s.title}>Yêu cầu tư vấn</Text>
        {(Object.keys(fields) as (keyof typeof fields)[]).map(name => <Controller key={name} control={form.control} name={name} render={({ field }) => <Field label={fields[name]} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={form.formState.errors[name]?.message} multiline={name === 'description'} />} />)}
        <Button title={consult.isPending ? 'Đang gửi...' : 'Gửi yêu cầu tư vấn'} disabled={consult.isPending} onPress={() => user ? void form.handleSubmit(values => consult.mutate(values))() : router.push('/login')} />{consult.isSuccess && <Text style={s.body}>Đã gửi yêu cầu. Chúng tôi sẽ liên hệ với bạn.</Text>}<Status error={consult.error} />
      </View> : <><Text style={s.body}>Phân loại</Text><View style={[s.row, { flexWrap: 'wrap' }]}>{product.data.variants?.map(item => <Pressable key={item.id} accessibilityRole="radio" accessibilityState={{ selected: variant?.id === item.id }} onPress={() => setVariantId(item.id)} style={{ padding: 12, borderWidth: 1, borderRadius: 8, borderColor: variant?.id === item.id ? colors.primary : colors.border }}><Text style={s.body}>{item.name}</Text></Pressable>)}</View><Text style={s.small}>Tồn kho khả dụng: {variant?.availableStock ?? 0}</Text><Button title={add.isPending ? 'Đang thêm...' : 'Thêm vào giỏ hàng'} disabled={add.isPending || !variant || variant.availableStock <= 0} onPress={() => user ? add.mutate() : router.push('/login')} />{add.isSuccess && <Button title="Đã thêm — Xem giỏ hàng" outline onPress={() => router.push('/cart')} />}<Status error={add.error} /></>}
      {!product.data.isService && <ProductReviews productId={id} />}
    </View>}
  </Page>;
}
