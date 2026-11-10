import { ImageBackground, Platform, Text, useWindowDimensions, View } from 'react-native';
import { BadgeCheck, Heart, MapPin, Search } from 'lucide-react-native';
import { colors } from '../../theme';

export function DealerHero({ compact }: { compact: boolean }) {
  const { width } = useWindowDimensions();
  const fontFamily = Platform.OS === 'web' ? 'Arial, Helvetica, sans-serif' : undefined;
  const headingSize = compact ? (width < 360 ? 22 : 24) : 28;
  return <View style={{ flexDirection: compact ? 'column' : 'row', gap: 16 }}>
    <ImageBackground source={require('../../../assets/dealer-banner-3d.png')} resizeMode="cover"
      imageStyle={{ width: '100%', height: '100%', opacity: compact ? 0.8 : 1 }}
      style={{ flex: 1, minHeight: compact ? 164 : 202, backgroundColor: '#C91D24', borderRadius: 16, overflow: 'hidden', justifyContent: 'center', paddingHorizontal: compact ? 20 : 36, paddingVertical: 24 }}>
      <View style={{ width: compact ? '86%' : '64%', maxWidth: 440, gap: compact ? 8 : 10 }}>
        <Text accessibilityRole="header" style={{ fontFamily, color: '#FFFFFF', fontSize: headingSize, lineHeight: compact ? 29 : 34, fontWeight: '800' }}>Danh sách{'\n'}<Text style={{ color: '#FFE1A3', fontSize: compact ? headingSize : 34, lineHeight: compact ? 31 : 40 }}>Đại lý chính thức</Text></Text>
        <Text style={{ fontFamily, color: '#FFFFFF', fontSize: compact ? 12 : 13, lineHeight: 19, maxWidth: compact ? 225 : 380 }}>{compact ? 'Khám phá các đại lý uy tín' : 'Tìm kiếm dễ dàng · Kết nối đại lý yêu thích'}</Text>
      </View>
    </ImageBackground>
    {!compact && <View style={{ width: 280, padding: 20, borderRadius: 18, backgroundColor: colors.surface, gap: 14 }}>
      {[{ Icon: BadgeCheck, title: 'Đại lý uy tín', text: 'Nhận diện qua huy hiệu xác minh' }, { Icon: MapPin, title: 'Thông tin được xác minh', text: 'Tìm hiểu thông tin đại lý công khai' }, { Icon: Search, title: 'Tìm kiếm dễ dàng', text: 'Lọc theo tên và khu vực hoạt động' }, { Icon: Heart, title: 'Theo dõi đại lý yêu thích', text: 'Kết nối với những đại lý bạn quan tâm' }].map(({ Icon, title, text }) => <View key={title} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFF0F0', alignItems: 'center', justifyContent: 'center' }}><Icon size={19} color={colors.primary} /></View>
        <View style={{ flex: 1 }}><Text style={{ color: colors.text, fontSize: 13, fontWeight: '700' }}>{title}</Text><Text style={{ color: colors.muted, fontSize: 11, lineHeight: 16 }}>{text}</Text></View>
      </View>)}
    </View>}
  </View>;
}
