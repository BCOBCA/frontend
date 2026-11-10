import { useLocalSearchParams, router } from 'expo-router';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Heart, Link2, Minus, Plus, ShoppingCart, Star, Zap } from 'lucide-react-native';
import { Button, Field, Page, Status } from '../../src/components/common/ui';
import { request } from '../../src/services/api';
import { queryClient, useAuth } from '../../src/stores/auth';
import { useToast } from '../../src/stores/toast';
import { colors, money, styles as s } from '../../src/theme';
import type { Brand, Page as ApiPage, Product } from '../../src/types/api';
import type { Review } from '../../src/components/product/ProductReviews';
import { ProductVariantSelector } from '../../src/components/product/ProductVariantSelector';
import { ProductGallery } from '../../src/components/product/ProductGallery';
import { ProductDetailInfo } from '../../src/components/product/ProductDetailInfo';
import { detailPanel, ProductDetailSidebar } from '../../src/components/product/ProductDetailSidebar';
import { prepareProductCheckout } from '../../src/services/product-purchase';
import { ShareLinkActions } from '../../src/components/affiliate/ShareLinkActions';
import { recordAffiliateVisit } from '../../src/services/affiliate-source';

const schema = z.object({ customerName: z.string().min(2).max(150), phone: z.string().regex(/^\+?[0-9]{9,15}$/), email: z.union([z.email(), z.literal('')]), description: z.string().min(5).max(10000) });
export default function ProductDetail() {
  const { id, service, aff, ref: referral } = useLocalSearchParams<{ id: string; service?: string; aff?: string; ref?: string }>();
  const user = useAuth(state => state.user);
  const showToast = useToast(state => state.show);
  const { width } = useWindowDimensions();
  const wide = width >= 1100;
  const split = width >= 780;
  const gutter = width >= 700 ? 24 : 12;
  const sidebarWidth = wide ? 248 : Math.min(width, 1180) - gutter * 2;
  const [selection, setSelection] = useState({ productId: '', variantId: '', quantity: 1 });
  const { mutate: track, error: trackError } = useMutation({ mutationFn: recordAffiliateVisit });
  useEffect(() => { if (typeof aff === 'string' && service !== '1') track(aff); }, [aff, service, track]);
  const affiliateLink = useMutation({ mutationFn: () => request<{ url: string }>('POST', '/affiliate/links', { productId: id }) });
  const loginToProduct = () => router.push({ pathname: '/login', params: { productId: id, ...(typeof referral === 'string' ? { ref: referral } : {}), ...(service === '1' ? { service } : {}), ...(typeof aff === 'string' ? { aff } : {}) } });
  const product = useQuery({ queryKey: ['product', id, service], queryFn: () => request<Product>('GET', `/${service === '1' ? 'services' : 'products'}/${id}`) });
  const brand = useQuery({ queryKey: ['brand', product.data?.brandId], queryFn: () => request<Brand>('GET', `/brands/${product.data!.brandId}`), enabled: !!product.data?.brandId });
  const reviews = useQuery({ queryKey: ['reviews', id, 1], queryFn: () => request<ApiPage<Review>>('GET', `/products/${id}/reviews?page=1`), enabled: service !== '1' });
  const variants = product.data?.variants ?? [];
  const variantId = selection.productId === id ? selection.variantId : product.data?.variantId;
  const variant = variants.find(item => item.id === variantId) ?? variants.find(item => item.availableStock > 0) ?? variants[0];
  const maxQuantity = Math.min(999, variant?.availableStock ?? 0);
  const quantity = Math.max(1, Math.min(selection.productId === id ? selection.quantity : 1, maxQuantity || 1));
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { customerName: user?.fullName ?? '', phone: user?.phone ?? '', email: user?.email ?? '', description: '' } });
  const consult = useMutation({ mutationFn: (values: z.infer<typeof schema>) => request('POST', '/services/requests', { serviceId: id, ...values }) });
  const add = useMutation({ mutationFn: (buyNow: boolean) => {
    if (!variant || maxQuantity < quantity) throw new Error('Phiên bản này hiện không đủ tồn kho.');
    return buyNow ? prepareProductCheckout(id, variant.id, quantity) : request('POST', '/cart/items', { productId: id, variantId: variant.id, quantity });
  }, onSuccess: async (_, buyNow) => {
    if (!buyNow) showToast('Đã thêm vào giỏ hàng.');
    await queryClient.invalidateQueries({ queryKey: ['cart'] });
    if (buyNow) router.push('/checkout');
  }, onError: () => {
    showToast('Lỗi: thêm giỏ hàng thất bại', 'error');
    return queryClient.invalidateQueries({ queryKey: ['cart'] });
  } });
  const favorite = useMutation({ mutationFn: () => request(product.data?.isFavorite ? 'DELETE' : 'PUT', `/favorites/${id}`), onSuccess: () => Promise.all(['product', 'products', 'brand-products', 'favorites'].map(name => queryClient.invalidateQueries({ queryKey: [name] }))) });
  const fields = { customerName: 'Họ tên', phone: 'Số điện thoại', email: 'Email', description: 'Nội dung cần tư vấn' };
  const originalPrice = variant?.price ?? product.data?.price;
  const currentPrice = variant ? variant.salePrice ?? variant.price : product.data?.salePrice ?? product.data?.price;
  const saving = originalPrice != null && currentPrice != null ? Math.max(0, originalPrice - currentPrice) : 0;
  const discount = originalPrice && saving ? Math.round(saving / originalPrice * 100) : 0;
  const canBuy = !!variant && maxQuantity > 0 && !add.isPending;
  const reviewCount = reviews.data?.totalItems ?? 0;
  const average = reviewCount > 0 && reviews.data?.items.length === reviewCount ? reviews.data.items.reduce((sum, item) => sum + item.rating, 0) / reviewCount : null;
  return <Page title={product.data?.isService ? 'Chi tiết dịch vụ' : 'Chi tiết sản phẩm'} back bodyStyle={{ paddingHorizontal: gutter, paddingTop: 14, paddingBottom: 28, gap: 16 }}>
    <Status loading={product.isLoading} error={product.error} retry={() => void product.refetch()} />
    {product.data && <>
      <View style={{ flexDirection: wide ? 'row' : 'column', alignItems: 'flex-start', gap: 16 }}>
        <View style={{ flex: wide ? 1 : undefined, width: wide ? undefined : '100%', minWidth: 0, gap: 16 }}>
          <View style={{ ...detailPanel, padding: 18, flexDirection: split ? 'row' : 'column', gap: 22 }}>
            <View style={{ flex: split ? 1 : undefined, width: split ? undefined : '100%', minWidth: 0 }}><ProductGallery key={id} name={product.data.name} imageUrl={product.data.imageUrl} imageUrls={product.data.imageUrls} vertical={split} height={split ? 430 : 300} /></View>
            <View style={{ flex: split ? 1.05 : undefined, minWidth: 0, gap: 13 }}>
              <View style={{ alignSelf: 'flex-start', borderRadius: 4, backgroundColor: '#FFF0ED', paddingHorizontal: 8, paddingVertical: 4 }}><Text style={{ fontSize: 10, fontWeight: '700', color: colors.primary }}>{product.data.isService ? 'DỊCH VỤ' : maxQuantity > 0 ? 'CÒN HÀNG' : 'TẠM HẾT HÀNG'}</Text></View>
              <Text accessibilityRole="header" style={{ color: colors.text, fontSize: split ? 22 : 23, lineHeight: 30, fontWeight: '700' }}>{product.data.name}</Text>
              {!product.data.isService && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Star size={14} color={average !== null ? '#F6AD20' : '#AEB4C0'} fill={average !== null ? '#F6AD20' : 'transparent'} /><Text style={{ fontSize: 12, color: colors.muted }}>{average !== null ? `${average.toFixed(1)} · ` : ''}{reviewCount ? `${reviewCount} đánh giá` : 'Chưa có đánh giá'}</Text></View>}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 9 }}><Text style={{ fontSize: 25, lineHeight: 34, fontWeight: '700', color: colors.primary }}>{currentPrice == null ? 'Liên hệ' : money(currentPrice)}</Text>{saving > 0 && <><Text style={{ fontSize: 12, color: colors.muted, textDecorationLine: 'line-through' }}>{money(originalPrice!)}</Text><View style={{ paddingHorizontal: 5, paddingVertical: 3, backgroundColor: '#FFF0ED', borderRadius: 4 }}><Text style={{ color: colors.primary, fontSize: 10, fontWeight: '600' }}>-{discount}%</Text></View></>}</View>
              {saving > 0 && <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, padding: 10, backgroundColor: '#FFF4F2', borderRadius: 6 }}><Zap size={15} color={colors.primary} /><Text style={{ fontSize: 12, color: colors.primary, fontWeight: '500' }}>Tiết kiệm {money(saving)}</Text></View>}
              <View style={{ height: 1, backgroundColor: colors.border }} />
              {product.data.isService ? <View style={{ gap: 12 }}><Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>Yêu cầu tư vấn</Text>
                {(Object.keys(fields) as (keyof typeof fields)[]).map(name => <Controller key={name} control={form.control} name={name} render={({ field }) => <Field label={fields[name]} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={form.formState.errors[name]?.message} multiline={name === 'description'} />} />)}
                <Button title={consult.isPending ? 'Đang gửi...' : 'Gửi yêu cầu tư vấn'} disabled={consult.isPending} onPress={() => user ? void form.handleSubmit(values => consult.mutate(values))() : loginToProduct()} />{consult.isSuccess && <Text style={s.body}>Đã gửi yêu cầu. Chúng tôi sẽ liên hệ với bạn.</Text>}<Status error={consult.error} />
              </View> : <>
                <ProductVariantSelector variants={variants} selected={variant} compact={split} onSelect={variantId => { setSelection({ productId: id, variantId, quantity: 1 }); add.reset(); }} />
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}><Text style={{ fontSize: 12, color: colors.text }}>Số lượng:</Text><View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 6, overflow: 'hidden' }}>
                  <Pressable accessibilityRole="button" accessibilityLabel="Giảm số lượng" disabled={quantity <= 1 || add.isPending} onPress={() => setSelection({ productId: id, variantId: variant!.id, quantity: quantity - 1 })} style={{ padding: 10, opacity: quantity <= 1 ? 0.35 : 1 }}><Minus size={13} color={colors.text} /></Pressable><Text accessibilityLabel="Số lượng sản phẩm" style={{ minWidth: 26, textAlign: 'center', fontSize: 13, color: colors.text }}>{quantity}</Text>
                  <Pressable accessibilityRole="button" accessibilityLabel="Tăng số lượng" disabled={quantity >= maxQuantity || add.isPending} onPress={() => setSelection({ productId: id, variantId: variant!.id, quantity: quantity + 1 })} style={{ padding: 10, opacity: quantity >= maxQuantity ? 0.35 : 1 }}><Plus size={13} color={colors.text} /></Pressable>
                </View><Text style={{ fontSize: 11, color: colors.muted }}>Còn {variant?.availableStock ?? 0} sản phẩm</Text></View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable accessibilityRole="button" accessibilityLabel="Thêm vào giỏ hàng" disabled={!canBuy} onPress={() => user ? add.mutate(false) : loginToProduct()} style={{ minHeight: 44, flex: 1, borderWidth: 1, borderColor: colors.primary, borderRadius: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: canBuy ? 1 : 0.4 }}><ShoppingCart size={17} color={colors.primary} /><Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>{add.isPending && !add.variables ? 'Đang thêm...' : 'Thêm vào giỏ'}</Text></Pressable>
                  <Pressable accessibilityRole="button" accessibilityLabel="Mua ngay" disabled={!canBuy} onPress={() => user ? add.mutate(true) : loginToProduct()} style={{ minHeight: 44, flex: 1, backgroundColor: colors.primary, borderRadius: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: canBuy ? 1 : 0.4 }}><Zap size={16} color="white" /><Text style={{ color: colors.surface, fontSize: 12, fontWeight: '600' }}>{add.isPending && add.variables ? 'Đang xử lý...' : 'Mua ngay'}</Text></Pressable>
                  <Pressable accessibilityRole="button" accessibilityLabel={product.data.isFavorite ? 'Bỏ yêu thích' : 'Thêm yêu thích'} aria-pressed={product.data.isFavorite} disabled={favorite.isPending} onPress={() => user ? favorite.mutate() : loginToProduct()} style={{ width: 42, borderWidth: 1, borderColor: colors.border, borderRadius: 6, alignItems: 'center', justifyContent: 'center' }}><Heart size={19} color={product.data.isFavorite ? colors.primary : colors.muted} fill={product.data.isFavorite ? colors.primary : 'transparent'} /></Pressable>
                </View>
                <Status error={favorite.error} />
              </>}
            </View>
          </View>
          <ProductDetailInfo key={id} product={product.data} variant={variant} brand={brand.data} wide={split} />
        </View>
        <ProductDetailSidebar product={product.data} brand={brand.data} width={sidebarWidth}>
          {!product.data.isService && <View style={detailPanel}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Link2 size={17} color={colors.primary} /><Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>Chia sẻ & nhận hoa hồng</Text></View><Text style={{ color: colors.muted, fontSize: 12, lineHeight: 19 }}>Tạo link Affiliate riêng và chia sẻ sản phẩm bạn yêu thích.</Text><Button title={affiliateLink.isPending ? 'Đang tạo link...' : 'Tạo link Affiliate'} disabled={affiliateLink.isPending} outline onPress={() => user ? affiliateLink.mutate() : loginToProduct()} /><Status error={affiliateLink.error || trackError} />{affiliateLink.data && <ShareLinkActions url={affiliateLink.data.url} />}</View>}
        </ProductDetailSidebar>
      </View>
    </>}
  </Page>;
}
