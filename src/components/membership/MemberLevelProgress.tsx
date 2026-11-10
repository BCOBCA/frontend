import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { CircleAlert } from 'lucide-react-native';
import { MemberStar } from './MemberStar';
import { membershipProgressText } from './membership-progress';
import type { MembershipProgress } from '../../types/api';
import { colors, styles as s } from '../../theme';

export function MemberLevelProgress({ progress, points, availablePoints }: { progress?: MembershipProgress | null; points?: number; availablePoints?: number }) {
  const display = membershipProgressText(progress, points);
  return <View style={{ gap: 8, marginTop: -8 }}>
    <View style={[s.between, { gap: 6 }]}>
      <View style={[s.row, { flex: 1, minWidth: 0, gap: 6 }]}>
        <MemberStar /><Text style={[s.title, { fontSize: 16, flexShrink: 1 }]}>ĐIỂM THÀNH VIÊN</Text>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={`${display.level}, xem chi tiết điểm, các level và cách tính điểm`} onPress={() => router.navigate('/membership-levels')}
        style={({ pressed }) => ({ minWidth: 60, minHeight: 44, flexDirection: 'row', gap: 4, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8, opacity: pressed ? 0.65 : 1 })}>
        <Text style={{ color: colors.primary, fontSize: 17, lineHeight: 24, fontWeight: '800' }}>{display.level}</Text>
        <CircleAlert size={12} color={colors.primary} strokeWidth={2} />
      </Pressable>
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 6, flexWrap: 'wrap', marginTop: -12 }}>
      <Text style={[s.body, { fontSize: 13 }]}>Điểm có thể sử dụng:</Text>
      <Text style={[s.body, { fontSize: 14, fontWeight: '700', color: colors.primary }]}>{availablePoints === undefined ? '—' : availablePoints.toLocaleString('vi-VN')} điểm</Text>
    </View>
    <View accessible accessibilityRole="progressbar" accessibilityLabel="Tiến độ level thành viên"
      aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress ? Math.round(display.percent) : undefined} aria-valuetext={progress ? `${display.level}. ${display.next}` : 'Chưa có thông tin level'}
      style={{ height: 8, borderRadius: 4, backgroundColor: '#D4DADF', overflow: 'hidden' }}>
      <View style={{ width: `${display.percent}%`, height: '100%', borderRadius: 4, backgroundColor: '#DDA62F' }} />
    </View>
    <View style={[s.between, { alignItems: 'flex-start', flexWrap: 'wrap', gap: 4 }]}>
      <Text style={[s.small, { fontSize: 12, flexShrink: 1 }]}>{display.next}</Text>
      <Text style={[s.small, { fontSize: 12, textAlign: 'right', marginLeft: 'auto' }]}>Tổng điểm tích lũy: {display.balance}</Text>
    </View>
  </View>;
}
