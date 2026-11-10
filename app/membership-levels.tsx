import { useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { ChevronDown, ChevronRight } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Button, Page, Status } from '../src/components/common/ui';
import { MemberLevelProgress } from '../src/components/membership/MemberLevelProgress';
import { guestMembershipProgress } from '../src/components/membership/membership-progress';
import { request } from '../src/services/api';
import { useAuth } from '../src/stores/auth';
import { styles as s } from '../src/theme';
import type { Membership, MembershipLevel } from '../src/types/api';

export default function MembershipLevels() {
  const [expandedLevels, setExpandedLevels] = useState<number[]>([]);
  const wide = useWindowDimensions().width >= 700;
  const user = useAuth(state => state.user);
  const levels = useQuery({ queryKey: ['membership-levels'], queryFn: () => request<MembershipLevel[]>('GET', '/membership/levels') });
  const member = useQuery({ queryKey: ['membership', user?.id], queryFn: () => request<Membership>('GET', '/membership'), enabled: !!user });
  const membership = user ? member.data : undefined;
  return <Page title="Điểm và level thành viên" back><View style={s.padded}>
    <Status loading={levels.isLoading || !!user && member.isLoading} error={levels.error || (user ? member.error : null)} retry={() => { void levels.refetch(); if (user) void member.refetch(); }} />
    <View style={s.card}>
      <MemberLevelProgress progress={user ? membership?.levelInfo : guestMembershipProgress} points={user ? membership?.lifetimeEarnedPoints : 0} availablePoints={user ? membership?.availablePoints : 0} />
      <Text style={s.small}>Level tính theo tổng điểm tích lũy hợp lệ. Dùng điểm đổi ưu đãi không làm giảm level; hoàn tiền đơn hàng sẽ thu hồi điểm đã cộng.</Text>
    </View>
    {user ? <View style={s.card}>
      <Text accessibilityRole="header" style={s.title}>Điểm của bạn</Text>
      {[['Điểm có thể sử dụng', membership?.availablePoints], ['Tổng điểm tích lũy', membership?.lifetimeEarnedPoints], ['Điểm cần cấn trừ', membership?.pointDebt]].map(([label, value]) => <View key={label} style={s.between}>
        <Text style={s.body}>{label}</Text><Text style={s.body}>{typeof value === 'number' ? value.toLocaleString('vi-VN') : '—'} điểm</Text>
      </View>)}
      <Button title="Xem lịch sử cộng / trừ điểm" outline onPress={() => router.push('/points')} />
    </View> : <Button title="Đăng nhập để xem điểm của bạn" onPress={() => router.push('/login')} />}
    <View style={s.card}>
      <Text accessibilityRole="header" style={s.title}>Cách cộng điểm</Text>
      <Text style={s.body}>• Điểm danh: nhận điểm thưởng theo chương trình đang áp dụng, mỗi ngày một lần.</Text>
      <Text style={s.body}>• Mua hàng: đơn hàng hoàn thành và đã thanh toán được cộng điểm theo giá trị hàng sau giảm giá, không gồm phí vận chuyển.</Text>
      <Text style={s.small}>Mỗi 10.000đ được 1 điểm, bỏ phần lẻ: 100.000đ được 10 điểm; 95.000đ được 9 điểm.</Text>
      <Text style={s.small}>Điểm thưởng từ các chương trình như mini game khi được triển khai sẽ cộng vào tổng tích lũy và điểm có thể sử dụng.</Text>
    </View>
    <View style={s.card}>
      <Text accessibilityRole="header" style={s.title}>Cách trừ điểm</Text>
      <Text style={s.body}>• Khi hoàn tiền đơn đã tích điểm, số điểm đã cộng của đơn đó được thu hồi.</Text>
      <Text style={s.body}>• Nếu số dư không đủ để thu hồi, phần còn thiếu sẽ được cấn trừ từ các lần cộng điểm tiếp theo.</Text>
      <Text style={s.body}>• Khi dùng điểm đổi ưu đãi, chỉ điểm có thể sử dụng giảm. Tổng điểm tích lũy và level giữ nguyên.</Text>
    </View>
    <View style={{ gap: 8, padding: wide ? 16 : 10, borderRadius: 20, backgroundColor: '#FFF8F9', borderWidth: 1, borderColor: '#F5E8EC' }}>
      <View style={{ gap: 4, paddingHorizontal: 4, paddingTop: 2, paddingBottom: 12 }}>
        <Text accessibilityRole="header" style={s.title}>Các level và ưu đãi</Text>
        <Text style={s.small}>Tích lũy điểm để nâng cấp level và mở khóa nhiều ưu đãi hấp dẫn.</Text>
      </View>
      {levels.data?.map(level => {
        const expanded = expandedLevels.includes(level.level);
        const Arrow = expanded ? ChevronDown : ChevronRight;
        return <View key={level.level} style={{ borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EDEDF2', overflow: 'hidden' }}>
          <Pressable accessibilityRole="button" accessibilityLabel={`Ưu đãi Lv.${level.level}`} aria-expanded={expanded}
            onPress={() => setExpandedLevels(previous => previous.includes(level.level) ? previous.filter(value => value !== level.level) : [...previous, level.level])}
            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingHorizontal: wide ? 18 : 14, paddingVertical: 12, backgroundColor: pressed ? '#FFF0F2' : '#FFFFFF' })}>
            <View style={{ flex: 1, minWidth: 0, flexDirection: wide ? 'row' : 'column', gap: wide ? 20 : 6, alignItems: wide ? 'center' : 'stretch' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text accessibilityRole="header" style={[s.body, { width: 56, fontWeight: '800', fontSize: 16 }]}>Lv.{level.level}</Text>
                <Text style={[s.body, { fontSize: 13, ...(wide ? { width: 140 } : { flex: 1 }) }]}>Từ {level.minPoints.toLocaleString('vi-VN')} điểm</Text>
              </View>
              <Text numberOfLines={1} style={[s.small, { flex: wide ? 1 : undefined, ...(wide ? { borderLeftWidth: 1, borderColor: '#E9E9EF', paddingLeft: 20 } : {}) }]}>{level.benefits[0] ?? 'Xem ưu đãi của level'}</Text>
            </View>
            <Arrow size={20} color="#737380" />
          </Pressable>
          {expanded && <View style={{ gap: 8, padding: wide ? 18 : 14, paddingTop: 12, borderTopWidth: 1, borderColor: '#F0EDF0', backgroundColor: '#FFFBFC' }}>
            {level.benefits.length ? level.benefits.map((benefit, index) => <Text key={index} style={s.body}>• {benefit}</Text>) : <Text style={s.small}>Ưu đãi đang được cập nhật.</Text>}
          </View>}
        </View>;
      })}
    </View>
  </View></Page>;
}
