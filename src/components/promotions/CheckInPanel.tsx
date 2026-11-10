import { Platform, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { CalendarCheck, Check, ChevronRight } from 'lucide-react-native';
import { MemberStar } from '../membership/MemberStar';
import { CheckInGift } from './CheckInGift';
import { colors, styles as s } from '../../theme';
import { checkInProgress } from './check-in-progress';

type Props = {
  rewards: readonly (number | null)[];
  streakDays: number;
  checkedInToday: boolean;
  pending: boolean;
  disabled: boolean;
  loading?: boolean;
  onPress: () => void;
};

export function CheckInPanel({ rewards, streakDays, checkedInToday, pending, disabled, loading, onPress }: Props) {
  const compact = useWindowDimensions().width < 600;
  const { today, completed } = checkInProgress(streakDays, checkedInToday);
  const circle = compact ? 30 : 44;
  const title = checkedInToday ? 'Đã điểm danh hôm nay' : pending ? 'Đang điểm danh...' : loading ? 'Đang tải điểm danh...' : 'Điểm danh ngay';
  return <View style={{ backgroundColor: '#FA373A', padding: 8, paddingTop: compact ? 10 : 8, paddingBottom: 10, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }}>
    <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: compact ? 12 : 18, gap: 16 }}>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
        <MemberStar size={26} />
        <View style={{ flex: 1, gap: 2 }}><Text accessibilityRole="header" style={[s.title, { fontSize: compact ? 16 : 18, lineHeight: 23 }]}>Lợi ích thành viên</Text>
          <Text style={[s.small, { fontSize: 12, lineHeight: 17 }]}>Điểm danh hằng ngày để nhận điểm, duy trì chuỗi và nhận thêm nhiều phần thưởng hấp dẫn!</Text>
        </View>
      </View>
      <View accessibilityLabel={loading ? 'Đang tải tiến độ điểm danh' : `Chuỗi điểm danh ${streakDays} ngày`} style={{ paddingVertical: 4 }}>
        <View style={{ position: 'absolute', top: 4 + circle / 2, left: '7%', right: '7%', height: 2, backgroundColor: '#E2DFDA' }} />
        <View style={{ flexDirection: 'row' }}>{rewards.map((points, index) => {
          const active = !loading && index === today;
          const done = !loading && index < completed;
          const gift = index === 6;
          return <View key={index} accessibilityLabel={`Ngày ${index + 1}${active ? ', hôm nay' : ''}${done ? ', đã điểm danh' : ''}, ${points === null ? 'chưa tải điểm thưởng' : `${points} điểm`}`} style={{ flex: 1, alignItems: 'center', gap: compact ? 4 : 5 }}>
            <View style={{ width: circle, height: circle, borderRadius: circle / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? '#F45460' : gift ? '#FFF9ED' : '#FAF9F6', borderWidth: active ? 2 : 1, borderColor: active ? '#FFBAC0' : gift ? '#F0DEC0' : '#EDEAE5', boxShadow: active ? '0 0 0 3px rgba(255,82,96,0.10)' : undefined }}>
              {active ? <CalendarCheck size={compact ? 18 : 26} color="#FFFFFF" strokeWidth={2} /> : done ? <Check size={compact ? 18 : 24} color="#D92C32" strokeWidth={2.5} /> : gift ? <CheckInGift size={compact ? 24 : 34} /> : <MemberStar size={compact ? 25 : 34} />}
            </View>
            <Text numberOfLines={1} style={{ color: active ? '#C81E26' : colors.text, fontWeight: '600', fontSize: compact ? 9 : 12, lineHeight: compact ? 16 : 19, paddingHorizontal: compact ? 0 : 7, borderRadius: 12, backgroundColor: active ? '#FFE7EA' : gift ? '#FFF4CF' : 'transparent' }}>{active ? 'Hôm nay' : `Ngày ${index + 1}`}</Text>
            <Text style={{ color: '#D6141C', fontWeight: '700', fontSize: compact ? 11 : 13, lineHeight: compact ? 15 : 18, textAlign: 'center' }}>{points === null ? '—' : `+${points}${compact ? '\n' : ' '}điểm`}</Text>
          </View>;
        })}</View>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={title} disabled={disabled} onPress={onPress} style={({ pressed }) => ({ minHeight: 44, borderRadius: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, overflow: 'hidden', backgroundColor: disabled ? '#D36C70' : '#E51C25', opacity: pressed ? 0.85 : 1, boxShadow: disabled ? undefined : '0 2px 6px rgba(228,25,37,0.18)', ...(Platform.OS === 'web' ? { backgroundImage: disabled ? undefined : 'linear-gradient(180deg, #F53640 0%, #DD1520 100%)' } : {}) })}>
        <CalendarCheck size={21} color="#FFFFFF" />
        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>{title}</Text>
        {!checkedInToday && <ChevronRight size={20} color="#FFFFFF" />}
      </Pressable>
    </View>
  </View>;
}
