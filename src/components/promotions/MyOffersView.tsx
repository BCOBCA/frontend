import { useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { TicketPercent } from 'lucide-react-native';
import { Button, Status } from '../common/ui';
import { gridItemWidth } from '../common/grid-layout';
import { OfferCard } from './OfferCard';
import { OwnedOfferDetails } from './OwnedOfferDetails';
import { colors, styles as s } from '../../theme';
import type { OwnedVoucher } from '../../types/api';

type Props = {
  items: OwnedVoucher[]; loading: boolean; error?: unknown; onRetry: () => void;
  hasMore: boolean; loadingMore: boolean; onLoadMore: () => void;
  onShop: () => void; onDiscover: () => void;
};

export function MyOffersView(p: Props) {
  const { width } = useWindowDimensions();
  const [gridWidth, setGridWidth] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const items = p.items.filter(item => item.status === 'AVAILABLE');
  const selected = items.find(item => item.id === selectedId);
  const columns = width >= 1000 ? 4 : width >= 700 ? 3 : 2;
  const padding = 12;
  const cardWidth = gridItemWidth(gridWidth || Math.min(width, 1180) - padding * 2, columns, 12);
  return <View style={{ padding, gap: 16 }}>
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <Text accessibilityRole="header" style={[s.title, { flex: 1 }]}>Ví ưu đãi của bạn</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Thu thập thêm ưu đãi" onPress={p.onDiscover}
          style={({ pressed }) => ({ maxWidth: '52%', minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: width < 600 ? 12 : 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: '#F4BFC2', backgroundColor: pressed ? '#FFE4E6' : '#FFF1F2', opacity: pressed ? 0.8 : 1 })}>
          <TicketPercent size={21} color={colors.primary} strokeWidth={1.8} aria-hidden />
          <Text style={{ flexShrink: 1, color: '#C82F36', fontSize: width < 600 ? 12 : 13, lineHeight: 18, fontWeight: '600', textAlign: 'center' }}>Thu thập thêm ưu đãi</Text>
        </Pressable>
      </View>
      <Text style={s.small}>Các ưu đãi đã thu thập hoặc đổi điểm còn dùng được.</Text>
    </View>
    <Status loading={p.loading} error={p.error} retry={p.onRetry} />
    {!p.loading && !p.error && items.length === 0 && <View style={[s.card, { alignItems: 'center', gap: 12, paddingVertical: 32 }]}>
      <TicketPercent size={48} color={colors.muted} strokeWidth={1.3} />
      <Text style={[s.body, { fontWeight: '600' }]}>Bạn chưa có ưu đãi còn dùng được</Text>
      <Text style={[s.small, { textAlign: 'center' }]}>Khám phá ưu đãi để thu thập voucher hoặc đổi điểm nhận quà.</Text>
      <Button title="Khám phá ưu đãi" onPress={p.onDiscover} />
    </View>}
    <View onLayout={event => setGridWidth(event.nativeEvent.layout.width)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {items.map(item => <OfferCard key={item.id} voucher={{ ...item, id: item.voucherId, claimed: true }} owned width={cardWidth} busy={false} onClaim={() => setSelectedId(item.id)} onDetails={() => setSelectedId(item.id)} />)}
    </View>
    {p.hasMore && <Button title={p.loadingMore ? 'Đang tải...' : 'Tải thêm ưu đãi'} outline disabled={p.loadingMore} onPress={p.onLoadMore} />}
    {selected && <OwnedOfferDetails item={selected} onClose={() => setSelectedId(null)} onShop={() => { setSelectedId(null); p.onShop(); }} />}
  </View>;
}
