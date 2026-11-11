import { useState, type PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Image, type ImageSource } from 'expo-image';
import { ArrowRight, ArrowUpRight, ShoppingBag, Store, TicketPercent, UserRound, Search, Package, Check, ChevronDown, ChevronUp, Heart, Share2, type LucideIcon } from 'lucide-react-native';
import { colors } from '../../theme';

export type AboutDestination = '/categories' | '/dai-ly' | '/promotions' | '/member' | '/info/affiliate' | '/feedback' | '/orders';
type Props = { heroSource?: ImageSource; onNavigate: (destination: AboutDestination) => void };
const red = '#C8332E';
const quickLinks: { title: string; label: string; route: AboutDestination; Icon: LucideIcon }[] = [
  { title: 'Sản phẩm', label: 'Khám phá sản phẩm', route: '/categories', Icon: ShoppingBag },
  { title: 'Cửa hàng', label: 'Khám phá cửa hàng', route: '/dai-ly', Icon: Store },
  { title: 'Ưu đãi', label: 'Xem ưu đãi', route: '/promotions', Icon: TicketPercent },
  { title: 'Thành viên', label: 'Không gian thành viên', route: '/member', Icon: UserRound },
];
const features = [
  { title: 'Khám phá theo cách của bạn', body: 'Tìm sản phẩm theo tên, duyệt danh mục và ghé thăm từng cửa hàng để lựa chọn điều phù hợp với nhu cầu. Thông tin sản phẩm, phân loại và giá bán giúp bạn cân nhắc trước khi thêm vào giỏ, thay vì chỉ lựa chọn qua một hình ảnh.', Icon: Search },
  { title: 'Ưu đãi đi cùng lựa chọn', body: 'Khám phá voucher của shop, voucher sàn và ưu đãi vận chuyển trong cùng hành trình mua sắm. Kiểm tra điều kiện áp dụng, khoản giảm và tổng thanh toán trước khi đặt hàng để biết ưu đãi mang lại giá trị gì cho lựa chọn của bạn.', Icon: TicketPercent },
  { title: 'Đơn hàng luôn trong tầm mắt', body: 'Theo dõi trạng thái, sản phẩm và thông tin nhận hàng của từng đơn ngay trong tài khoản. Khi mua ở nhiều cửa hàng, các đơn được tách riêng để bạn dễ xem tiến trình và lịch sử cập nhật của từng shop.', Icon: Package },
  { title: 'Thuận tiện cho lần trở lại', body: 'Lưu sản phẩm yêu thích, quản lý địa chỉ nhận và xem lại lịch sử mua sắm trong một không gian riêng. Các thông tin về điểm và hạng thành viên giúp bạn theo dõi quyền lợi theo chính sách được áp dụng trên nền tảng.', Icon: Heart },
];
const questions = [
  { question: 'Báo chí Online BCA là nền tảng gì?', answer: 'Báo chí Online BCA là web/app kết nối trải nghiệm khám phá sản phẩm, mua sắm tại các cửa hàng, sử dụng ưu đãi và quản lý đơn hàng. Bạn cũng có thể tìm hiểu chương trình thành viên và Affiliate ngay trong ứng dụng.' },
  { question: 'Tôi có thể mua từ nhiều cửa hàng cùng lúc không?', answer: 'Bạn có thể chọn sản phẩm từ nhiều cửa hàng trong cùng một lần thanh toán. Hệ thống tách thành đơn riêng cho từng cửa hàng để theo dõi; phí giao hàng và điều kiện voucher được tính theo đơn và mã áp dụng.' },
  { question: 'Tôi xem đơn hàng đã đặt ở đâu?', answer: 'Mở mục Thành viên, chọn Đơn hàng của tôi để xem các đơn đã đặt. Trang chi tiết lưu thông tin sản phẩm, địa chỉ nhận, tổng thanh toán và lịch sử cập nhật của đơn.', action: 'Xem đơn hàng của tôi', route: '/orders' as const },
  { question: 'Làm thế nào để tìm hiểu chương trình Affiliate?', answer: 'Trang Chính sách Affiliate giới thiệu cách tham gia, chia sẻ liên kết và điều kiện ghi nhận hoa hồng. Hãy xem chính sách hiện hành trước khi tham gia.', action: 'Xem chính sách Affiliate', route: '/info/affiliate' as const },
];

function Eyebrow({ children, light = false }: PropsWithChildren<{ light?: boolean }>) {
  return <Text style={{ color: light ? '#FFE6D7' : red, fontSize: 11, lineHeight: 18, fontWeight: '700', letterSpacing: 1.8 }}>{children}</Text>;
}
function Heading({ children, light = false, compact }: PropsWithChildren<{ light?: boolean; compact: boolean }>) {
  return <Text accessibilityRole="header" aria-level={2} style={{ fontSize: compact ? 27 : 34, lineHeight: compact ? 36 : 44, fontWeight: '700', letterSpacing: -0.7, color: light ? '#FFFAF7' : colors.text }}>{children}</Text>;
}
function Action({ title, onPress, light = false, outline = false }: { title: string; onPress: () => void; light?: boolean; outline?: boolean }) {
  const color = outline ? light ? '#FFFAF7' : red : light ? '#A92320' : '#FFFAF7';
  return <Pressable accessibilityRole="link" accessibilityLabel={title} onPress={onPress} hitSlop={3} style={({ pressed }) => ({ minHeight: 38, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 7, borderWidth: 1, borderColor: outline ? light ? '#FFFFFF70' : '#D8A4A0' : light ? '#FFFAF7' : red, backgroundColor: outline ? 'transparent' : light ? '#FFFAF7' : red, opacity: pressed ? 0.7 : 1 })}><Text style={{ fontSize: 13, lineHeight: 20, fontWeight: '600', color }}>{title}</Text><ArrowRight size={15} color={color} /></Pressable>;
}

export function AboutView({ heroSource, onNavigate }: Props) {
  const { width } = useWindowDimensions();
  const compact = width < 700;
  const wide = width >= 960;
  const [openQuestion, setOpenQuestion] = useState<number | null>(0);
  const spacing = compact ? 22 : 44;
  return <View style={{ padding: compact ? 12 : 20, paddingBottom: compact ? 24 : 36, gap: compact ? 24 : 32 }}>
    <View style={{ backgroundColor: '#BD1817', borderRadius: 18, overflow: 'hidden', minHeight: wide ? 440 : undefined }}>
      {wide && <Image source={heroSource} contentFit="cover" contentPosition="right center" accessible={false} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }} />}
      <View style={{ padding: spacing, paddingVertical: wide ? 58 : 32, gap: 20, maxWidth: wide ? 600 : undefined }}>
        <Eyebrow light>VỀ BÁO CHÍ ONLINE BCA</Eyebrow>
        <Text accessibilityRole="header" aria-level={1} style={{ fontSize: compact ? 34 : 46, lineHeight: compact ? 43 : 57, fontWeight: '800', letterSpacing: -1.2, color: '#FFFAF7' }}>Mua sắm gần hơn.{'\n'}Kết nối nhiều hơn.</Text>
        <Text style={{ color: '#FFF0E8', fontSize: 15, lineHeight: 25, maxWidth: 430 }}>Khám phá sản phẩm, gặp gỡ các cửa hàng và tìm ưu đãi phù hợp — trong một trải nghiệm web/app cùng Báo chí Online BCA.</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 }}><Action title="Khám phá sản phẩm" light onPress={() => onNavigate('/categories')} /><Action title="Khám phá cửa hàng" light outline onPress={() => onNavigate('/dai-ly')} /></View>
      </View>
      {!wide && <Image source={heroSource} contentFit="cover" contentPosition="right center" accessible={false} style={{ width: '100%', height: compact ? 210 : 260 }} />}
    </View>

    <View style={{ flexDirection: 'row', flexWrap: 'wrap', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 16 }}>
      {quickLinks.map(({ title, label, route, Icon }) => <Pressable key={title} accessibilityRole="link" accessibilityLabel={label} onPress={() => onNavigate(route)} style={({ pressed }) => ({ width: compact ? '50%' : '25%', minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: compact ? 'flex-start' : 'center', gap: 10, paddingHorizontal: compact ? 12 : 16, opacity: pressed ? 0.6 : 1 })}><Icon size={20} color={red} strokeWidth={1.7} /><Text style={{ color: colors.text, fontSize: 14, fontWeight: '600' }}>{title}</Text><ArrowUpRight size={14} color={colors.muted} /></Pressable>)}
    </View>

    <View style={{ flexDirection: wide ? 'row' : 'column', gap: wide ? 80 : 28, paddingHorizontal: compact ? 8 : 24, paddingVertical: compact ? 12 : 24 }}>
      <View style={{ flex: 1, gap: 14 }}><Eyebrow>GIỚI THIỆU BÁO CHÍ ONLINE BCA</Eyebrow><Heading compact={compact}>Một nền tảng.{'\n'}Nhiều cách kết nối.</Heading><Text style={s.body}>Báo chí Online BCA được phát triển như một không gian mua sắm số, nơi người dùng có thể khám phá sản phẩm, tìm hiểu cửa hàng và quản lý các hoạt động mua sắm của mình trên cùng một nền tảng. Trải nghiệm được thiết kế cho cả trình duyệt web và giao diện di động, để việc tìm kiếm và theo dõi đơn hàng thuận tiện hơn trong những tình huống sử dụng hằng ngày.</Text><Text style={s.body}>Chúng tôi bắt đầu từ một nhu cầu rất thực tế: người mua cần biết sản phẩm có phù hợp không, mua từ cửa hàng nào, được áp dụng ưu đãi gì và đơn hàng đang ở đâu. Vì vậy, danh mục sản phẩm, thông tin shop, giỏ hàng, voucher và lịch sử đơn được kết nối thành một hành trình, thay vì những bước rời rạc.</Text><Text style={s.body}>Bên cạnh mua sắm, nền tảng còn có không gian thành viên và chương trình Affiliate. Người dùng có thể lưu lại những lựa chọn quan tâm, theo dõi quyền lợi theo chính sách và tìm hiểu cách chia sẻ sản phẩm đến cộng đồng. Chúng tôi mong muốn mỗi lần quay lại đều bắt đầu từ những thông tin bạn đã có, với ít thao tác lặp lại hơn.</Text></View>
      <View style={{ flex: 1, gap: 4 }}>{[
        ['01', 'Lấy người dùng làm điểm bắt đầu', 'Một trải nghiệm tốt phải giúp bạn hiểu mình đang lựa chọn điều gì. Chúng tôi hướng đến thông tin dễ tìm, thao tác dễ hiểu và các bước kiểm tra rõ ràng trước khi đặt hàng.'],
        ['02', 'Kết nối sản phẩm với nhu cầu', 'Người mua có thêm cách tìm đến sản phẩm phù hợp; cửa hàng có một không gian để giới thiệu danh mục và ưu đãi của mình. Sự kết nối bắt đầu từ những thông tin cụ thể về từng lựa chọn.'],
        ['03', 'Cải thiện từ những phản hồi', 'Những vướng mắc khi tìm kiếm, đặt hàng hay quản lý tài khoản đều là thông tin có ích. Chúng tôi coi phản hồi của người dùng là cơ sở để điều chỉnh và tiếp tục hoàn thiện nền tảng.'],
      ].map(([number, title, body]) => <View key={number} style={{ flexDirection: 'row', gap: 16, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: colors.border }}><Text style={{ color: red, fontSize: 12, fontWeight: '700', paddingTop: 3 }}>{number}</Text><View style={{ flex: 1, gap: 6 }}><Text style={s.smallTitle}>{title}</Text><Text style={s.body}>{body}</Text></View></View>)}</View>
    </View>

    <View style={{ backgroundColor: '#FBECE6', borderRadius: 16, padding: spacing, gap: 28 }}>
      <View style={{ gap: 12, maxWidth: 700 }}><Eyebrow>SỨ MỆNH & TẦM NHÌN</Eyebrow><Heading compact={compact}>Kết nối hôm nay.{'\n'}Xây dựng giá trị lâu dài.</Heading><Text style={s.body}>Chúng tôi hướng đến một nền tảng mà việc khám phá, lựa chọn và kết nối có thể diễn ra tự nhiên, với người dùng là trung tâm của quá trình phát triển.</Text></View>
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: wide ? 48 : 28 }}>
        <View style={{ flex: 1, gap: 10, borderLeftWidth: 3, borderLeftColor: red, paddingLeft: 18 }}><Text accessibilityRole="header" aria-level={3} style={s.smallTitle}>Sứ mệnh của chúng tôi</Text><Text style={s.body}>Làm cho việc tiếp cận sản phẩm và cửa hàng trở nên thuận tiện hơn thông qua công nghệ. Từ nhu cầu tìm một món đồ đến việc theo dõi đơn đã đặt, chúng tôi muốn người dùng có đủ thông tin để chủ động quyết định và có một nơi để xem lại hành trình mua sắm của mình.</Text><Text style={s.body}>Đối với cửa hàng, nền tảng hướng đến việc tạo thêm điểm chạm với khách hàng qua trang giới thiệu, danh mục sản phẩm và những ưu đãi gắn với nhu cầu thực tế.</Text></View>
        <View style={{ flex: 1, gap: 10, borderLeftWidth: 3, borderLeftColor: '#D8A4A0', paddingLeft: 18 }}><Text accessibilityRole="header" aria-level={3} style={s.smallTitle}>Tầm nhìn phát triển</Text><Text style={s.body}>Trở thành một điểm đến quen thuộc cho việc khám phá sản phẩm và kết nối mua sắm. Giá trị chúng tôi theo đuổi nằm ở trải nghiệm có thể sử dụng mỗi ngày: dễ bắt đầu, thuận tiện khi quay lại và rõ ràng khi cần tra cứu.</Text><Text style={s.body}>Đó là định hướng dài hạn để chúng tôi tiếp tục cải thiện nền tảng, lắng nghe người dùng và xây dựng sự gắn kết giữa người mua, cửa hàng và cộng đồng chia sẻ sản phẩm.</Text></View>
      </View>
    </View>

    <View style={{ backgroundColor: '#FFFCFA', borderRadius: 16, padding: spacing, gap: 30 }}>
      <View style={{ gap: 12 }}><Eyebrow>TRẢI NGHIỆM TRÊN WEB & APP</Eyebrow><Heading compact={compact}>Từ điều bạn thích,{'\n'}đến lựa chọn mỗi ngày.</Heading></View>
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: wide ? 48 : 28 }}>
        <View accessible={false} style={{ flex: wide ? 0.9 : undefined, borderRadius: 14, backgroundColor: '#F9EEE9', padding: compact ? 24 : 32, justifyContent: 'center', gap: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text style={{ fontSize: 12, fontWeight: '700', color: red, letterSpacing: 1 }}>HÀNH TRÌNH MUA SẮM</Text><ShoppingBag size={22} color={red} /></View>
          <Text style={{ fontSize: 25, lineHeight: 34, fontWeight: '700', letterSpacing: -0.5, color: colors.text }}>Tìm thấy điều phù hợp.{'\n'}Theo dõi thật dễ dàng.</Text>
          <View style={{ gap: 0 }}>{['Khám phá sản phẩm', 'Lựa chọn cửa hàng & ưu đãi', 'Kiểm tra và đặt hàng', 'Theo dõi từng đơn hàng'].map((step, index) => <View key={step} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12, borderTopWidth: index ? 1 : 0, borderTopColor: '#EEDCD4' }}><View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: index === 0 ? red : '#FFFCFA', justifyContent: 'center', alignItems: 'center' }}>{index === 0 ? <Check size={15} color="#FFFAF7" /> : <Text style={{ fontSize: 12, color: red, fontWeight: '600' }}>{index + 1}</Text>}</View><Text style={{ flex: 1, fontSize: 13, lineHeight: 20, color: colors.text }}>{step}</Text></View>)}</View>
        </View>
        <View style={{ flex: 1.1, gap: 22 }}>{features.map(({ title, body, Icon }) => <View key={title} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}><View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#FFF0EC', alignItems: 'center', justifyContent: 'center' }}><Icon size={21} color={red} strokeWidth={1.7} /></View><View style={{ flex: 1, gap: 6 }}><Text style={s.smallTitle}>{title}</Text><Text style={s.body}>{body}</Text></View></View>)}</View>
      </View>
    </View>

    <View style={{ paddingHorizontal: compact ? 8 : 24, paddingVertical: compact ? 12 : 24, gap: 26 }}>
      <View style={{ gap: 12, maxWidth: 700 }}><Eyebrow>DÀNH CHO NHỮNG NHU CẦU KHÁC NHAU</Eyebrow><Heading compact={compact}>Bạn đến để lựa chọn.{'\n'}Chúng tôi tạo thêm kết nối.</Heading><Text style={s.body}>Dù bạn đang tìm sản phẩm cho bản thân, giới thiệu cửa hàng hay muốn chia sẻ một lựa chọn hữu ích, mỗi vai trò đều góp phần tạo nên trải nghiệm của Báo chí Online BCA.</Text></View>
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: wide ? 48 : 32 }}>
        <View style={{ flex: 1, gap: 14, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 24 }}><ShoppingBag size={26} color={red} strokeWidth={1.6} /><Text accessibilityRole="header" aria-level={3} style={{ ...s.smallTitle, fontSize: 20, lineHeight: 28 }}>Dành cho người mua</Text><Text style={s.body}>Không phải lúc nào bạn cũng biết chính xác mình cần mua gì. Danh mục, công cụ tìm kiếm và trang cửa hàng giúp bạn bắt đầu từ nhu cầu, xem thông tin sản phẩm rồi lựa chọn phân loại phù hợp.</Text><Text style={s.body}>Trước khi đặt hàng, bạn có thể kiểm tra giỏ hàng, địa chỉ nhận, voucher và tổng thanh toán. Sau khi đặt, thông tin được lưu theo từng đơn để bạn dễ theo dõi, thay vì phải ghi nhớ mọi chi tiết.</Text><Text style={s.body}>Những sản phẩm yêu thích, địa chỉ đã lưu và lịch sử mua sắm giúp việc quay lại trở nên thuận tiện hơn. Khi cần góp ý về trải nghiệm, bạn có thể gửi phản hồi ngay trong ứng dụng.</Text><Action title="Tìm sản phẩm phù hợp" outline onPress={() => onNavigate('/categories')} /></View>
        <View style={{ flex: 1, gap: 14, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 24 }}><Store size={26} color={red} strokeWidth={1.6} /><Text accessibilityRole="header" aria-level={3} style={{ ...s.smallTitle, fontSize: 20, lineHeight: 28 }}>Dành cho cửa hàng</Text><Text style={s.body}>Một sản phẩm cần được đặt trong bối cảnh của cửa hàng đứng sau nó. Trang cửa hàng tập hợp phần giới thiệu, danh mục sản phẩm và các thông tin được công bố, giúp người mua tìm hiểu trước khi đưa ra lựa chọn.</Text><Text style={s.body}>Sản phẩm được gắn với từng shop trong hành trình mua sắm. Khi người dùng đặt từ nhiều nơi, hệ thống tách đơn theo cửa hàng để thông tin sản phẩm, ưu đãi và tiến trình của từng đơn dễ phân biệt hơn.</Text><Text style={s.body}>Chúng tôi hướng đến việc giúp cửa hàng được khám phá thông qua chính sản phẩm và thông tin của mình, đồng thời tạo thêm cơ hội kết nối với người dùng có nhu cầu phù hợp.</Text><Action title="Ghé thăm các cửa hàng" outline onPress={() => onNavigate('/dai-ly')} /></View>
      </View>
    </View>

    <View style={{ backgroundColor: '#28282F', borderRadius: 16, padding: spacing, flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'center' : 'stretch', gap: 30 }}>
      <View style={{ flex: 1, gap: 16 }}><Eyebrow light>CÙNG CHIA SẺ, CÙNG KẾT NỐI</Eyebrow><Heading compact={compact} light>Điều bạn yêu thích,{'\n'}có thể hữu ích với người khác.</Heading><Text style={{ fontSize: 14, lineHeight: 24, color: '#DBDBE0', maxWidth: 600 }}>Một lựa chọn hữu ích có thể bắt đầu từ lời giới thiệu của người khác. Chương trình Affiliate tạo thêm cách để thành viên chia sẻ liên kết sản phẩm đến những người quan tâm và theo dõi kết quả theo chính sách của nền tảng.</Text><Text style={{ fontSize: 14, lineHeight: 24, color: '#DBDBE0', maxWidth: 600 }}>Chúng tôi khuyến khích việc chia sẻ dựa trên thông tin rõ ràng và nhu cầu thực tế. Điều kiện ghi nhận, mức hoa hồng, thời gian xét duyệt và ảnh hưởng của đơn hủy hoặc hoàn tiền cần được tìm hiểu trước khi tham gia; việc chia sẻ liên kết không đồng nghĩa với khoản thu nhập được bảo đảm.</Text><Action title="Tìm hiểu Affiliate" light onPress={() => onNavigate('/info/affiliate')} /></View>
      <View style={{ width: wide ? 220 : undefined, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16, borderLeftWidth: wide ? 1 : 0, borderLeftColor: '#48484E' }}><Share2 size={54} color="#F3B5A8" strokeWidth={1.1} /><Text style={{ color: '#F5ECE7', fontSize: 15, lineHeight: 23, textAlign: 'center', fontWeight: '500' }}>Chia sẻ lựa chọn.{'\n'}Mở rộng kết nối.</Text></View>
    </View>

    <View style={{ padding: compact ? 8 : 24, paddingVertical: compact ? 12 : 24, gap: 18, maxWidth: 900 }}><Eyebrow>TIẾP TỤC HOÀN THIỆN MỖI NGÀY</Eyebrow><Heading compact={compact}>Phát triển từ những điều{'\n'}người dùng thực sự cần.</Heading><Text style={s.body}>Với chúng tôi, phát triển nền tảng là một quá trình liên tục. Một chức năng chỉ có ý nghĩa khi giúp người dùng giải quyết được việc cụ thể: tìm đúng sản phẩm, hiểu rõ khoản thanh toán, xem lại địa chỉ nhận hay biết đơn hàng đang ở bước nào.</Text><Text style={s.body}>Trong quá trình hoàn thiện, chúng tôi ưu tiên sự nhất quán giữa các màn hình, khả năng sử dụng trên thiết bị di động và cách trình bày thông tin dễ hiểu. Những tính năng về cửa hàng, ưu đãi và thành viên cần được kết nối với trải nghiệm mua sắm, để mỗi bước đều có mục đích rõ ràng.</Text><Text style={s.body}>Bạn có thể góp phần vào quá trình đó bằng cách chia sẻ điều thuận tiện, điểm còn khó sử dụng hoặc nhu cầu chưa được đáp ứng. Kênh phản hồi trong ứng dụng là nơi để gửi những góp ý ấy, giúp chúng tôi hiểu trải nghiệm từ góc nhìn của người sử dụng.</Text></View>

    <View style={{ flexDirection: wide ? 'row' : 'column', gap: wide ? 64 : 24, padding: compact ? 8 : 24, paddingVertical: compact ? 12 : 24 }}>
      <View style={{ flex: wide ? 0.7 : undefined, gap: 14 }}><Eyebrow>BẠN MUỐN TÌM HIỂU THÊM?</Eyebrow><Heading compact={compact}>Câu hỏi thường gặp</Heading><Text style={s.body}>Một vài thông tin để bạn bắt đầu khám phá nền tảng.</Text></View>
      <View style={{ flex: 1.3 }}>{questions.map(({ question, answer, action, route }, index) => {
        const expanded = openQuestion === index;
        const Icon = expanded ? ChevronUp : ChevronDown;
        return <View key={question} style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}><Pressable accessibilityRole="button" accessibilityLabel={question} accessibilityState={{ expanded }} aria-expanded={expanded} onPress={() => setOpenQuestion(expanded ? null : index)} style={({ pressed }) => ({ minHeight: 64, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, opacity: pressed ? 0.65 : 1 })}><Text style={{ flex: 1, fontSize: 14, fontWeight: '600', lineHeight: 22, color: colors.text }}>{question}</Text><Icon size={18} color={expanded ? red : colors.muted} /></Pressable>{expanded && <View style={{ paddingBottom: 20, gap: 12 }}><Text style={s.body}>{answer}</Text>{action && route && <Action title={action} outline onPress={() => onNavigate(route)} />}</View>}</View>;
      })}</View>
    </View>

    <View style={{ backgroundColor: '#FBECE6', borderRadius: 16, padding: spacing, gap: 18, alignItems: 'center' }}><ShoppingBag size={28} color={red} strokeWidth={1.6} /><Text accessibilityRole="header" aria-level={2} style={{ fontSize: compact ? 26 : 34, lineHeight: compact ? 35 : 44, fontWeight: '700', letterSpacing: -0.6, textAlign: 'center', color: colors.text }}>Bắt đầu từ điều bạn đang tìm.</Text><Text style={{ ...s.body, textAlign: 'center', maxWidth: 570 }}>Một sản phẩm phù hợp, một cửa hàng bạn yêu thích, hay một ưu đãi cho lần mua tiếp theo. Khám phá cùng Báo chí Online BCA.</Text><View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 12, marginTop: 4 }}><Action title="Bắt đầu khám phá" onPress={() => onNavigate('/categories')} /><Action title="Gửi phản hồi" outline onPress={() => onNavigate('/feedback')} /></View></View>
    <View style={{ alignItems: 'center', gap: 6, paddingVertical: 6 }}><Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>Báo chí Online BCA</Text><Text style={{ color: colors.muted, fontSize: 12, textAlign: 'center' }}>Khám phá · Mua sắm · Kết nối</Text></View>
  </View>;
}

const s = StyleSheet.create({
  body: { color: '#666875', fontSize: 14, lineHeight: 24 },
  smallTitle: { color: colors.text, fontSize: 16, lineHeight: 24, fontWeight: '600' },
});
