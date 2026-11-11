import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LogOut, MonitorSmartphone } from 'lucide-react-native';
import { colors, dateTime } from '../../theme';

export type LoginSession = { id: string; deviceName: string; createdAt: string; expiresAt: string };
type Props = { sessions: LoginSession[]; onRevoke: (id: string) => void; busyId?: string; disabled?: boolean };

export function SessionsTable({ sessions, onRevoke, busyId, disabled }: Props) {
  const compact = useWindowDimensions().width < 800;
  const [viewportWidth, setViewportWidth] = useState(0);
  return <View style={s.panel}>
    <View style={{ padding: 18, gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}><MonitorSmartphone size={21} color={colors.primary} /><Text accessibilityRole="header" aria-level={2} style={{ fontSize: 17, lineHeight: 25, fontWeight: '700', color: colors.text }}>Phiên đăng nhập</Text></View><View style={{ backgroundColor: '#F3F3F7', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 }}><Text style={{ color: '#5B5D69', fontSize: 12, fontWeight: '600' }}>{sessions.length} phiên</Text></View></View>
      <Text style={{ color: colors.muted, fontSize: 13, lineHeight: 20 }}>Xem thiết bị, thời gian đăng nhập và thời hạn của từng phiên.</Text>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator onLayout={event => setViewportWidth(event.nativeEvent.layout.width)} contentContainerStyle={{ flexGrow: 1 }}>
      <View role="table" accessibilityLabel="Danh sách thiết bị đăng nhập" style={{ width: Math.max(760, viewportWidth) }}>
        <View role="row" style={[s.row, { backgroundColor: '#F6F6F9', paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.border }]}>
          <View role="columnheader" style={s.index}><Text style={s.heading}>STT</Text></View>
          <View role="columnheader" style={s.device}><Text style={s.heading}>Thiết bị</Text></View>
          <View role="columnheader" style={s.date}><Text style={s.heading}>Đăng nhập lúc</Text></View>
          <View role="columnheader" style={s.date}><Text style={s.heading}>Hết hạn lúc</Text></View>
          <View role="columnheader" style={s.action}><Text style={s.heading}>Thao tác</Text></View>
        </View>
        {sessions.map((session, index) => {
          const name = session.deviceName.trim() || 'Thiết bị chưa đặt tên';
          const busy = busyId === session.id;
          const blocked = !!disabled || !!busyId;
          return <View key={session.id} role="row" style={[s.row, { backgroundColor: index % 2 ? '#FCFCFD' : colors.surface, paddingVertical: 16 }]}>
            <View role="cell" style={s.index}><Text style={s.secondary}>{index + 1}</Text></View>
            <View role="cell" style={[s.device, { flexDirection: 'row', alignItems: 'center', gap: 10, paddingRight: 16 }]}><View style={{ width: 36, height: 36, borderRadius: 9, backgroundColor: '#F0F1F5', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><MonitorSmartphone size={19} color="#696C79" strokeWidth={1.7} /></View><Text numberOfLines={2} style={{ flex: 1, fontSize: 14, lineHeight: 21, fontWeight: '600', color: colors.text }}>{name}</Text></View>
            <View role="cell" style={s.date}><Text style={s.secondary}>{dateTime(session.createdAt)}</Text></View>
            <View role="cell" style={s.date}><Text style={s.secondary}>{dateTime(session.expiresAt)}</Text></View>
            <View role="cell" style={s.action}><Pressable accessibilityRole="button" accessibilityLabel={`Thu hồi phiên ${name}, ${dateTime(session.createdAt)}`} accessibilityState={{ disabled: blocked, busy }} disabled={blocked} onPress={() => onRevoke(session.id)} hitSlop={4} style={({ pressed }) => ({ minHeight: 36, minWidth: 94, borderRadius: 7, borderWidth: 1, borderColor: '#F1C6C8', backgroundColor: '#FFF7F7', paddingHorizontal: 10, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: blocked ? 0.5 : pressed ? 0.65 : 1 })}><LogOut size={14} color="#C72D35" /><Text style={{ color: '#C72D35', fontSize: 12, fontWeight: '600' }}>{busy ? 'Đang thu hồi…' : 'Thu hồi'}</Text></Pressable></View>
          </View>;
        })}
        {!sessions.length && <View role="row" style={{ padding: 32, alignItems: 'center' }}><View role="cell"><Text style={s.secondary}>Không có phiên đang hoạt động</Text></View></View>}
      </View>
    </ScrollView>
    <View style={{ paddingHorizontal: 18, paddingVertical: 12, gap: 4 }}><Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>Hiển thị {sessions.length} phiên đăng nhập.</Text>{compact && <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>Kéo ngang bảng để xem đầy đủ thông tin và thao tác.</Text>}</View>
  </View>;
}

const s = StyleSheet.create({
  panel: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border },
  index: { width: 40, flexShrink: 0 },
  device: { flex: 1, minWidth: 200 },
  date: { width: 170, paddingLeft: 12, flexShrink: 0 },
  action: { width: 120, alignItems: 'flex-end', flexShrink: 0 },
  heading: { color: '#5B5D69', fontSize: 12, lineHeight: 18, fontWeight: '600' },
  secondary: { color: '#626573', fontSize: 13, lineHeight: 20 },
});
