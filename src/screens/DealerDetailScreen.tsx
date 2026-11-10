import { Text, useWindowDimensions, View } from 'react-native';
import { Link, router, useLocalSearchParams, type Href } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Mail, MapPin, Phone, Users } from 'lucide-react-native';
import { Page, Status } from '../components/common/ui';
import { DealerImage, FollowButton, VerifiedBadge } from '../components/dealers/DealerCard';
import { dealerDetailTabs, DealerDetailTabs } from '../components/dealers/DealerDetailTabs';
import { DealerProducts } from '../components/dealers/DealerProducts';
import { getDealer } from '../services/dealers';
import { useAuth } from '../stores/auth';
import { colors } from '../theme';

function dealerWebsiteHref(value: string | null | undefined): Href | null {
  try {
    const url = new URL(value ?? '');
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href as Href : null;
  } catch {
    return null;
  }
}

export default function DealerDetailScreen() {
  const { slug, tab } = useLocalSearchParams<{ slug: string; tab?: string }>();
  const activeTab = dealerDetailTabs.find(item => item.id === tab) ?? dealerDetailTabs[0];
  const TabIcon = activeTab.Icon;
  const userId = useAuth(s => s.user?.id);
  const { width } = useWindowDimensions();
  const query = useQuery({ queryKey: ['dealer', slug, userId], queryFn: () => getDealer(slug), enabled: !!slug });
  const detail = query.data;
  const dealer = detail?.dealer;
  const websiteHref = dealerWebsiteHref(detail?.website);
  return <Page title={dealer?.name ?? 'Chi tiết đại lý'} back bodyStyle={{ padding: width < 700 ? 16 : 24, gap: 20 }}>
    <Status loading={query.isLoading} error={query.error} retry={() => void query.refetch()} />
    {dealer && detail && <>
      <View style={{ borderRadius: 18, overflow: 'hidden', backgroundColor: 'white' }}>
        <View style={{ height: width < 700 ? 160 : 260 }}><DealerImage uri={dealer.coverUrl} /></View>
        <View style={{ padding: 20, paddingTop: 0, gap: 14 }}>
          <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <View style={{ width: 80, height: 80, borderRadius: 18, overflow: 'hidden', borderWidth: 4, borderColor: 'white', marginTop: -22 }}><DealerImage uri={dealer.logoUrl} logo /></View>
            <View style={{ flex: 1, minWidth: 160, gap: 7, paddingTop: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}><Text accessibilityRole="header" style={{ fontSize: 23, fontWeight: '800', color: colors.text, flexShrink: 1 }}>{dealer.name}</Text>{dealer.isVerified && <VerifiedBadge />}</View>
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}><Users size={15} color={colors.muted} /><Text style={{ color: colors.muted, fontSize: 13 }}>{dealer.followerCount.toLocaleString('vi-VN')} người theo dõi</Text></View>
              <Text style={{ fontSize: 14, color: colors.text, lineHeight: 23, marginTop: 7 }}>{dealer.description || 'Đại lý chưa cập nhật phần giới thiệu.'}</Text>
            </View>
            <View style={{ paddingTop: 10 }}><FollowButton dealer={dealer} /></View>
          </View>
        </View>
        <DealerDetailTabs value={activeTab.id} onChange={value => router.setParams({ tab: value })} />
      </View>
      <View nativeID="dealer-detail-panel" role="tabpanel" aria-labelledby={`dealer-tab-${activeTab.id}`}>
      {activeTab.id === 'products' ? <DealerProducts key={dealer.id} storeId={dealer.id} /> : activeTab.id === 'about' ? <View style={{ flexDirection: width >= 850 ? 'row' : 'column', gap: 20, alignItems: 'flex-start' }}>
        <View style={{ flex: 1, width: '100%', padding: 20, borderRadius: 16, backgroundColor: 'white', gap: 16 }}><Text accessibilityRole="header" style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>Chi nhánh công khai</Text>
          {detail.branches.length ? detail.branches.map(branch => <View key={branch.id} style={{ gap: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 14 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{branch.name}{branch.isMain ? ' · Chi nhánh chính' : ''}</Text>
            <View style={{ flexDirection: 'row', gap: 7 }}><MapPin size={16} color={colors.primary} /><Text style={{ flex: 1, fontSize: 13, lineHeight: 20, color: colors.muted }}>{branch.address || 'Chưa cập nhật địa chỉ'}</Text></View>
            {!!branch.phone && <Text style={{ color: colors.text, fontSize: 13 }}>Điện thoại: {branch.phone}</Text>}
          </View>) : <Text style={{ color: colors.muted, fontSize: 13 }}>Đại lý chưa công bố thông tin chi nhánh.</Text>}
        </View>
        <View style={{ width: width >= 850 ? 300 : '100%', padding: 20, borderRadius: 16, backgroundColor: 'white', gap: 14 }}><Text accessibilityRole="header" style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>Thông tin liên hệ</Text>
          {!!detail.phone && <View style={{ flexDirection: 'row', gap: 8 }}><Phone size={16} color={colors.primary} /><Text style={{ flex: 1, color: colors.text }}>{detail.phone}</Text></View>}
          {!!detail.email && <View style={{ flexDirection: 'row', gap: 8 }}><Mail size={16} color={colors.primary} /><Text style={{ flex: 1, color: colors.text }}>{detail.email}</Text></View>}
          {!!detail.website && <Text style={{ color: colors.text, fontSize: 13, lineHeight: 22 }}>Website: {websiteHref ? <Link href={websiteHref} target="_blank" rel="noopener noreferrer" accessibilityLabel={`Mở website ${dealer.name}`} style={{ color: colors.primary, textDecorationLine: 'underline' }}>{detail.website}</Link> : detail.website}</Text>}
          {!detail.phone && !detail.email && !detail.website && <Text style={{ color: colors.muted, fontSize: 13 }}>Đại lý chưa công bố thông tin liên hệ.</Text>}
        </View>
      </View> : <View style={{ minHeight: 220, padding: 32, borderRadius: 16, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
        <TabIcon size={34} color={colors.muted} strokeWidth={1.4} />
        <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 22, textAlign: 'center' }}>{activeTab.empty}</Text>
      </View>}
      </View>
    </>}
  </Page>;
}
