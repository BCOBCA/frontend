import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Check, ChevronLeft, ChevronRight, CircleAlert, Clock3, Coins, Info, Landmark, Search, ShoppingBag } from 'lucide-react-native';
import { DealerSelect } from '../dealers/DealerFilters';
import { Status } from '../common/ui';
import { colors } from '../../theme';
import { withdrawalMoney } from './withdrawal';
import { formatHistoryDate, historyPages, historyPeriods, ledgerKinds, signedHistoryMoney, withdrawalKinds, type WalletHistoryFilter, type WalletHistoryRow, type WalletHistoryTab } from './wallet-history';

type Props = { filter: WalletHistoryFilter; draft: string; rows: WalletHistoryRow[]; loading: boolean; error?: unknown; totalPages: number; width: number; onTab: (tab: WalletHistoryTab) => void; onPeriod: (value: string) => void; onKind: (value: string) => void; onSearch: (value: string) => void; onSubmitSearch: () => void; onPage: (value: number) => void; onRetry: () => void };
const columns = [1.25, 1.8, 1.15, 1.35, 1.25, 1.2];

function HistoryStatus({ row }: { row: WalletHistoryRow }) {
  const palette = { success: ['#E7F6E4', '#28752B'], pending: ['#FFF2D9', '#986108'], danger: ['#FFE8EB', '#BB2B40'], neutral: ['#EEEEF3', '#676B78'] }[row.tone];
  const Icon = row.tone === 'success' ? Check : row.tone === 'pending' ? Clock3 : CircleAlert;
  return <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 12, backgroundColor: palette[0] }}><Icon size={11} color={palette[1]} /><Text style={{ color: palette[1], fontSize: 10, lineHeight: 14 }}>{row.status}</Text></View>;
}

function HistoryType({ row }: { row: WalletHistoryRow }) {
  const Icon = row.icon === 'commission' ? ShoppingBag : row.icon === 'withdrawal' ? Landmark : Coins;
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}><View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: '#FFF0F2', alignItems: 'center', justifyContent: 'center' }}><Icon size={17} color={colors.primary} /></View><View style={{ flex: 1, minWidth: 0, gap: 3 }}><Text style={{ color: colors.text, fontSize: 11, lineHeight: 16, fontWeight: '600' }}>{row.title}</Text>{row.caption && <Text style={s.small}>{row.caption}</Text>}</View></View>;
}

function HistoryAmount({ row }: { row: WalletHistoryRow }) {
  return <View style={{ gap: 3 }}><Text style={{ color: row.negative ? '#BE3347' : '#197B21', fontSize: 12, lineHeight: 17, fontWeight: '700' }}>{signedHistoryMoney(row.amount)}</Text>{row.fee !== undefined && <Text style={s.small}>Phí: {row.fee === 0 ? 'Miễn phí' : withdrawalMoney(row.fee)}</Text>}{row.net !== undefined && <Text style={s.small}>Thực nhận: {withdrawalMoney(row.net)}</Text>}</View>;
}

function HistoryBalance({ row }: { row: WalletHistoryRow }) {
  return <View style={{ gap: 3 }}><Text style={{ color: colors.text, fontSize: 11, lineHeight: 16 }}>{row.balance === null ? '—' : withdrawalMoney(row.balance)}</Text>{row.balanceLabel && <Text style={s.small}>{row.balanceLabel}</Text>}</View>;
}

export function WalletHistoryView(p: Props) {
  const wide = p.width >= 1000;
  const table = p.width >= 760;
  return <View style={{ flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'flex-start' : 'stretch', padding: p.width < 600 ? 12 : 18, gap: 14 }}>
    <View style={{ flex: wide ? 1 : undefined, minWidth: 0, backgroundColor: 'white', borderRadius: 14, borderWidth: 1, borderColor: '#E7E7F1', padding: 12, gap: 16 }}>
      <View accessibilityRole="tablist" style={{ flexDirection: 'row', gap: 4, padding: 3, backgroundColor: '#FAFAFE', borderWidth: 1, borderColor: '#ECECF5', borderRadius: 12 }}>{[{ id: 'ledger', title: 'Lịch sử cộng tiền', Icon: Coins }, { id: 'withdrawals', title: 'Lịch sử yêu cầu rút tiền', Icon: Landmark }].map(({ id, title, Icon }) => { const active = p.filter.tab === id; return <Pressable key={id} accessibilityRole="tab" accessibilityLabel={title} accessibilityState={{ selected: active }} onPress={() => p.onTab(id as WalletHistoryTab)} style={({ pressed }) => ({ flex: 1, minHeight: 44, paddingHorizontal: 8, paddingVertical: 8, borderRadius: 9, backgroundColor: active ? '#E51D30' : 'transparent', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, opacity: pressed ? 0.65 : 1 })}><Icon size={20} color={active ? 'white' : '#4D5261'} /><Text style={{ color: active ? 'white' : colors.text, fontSize: 12, lineHeight: 17, fontWeight: '700', flexShrink: 1, textAlign: 'center' }}>{title}</Text></Pressable>; })}</View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, flexGrow: 1 }}><Text style={s.label}>Thời gian</Text><View style={{ flex: 1 }}><DealerSelect label="Lọc thời gian giao dịch" value={p.filter.period} options={historyPeriods} onChange={p.onPeriod} /></View></View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, flexGrow: 1 }}><Text style={s.label}>{p.filter.tab === 'ledger' ? 'Loại giao dịch' : 'Trạng thái'}</Text><View style={{ flex: 1 }}><DealerSelect label={p.filter.tab === 'ledger' ? 'Lọc loại giao dịch' : 'Lọc trạng thái rút tiền'} value={p.filter.kind} options={p.filter.tab === 'ledger' ? ledgerKinds : withdrawalKinds} onChange={p.onKind} /></View></View>
        <View style={{ flexDirection: 'row', flexGrow: 1, flexBasis: table ? 180 : '100%', minWidth: 0, borderWidth: 1, borderColor: '#E3E4ED', borderRadius: 10, paddingHorizontal: 10, gap: 6, alignItems: 'center' }}><Pressable accessibilityRole="button" accessibilityLabel="Tìm giao dịch" onPress={p.onSubmitSearch} style={{ width: 24, height: 42, justifyContent: 'center' }}><Search size={17} color="#555A68" /></Pressable><TextInput accessibilityLabel="Tìm kiếm giao dịch" value={p.draft} onChangeText={p.onSearch} onSubmitEditing={p.onSubmitSearch} placeholder="Tìm mã giao dịch..." placeholderTextColor={colors.muted} maxLength={200} returnKeyType="search" style={{ flex: 1, minWidth: 0, height: 42, fontSize: 12, color: colors.text }} /></View>
      </View>
      <Status loading={p.loading} error={p.error} retry={p.onRetry} />
      {!p.loading && !p.error && !p.rows.length && <View style={{ paddingVertical: 32, alignItems: 'center', gap: 7 }}><Coins size={30} color={colors.muted} /><Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>Chưa có giao dịch phù hợp</Text><Text style={s.small}>Thử khoảng thời gian hoặc bộ lọc khác.</Text></View>}
      {!p.loading && !p.error && !!p.rows.length && (table ? <View role="table" accessibilityLabel={p.filter.tab === 'ledger' ? 'Lịch sử cộng tiền' : 'Lịch sử yêu cầu rút tiền'}>
        <View role="row" style={{ flexDirection: 'row', backgroundColor: '#F0F0F6', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 11 }}>{['Thời gian', p.filter.tab === 'ledger' ? 'Loại giao dịch' : 'Ngân hàng', 'Mã giao dịch', 'Số tiền', 'Số dư sau', 'Trạng thái'].map((title, index) => <Text key={title} role="columnheader" style={{ flex: columns[index], fontSize: 11, lineHeight: 16, color: '#555A6C', fontWeight: '700' }}>{title}</Text>)}</View>
        {p.rows.map(row => <View key={row.id} role="row" style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 13, minHeight: 60, borderBottomWidth: 1, borderColor: '#F0F0F5' }}>
          <View role="cell" style={{ flex: columns[0], paddingRight: 5 }}><Text style={{ fontSize: 11, lineHeight: 17, color: colors.text }}>{formatHistoryDate(row.date)}</Text></View>
          <View role="cell" style={{ flex: columns[1], minWidth: 0, paddingRight: 6 }}><HistoryType row={row} /></View>
          <View role="cell" style={{ flex: columns[2], minWidth: 0, paddingRight: 7 }}><Text selectable numberOfLines={1} style={{ alignSelf: 'flex-start', maxWidth: '100%', backgroundColor: '#F0F0F5', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3, color: '#55596A', fontSize: 10 }}>{row.code}</Text></View>
          <View role="cell" style={{ flex: columns[3], minWidth: 0, paddingRight: 5 }}><HistoryAmount row={row} /></View><View role="cell" style={{ flex: columns[4], paddingRight: 5 }}><HistoryBalance row={row} /></View><View role="cell" style={{ flex: columns[5], minWidth: 0 }}><HistoryStatus row={row} /></View>
        </View>)}
      </View> : <View style={{ gap: 10 }}>{p.rows.map(row => <View key={row.id} style={{ borderWidth: 1, borderColor: '#ECECF3', borderRadius: 10, padding: 12, gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><View style={{ flex: 1 }}><HistoryType row={row} /></View><HistoryStatus row={row} /></View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}><Text style={s.small}>{formatHistoryDate(row.date)}</Text><Text selectable style={s.small}>{row.code}</Text></View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}><View style={{ flex: 1 }}><HistoryAmount row={row} /></View><View style={{ alignItems: 'flex-end', gap: 3 }}><Text style={s.small}>Số dư sau</Text><HistoryBalance row={row} /></View></View>
      </View>)}</View>)}
      {!p.loading && !p.error && p.totalPages > 1 && <View accessibilityLabel="Phân trang lịch sử ví" style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Trang giao dịch trước" disabled={p.filter.page <= 1} onPress={() => p.onPage(p.filter.page - 1)} style={[s.page, { opacity: p.filter.page <= 1 ? 0.35 : 1 }]}><ChevronLeft size={17} color={colors.text} /></Pressable>
        {historyPages(p.filter.page, p.totalPages).map((page, index) => page === '…' ? <Text key={`gap-${index}`} style={s.label}>…</Text> : <Pressable key={page} accessibilityRole="button" accessibilityLabel={`Trang giao dịch ${page}`} accessibilityState={{ selected: page === p.filter.page }} onPress={() => p.onPage(page)} style={[s.page, { backgroundColor: page === p.filter.page ? '#E71C30' : 'white', borderColor: page === p.filter.page ? '#E71C30' : '#E4E5EF' }]}><Text style={{ color: page === p.filter.page ? 'white' : colors.text, fontSize: 12 }}>{page}</Text></Pressable>)}
        <Pressable accessibilityRole="button" accessibilityLabel="Trang giao dịch sau" disabled={p.filter.page >= p.totalPages} onPress={() => p.onPage(p.filter.page + 1)} style={[s.page, { opacity: p.filter.page >= p.totalPages ? 0.35 : 1 }]}><ChevronRight size={17} color={colors.text} /></Pressable>
      </View>}
    </View>
    <View style={{ width: wide ? 264 : undefined, borderRadius: 14, backgroundColor: 'white', borderWidth: 1, borderColor: '#ECECF4', padding: 8 }}><View style={{ padding: 13, borderRadius: 10, backgroundColor: '#FFF2F5', gap: 11 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}><Info size={20} color={colors.primary} /><Text accessibilityRole="header" style={{ color: colors.primary, fontSize: 15, fontWeight: '700' }}>Lưu ý</Text></View>{[
      'Hoa hồng được ghi nhận khi đơn hoàn thành và đã thanh toán. Chỉ số dư khả dụng mới có thể rút.',
      'Yêu cầu rút bị từ chối sẽ được hoàn lại số tiền đã giữ trong ví.',
      'Phí và số tiền thực nhận được lưu theo từng yêu cầu rút. Theo dõi tiến độ tại tab lịch sử yêu cầu rút tiền.',
    ].map(note => <View key={note} style={{ flexDirection: 'row', gap: 7 }}><View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary, marginTop: 7 }} /><Text style={{ flex: 1, color: '#414657', fontSize: 12, lineHeight: 19 }}>{note}</Text></View>)}</View></View>
  </View>;
}
const s = StyleSheet.create({ small: { color: '#797D8B', fontSize: 10, lineHeight: 15 }, label: { color: '#454958', fontSize: 11, lineHeight: 16 }, page: { minWidth: 34, minHeight: 34, paddingHorizontal: 5, borderRadius: 8, borderWidth: 1, borderColor: '#E4E5EF', alignItems: 'center', justifyContent: 'center' } });
