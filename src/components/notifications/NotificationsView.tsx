import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions, type ViewStyle } from 'react-native';
import { Bell, BellOff, Check, ChevronDown, ChevronRight, Clock3, FileText, Megaphone, Package, Tag, type LucideIcon } from 'lucide-react-native';
import { colors, dateTime } from '../../theme';
import type { Notification } from '../../types/api';
import { filterNotifications, notificationBody, notificationCategory, notificationCounts, notificationTarget, type NotificationCategory, type NotificationSort, type NotificationStatus } from '../../services/notifications';
import { Status } from '../common/ui';

type Props = {
  items?: Notification[]; category: NotificationCategory; status: NotificationStatus; sort: NotificationSort; page: number;
  loading?: boolean; refreshing?: boolean; busy?: boolean; error?: unknown; actionError?: unknown; children?: ReactNode;
  onCategory: (value: NotificationCategory) => void; onStatus: (value: NotificationStatus) => void;
  onSort: (value: NotificationSort) => void; onPage: (page: number) => void;
  onOpen: (item: Notification) => void; onReadAll: () => void; onRetry: () => void;
};
const accent = '#E51D2A';
const panel: ViewStyle = { backgroundColor: colors.surface, borderRadius: 10 };
const categories: { key: NotificationCategory; label: string; Icon: LucideIcon }[] = [
  { key: 'all', label: 'Tất cả thông báo', Icon: Bell }, { key: 'orders', label: 'Đơn hàng', Icon: Package },
  { key: 'promotions', label: 'Khuyến mãi & Ưu đãi', Icon: Tag }, { key: 'system', label: 'Hệ thống', Icon: Megaphone },
  { key: 'account', label: 'Tài khoản', Icon: FileText },
];
const categoryIcons = { orders: Package, promotions: Tag, system: Megaphone, account: FileText };

function Pill({ label, selected, disabled, onPress }: { label: string; selected?: boolean; disabled?: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected: !!selected, disabled: !!disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => ({ minHeight: 36, paddingHorizontal: 14, borderRadius: 18, justifyContent: 'center', backgroundColor: selected ? '#E8484C' : '#F3F4F6', opacity: pressed ? 0.7 : 1 })}>
    <Text style={{ color: selected ? colors.surface : colors.text, fontSize: 13, fontWeight: '700' }}>{label}</Text>
  </Pressable>;
}

export function NotificationsView(p: Props) {
  const { width } = useWindowDimensions();
  const wide = width >= 900, compact = width < 600;
  const [sortOpen, setSortOpen] = useState(false);
  const items = p.items ?? [];
  const counts = notificationCounts(items);
  const categoryItems = filterNotifications(items, p.category, 'all', p.sort);
  const unread = categoryItems.filter(item => !item.readAt).length;
  const filtered = filterNotifications(items, p.category, p.status, p.sort);
  const pages = Math.max(1, Math.ceil(filtered.length / 10));
  const page = Math.min(p.page, pages);
  const blocked = !!p.busy || !!p.loading;

  const categoryControls = categories.map(({ key, label, Icon }) => {
    const selected = p.category === key;
    return <Pressable key={key} accessibilityRole="tab" accessibilityLabel={label} accessibilityState={{ selected }} onPress={() => p.onCategory(key)}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: wide ? 38 : 44, borderRadius: 8, paddingHorizontal: 8, backgroundColor: selected ? '#FFE2E5' : 'transparent', opacity: pressed ? 0.65 : 1 })}>
      <Icon size={18} color={selected ? accent : '#373B49'} strokeWidth={1.8} aria-hidden />
      <Text numberOfLines={1} style={{ flex: wide ? 1 : undefined, color: selected ? accent : colors.text, fontSize: 12, fontWeight: selected ? '700' : '500' }}>{label}</Text>
      {counts[key] > 0 && <View accessibilityLabel={`${counts[key]} thông báo chưa đọc`} style={{ minWidth: 20, paddingHorizontal: 5, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: selected ? accent : colors.surface, borderWidth: selected ? 0 : 1, borderColor: '#F3A8AE' }}>
        <Text style={{ color: selected ? colors.surface : accent, fontSize: 12, fontWeight: '600' }}>{counts[key]}</Text>
      </View>}
    </Pressable>;
  });

  return <View style={{ padding: compact ? 8 : 12, flexDirection: wide ? 'row' : 'column', alignItems: 'flex-start', gap: 10 }}>
    <View style={[panel, { width: wide ? 228 : '100%', padding: wide ? 10 : 6, gap: 8 }]}>
      {wide && <Text accessibilityRole="header" aria-level={2} style={{ color: colors.text, fontSize: 16, fontWeight: '700', paddingHorizontal: 4, paddingVertical: 2 }}>Thông báo</Text>}
      {wide ? <View accessibilityRole="tablist" accessibilityLabel="Danh mục thông báo" style={{ gap: 3 }}>{categoryControls}</View> : <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4 }}><View accessibilityRole="tablist" accessibilityLabel="Danh mục thông báo" style={{ flexDirection: 'row', gap: 4 }}>{categoryControls}</View></ScrollView>}
    </View>

    <View style={{ flex: wide ? 1 : undefined, width: wide ? undefined : '100%', minWidth: 0, gap: 10 }}>
      <View style={[panel, { padding: compact ? 12 : 14, flexDirection: compact ? 'column' : 'row', alignItems: compact ? 'flex-start' : 'center', gap: 10 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: compact ? undefined : 1, gap: 10 }}>
          <Bell size={24} strokeWidth={1.8} color={colors.text} aria-hidden />
          <View style={{ flex: 1, gap: 2 }}><Text accessibilityRole="header" aria-level={1} style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>Thông báo</Text><Text style={{ color: '#626777', fontSize: 12, lineHeight: 17 }}>Cập nhật nhanh chóng các hoạt động, đơn hàng và ưu đãi dành cho bạn.</Text></View>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Đánh dấu tất cả là đã đọc" accessibilityState={{ disabled: blocked || !counts.unread }} disabled={blocked || !counts.unread} onPress={p.onReadAll}
          style={({ pressed }) => ({ minHeight: 36, paddingHorizontal: 10, borderWidth: 1, borderColor: '#F06871', borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 6, opacity: blocked || !counts.unread ? 0.45 : pressed ? 0.65 : 1 })}>
          <Check size={16} color={accent} aria-hidden /><Text style={{ fontSize: 12, fontWeight: '600', color: accent }}>{p.busy ? 'Đang cập nhật…' : 'Đánh dấu tất cả là đã đọc'}</Text>
        </Pressable>
      </View>

      <View style={[panel, { padding: compact ? 10 : 12, gap: 12 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, zIndex: 2 }}>
          <View accessibilityRole="tablist" accessibilityLabel="Trạng thái thông báo" style={{ flexDirection: 'row', gap: compact ? 6 : 10 }}>
            <Pill label="Tất cả" selected={p.status === 'all'} onPress={() => p.onStatus('all')} />
            <Pill label={unread > 0 ? `Chưa đọc (${unread})` : 'Chưa đọc'} selected={p.status === 'unread'} onPress={() => p.onStatus('unread')} />
            <Pill label="Đã đọc" selected={p.status === 'read'} onPress={() => p.onStatus('read')} />
          </View>
          <View style={{ position: 'relative', zIndex: 3 }}>
            <Pressable accessibilityRole="button" accessibilityLabel="Sắp xếp thông báo" accessibilityState={{ expanded: sortOpen }} onPress={() => setSortOpen(!sortOpen)} style={({ pressed }) => ({ minHeight: 36, paddingHorizontal: 14, borderRadius: 20, backgroundColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', gap: 12, opacity: pressed ? 0.65 : 1 })}>
              <Text style={{ color: colors.text, fontSize: 12, fontWeight: '600' }}>{p.sort === 'newest' ? 'Mới nhất' : 'Cũ nhất'}</Text><ChevronDown size={15} color={colors.muted} aria-hidden />
            </Pressable>
            {sortOpen && <View style={[panel, { position: 'absolute', top: 42, right: 0, minWidth: 150, padding: 5, borderWidth: 1, borderColor: colors.border, boxShadow: '0 6px 20px rgba(25,28,40,0.1)' }]}>
              {(['newest', 'oldest'] as const).map(sort => <Pressable key={sort} accessibilityRole="button" accessibilityLabel={sort === 'newest' ? 'Mới nhất' : 'Cũ nhất'} onPress={() => { p.onSort(sort); setSortOpen(false); }} style={{ minHeight: 40, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}><Text style={{ fontSize: 13, color: colors.text }}>{sort === 'newest' ? 'Mới nhất' : 'Cũ nhất'}</Text>{p.sort === sort && <Check size={15} color={accent} />}</Pressable>)}
            </View>}
          </View>
        </View>
        <Status error={p.error || p.actionError} retry={p.onRetry} />
        {p.loading && !p.items ? <View accessibilityLabel="Đang tải thông báo" style={{ gap: 6 }}>{[0, 1, 2].map(index => <View key={index} style={{ height: 76, borderRadius: 8, backgroundColor: '#F5F5F8', padding: 12, gap: 8 }}><View style={{ height: 13, width: '55%', borderRadius: 5, backgroundColor: '#E8E9EE' }} /><View style={{ height: 11, width: '80%', borderRadius: 5, backgroundColor: '#EDEEF2' }} /></View>)}</View> : <View accessibilityRole="list" accessibilityLabel="Danh sách thông báo" style={{ gap: 6 }}>
          {filtered.slice((page - 1) * 10, page * 10).map(item => {
            const isUnread = !item.readAt;
            const Icon = categoryIcons[notificationCategory(item)];
            return <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`${item.title}, ${isUnread ? 'Chưa đọc' : 'Đã đọc'}`} accessibilityState={{ disabled: blocked }} disabled={blocked} onPress={() => p.onOpen(item)}
              style={({ pressed }) => ({ paddingVertical: 10, paddingHorizontal: compact ? 8 : 10, minHeight: 76, borderRadius: 8, borderWidth: 1, borderColor: isUnread ? 'transparent' : '#ECEEF2', backgroundColor: isUnread ? '#FFF5F6' : colors.surface, flexDirection: 'row', alignItems: 'center', gap: compact ? 8 : 10, opacity: pressed ? 0.65 : 1 })}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isUnread ? accent : 'transparent' }} />
              <View style={{ width: compact ? 36 : 40, height: compact ? 36 : 40, borderRadius: 10, backgroundColor: isUnread ? '#FFE3E6' : '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}><Icon size={compact ? 22 : 24} color={isUnread ? accent : '#898C95'} strokeWidth={1.8} aria-hidden /></View>
              <View style={{ flex: 1, minWidth: 0, gap: 3 }}><Text style={{ color: '#20212A', fontSize: 13, lineHeight: 18, fontWeight: '700' }}>{item.title}</Text><Text style={{ color: '#515769', fontSize: 12, lineHeight: 17 }}>{notificationBody(item)}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><Clock3 size={13} color="#868C99" aria-hidden /><Text style={{ color: '#737B8C', fontSize: 12 }}>{dateTime(item.createdAt)}</Text>{compact && <Text style={{ fontSize: 11, color: isUnread ? accent : colors.muted }}> · {isUnread ? 'Chưa đọc' : 'Đã đọc'}</Text>}</View>
              </View>
              {!compact && <View style={{ backgroundColor: isUnread ? '#FFE3E6' : '#F0F1F3', borderRadius: 14, paddingVertical: 4, paddingHorizontal: 11 }}><Text style={{ fontSize: 11, fontWeight: '600', color: isUnread ? accent : '#787E89' }}>{isUnread ? 'Chưa đọc' : 'Đã đọc'}</Text></View>}
              {notificationTarget(item) ? <ChevronRight size={19} color="#424653" aria-hidden /> : isUnread ? <Check size={17} color={accent} aria-hidden /> : null}
            </Pressable>;
          })}
          {!p.error && filtered.length === 0 && <View style={{ alignItems: 'center', paddingVertical: 54, paddingHorizontal: 16, gap: 12 }}><View style={{ width: 68, height: 68, borderRadius: 34, backgroundColor: '#FFF0F1', alignItems: 'center', justifyContent: 'center' }}><BellOff size={30} color="#E75B63" strokeWidth={1.5} /></View><Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>Chưa có thông báo{p.status === 'unread' ? ' chưa đọc' : ''}</Text><Text style={{ color: colors.muted, fontSize: 13, textAlign: 'center', lineHeight: 20 }}>Các cập nhật mới sẽ xuất hiện tại đây.</Text></View>}
        </View>}
        {pages > 1 && <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 16 }}><Pressable accessibilityRole="button" accessibilityLabel="Trang thông báo trước" disabled={page <= 1} onPress={() => p.onPage(page - 1)} style={{ minHeight: 40, justifyContent: 'center', opacity: page <= 1 ? 0.4 : 1 }}><Text style={{ color: colors.text }}>Trước</Text></Pressable><Text style={{ color: colors.muted, fontSize: 13 }}>{page} / {pages}</Text><Pressable accessibilityRole="button" accessibilityLabel="Trang thông báo sau" disabled={page >= pages} onPress={() => p.onPage(page + 1)} style={{ minHeight: 40, justifyContent: 'center', opacity: page >= pages ? 0.4 : 1 }}><Text style={{ color: colors.text }}>Sau</Text></Pressable></View>}
        {p.refreshing && !p.loading && <Text accessibilityLiveRegion="polite" style={{ color: colors.muted, fontSize: 12 }}>Đang cập nhật thông báo…</Text>}
      </View>
      {p.children}
    </View>
  </View>;
}
