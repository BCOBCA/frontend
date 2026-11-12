import { useEffect, useRef, useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { LoginNotice, Page, Status } from '../components/common/ui';
import { AffiliateCategoryStrip } from '../components/affiliate/AffiliateCategoryStrip';
import { AffiliateCatalogGrid } from '../components/affiliate/AffiliateCatalogGrid';
import { AffiliateIncomeCard, CollaborationHelp } from '../components/affiliate/CollaborationSidebar';
import { ShareLinkActions } from '../components/affiliate/ShareLinkActions';
import { affiliateProductsPath, loadAllAffiliateCategories, type AffiliateProduct } from '../components/affiliate/affiliate-catalog';
import { errorMessage, request } from '../services/api';
import { useAuth } from '../stores/auth';
import { useToast } from '../stores/toast';
import { DESKTOP_HEADER_WIDTH } from '../navigation/tabs';
import type { Affiliate, Category, Page as ResultPage } from '../types/api';

export default function CollaborationScreen() {
  const user = useAuth(state => state.user);
  const showToast = useToast(state => state.show);
  const client = useQueryClient();
  const { width } = useWindowDimensions();
  const wide = width >= 1000;
  const [draft, setDraft] = useState('');
  const [filter, setFilter] = useState({ page: 1, search: '', categoryId: '' });
  const [shared, setShared] = useState<{ name: string; url: string; userId?: string } | null>(null);
  const linkLock = useRef(false);
  const categories = useQuery({ queryKey: ['categories', 'collaboration'], queryFn: () => loadAllAffiliateCategories<Category>(page => request<ResultPage<Category>>('GET', `/categories?page=${page}&pageSize=100`)) });
  const wallet = useQuery({ queryKey: ['affiliate', user?.id], queryFn: () => request<Affiliate>('GET', '/affiliate'), enabled: !!user });
  const products = useQuery({ queryKey: ['affiliate-products', user?.id, filter.page, filter.categoryId, filter.search], queryFn: () => request<ResultPage<AffiliateProduct>>('GET', affiliateProductsPath(filter.page, filter.search, filter.categoryId)), enabled: !!user });
  const link = useMutation({ mutationFn: (item: AffiliateProduct) => request<{ url: string }>('POST', '/affiliate/links', { productId: item.id }), onSuccess: async (result, item) => {
    setShared({ name: item.name, url: result.url, userId: user?.id });
    void client.invalidateQueries({ queryKey: ['affiliate-links'] });
    try { if (!await Clipboard.setStringAsync(result.url)) throw new Error(); showToast('Đã sao chép link cộng tác.'); }
    catch { showToast('Link đã tạo. Bạn có thể sao chép hoặc chia sẻ bên dưới.', 'error'); }
  }, onError: error => showToast(errorMessage(error), 'error'), onSettled: () => { linkLock.current = false; } });
  useEffect(() => {
    const search = draft.trim().slice(0, 200);
    if (search === filter.search) return;
    const timer = setTimeout(() => setFilter(current => ({ ...current, page: 1, search })), 300);
    return () => clearTimeout(timer);
  }, [draft, filter.search]);
  const manage = () => router.push(user ? '/affiliate' : '/login');
  const income = <AffiliateIncomeCard wallet={user ? wallet.data : undefined} signedIn={!!user} error={wallet.error ? errorMessage(wallet.error) : undefined} onRetry={() => void wallet.refetch()} onManage={manage} />;
  const help = <CollaborationHelp onPolicy={() => router.push('/info/affiliate')} />;
  return <Page title="Cộng tác" back footerTab="member" search={draft} searchPlaceholder="Tìm kiếm sản phẩm, danh mục..." onSearch={width >= DESKTOP_HEADER_WIDTH ? setDraft : undefined} onSubmitSearch={value => { const search = value.trim().slice(0, 200); setDraft(search); setFilter(current => ({ ...current, page: 1, search })); }}>
    <View style={{ padding: width < 600 ? 12 : 18, gap: 14, flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'flex-start' : 'stretch' }}>
      {!wide && income}
      <View style={{ flex: wide ? 1 : undefined, minWidth: 0, gap: 12 }}>
        <AffiliateCategoryStrip categories={categories.data ?? []} selectedId={filter.categoryId} onSelect={categoryId => setFilter(current => ({ ...current, page: 1, categoryId }))} />
        <Status loading={categories.isLoading} error={categories.error} retry={() => void categories.refetch()} />
        {shared && user && shared.userId === user.id && <View style={{ backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#F3D7DA', padding: 14, gap: 8 }}><Text style={{ color: '#8A3038', fontSize: 12, fontWeight: '600' }}>Link cộng tác: {shared.name}</Text><ShareLinkActions key={shared.url} url={shared.url} compact /></View>}
        {!user ? <View style={{ backgroundColor: 'white', padding: 16, borderRadius: 12 }}><Text style={{ color: '#666977', fontSize: 13, textAlign: 'center' }}>Đăng nhập để xem sản phẩm và hoa hồng theo hạng của bạn.</Text><LoginNotice /></View> : <AffiliateCatalogGrid items={products.data?.items ?? []} fallbackWidth={Math.min(width, 1180) - (width < 600 ? 24 : 36) - (wide ? 294 : 0)} loading={products.isLoading} error={products.error ? errorMessage(products.error) : undefined} page={filter.page} totalPages={products.data?.totalPages ?? 0} busyId={link.isPending ? link.variables?.id : null} onRetry={() => void products.refetch()} onPage={page => setFilter(current => ({ ...current, page }))} onOpen={item => router.push({ pathname: '/product/[id]', params: { id: item.id } })} onGetLink={item => { if (!linkLock.current) { linkLock.current = true; link.mutate(item); } }} />}
      </View>
      {wide ? <View style={{ width: 280, gap: 12 }}>{income}{help}</View> : help}
    </View>
  </Page>;
}
