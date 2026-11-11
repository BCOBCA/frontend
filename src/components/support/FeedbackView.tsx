import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ChevronDown, ChevronUp, ChevronRight, Copy, Headset, Mail, MessageCircle, CircleHelp, Lightbulb, PencilLine } from 'lucide-react-native';
import { SUPPORT_EMAIL } from '../../services/feedback';
import { colors } from '../../theme';
import { SupportArt } from './SupportArt';

type Destination = '/info/affiliate' | '/orders' | '/profile';
type Props = { form: ReactNode; onHistory: () => void; onEmail: () => void; onCopyEmail: () => void; onSuggest: () => void; onNavigate: (destination: Destination) => void };
const questions: { question: string; answer: string; link?: string; route?: Destination }[] = [
  { question: 'Làm thế nào để nhận hoa hồng giới thiệu?', answer: 'Tìm hiểu chương trình Affiliate, cách chia sẻ liên kết và điều kiện ghi nhận trong chính sách hiện hành. Bạn có thể xem các thông tin về hạng và hoa hồng từ khu vực thành viên.', link: 'Xem chính sách Affiliate', route: '/info/affiliate' },
  { question: 'Hoa hồng được tính khi nào?', answer: 'Hoa hồng được ghi nhận theo điều kiện của đơn hàng và chính sách Affiliate. Bạn có thể theo dõi các trạng thái chờ duyệt, đã duyệt và khoản bị thu hồi trong lịch sử hoa hồng; thời hạn đối soát áp dụng theo chính sách hiện hành.', link: 'Tìm hiểu điều kiện ghi nhận', route: '/info/affiliate' },
  { question: 'Tôi theo dõi trạng thái đơn hàng ở đâu?', answer: 'Vào Thành viên → Đơn hàng của tôi. Mỗi đơn có trang chi tiết để xem sản phẩm, tổng thanh toán, địa chỉ nhận và lịch sử cập nhật trạng thái.', link: 'Mở đơn hàng của tôi', route: '/orders' },
  { question: 'Làm sao để thay đổi thông tin tài khoản?', answer: 'Mở Thông tin cá nhân và chọn Chỉnh sửa để cập nhật thông tin của bạn. Các mục đổi mật khẩu và quản lý thiết bị đăng nhập cũng nằm trong khu vực tài khoản.', link: 'Mở thông tin cá nhân', route: '/profile' },
  { question: 'Tôi gặp lỗi khi đặt hàng, cần hỗ trợ thế nào?', answer: 'Kiểm tra lại sản phẩm đã chọn, địa chỉ nhận và điều kiện của voucher. Nếu vẫn gặp lỗi, hãy gửi yêu cầu với thời điểm xảy ra, nội dung thông báo lỗi và mã đơn nếu đã có. Bạn có thể dán liên kết ảnh hoặc tài liệu minh họa trong form.' },
];

export function FeedbackView({ form, onHistory, onEmail, onCopyEmail, onSuggest, onNavigate }: Props) {
  const width = useWindowDimensions().width;
  const wide = width >= 1000;
  const compact = width < 600;
  const [open, setOpen] = useState<number[]>([]);
  const allOpen = open.length === questions.length;
  return <View style={{ padding: compact ? 12 : 20, gap: 16 }}>
    <View style={{ flexDirection: wide ? 'row' : 'column', gap: 16 }}>
      <View style={{ flex: wide ? 1 : undefined, minWidth: 0, backgroundColor: '#FDE7E9', borderRadius: 14, overflow: 'hidden', padding: compact ? 22 : 28, flexDirection: 'row', alignItems: 'center', gap: 16, minHeight: wide ? 216 : undefined }}>
        <View style={{ flex: 1, gap: 12 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>{compact && <Headset size={19} color="#D72832" />}<Text style={{ color: '#D72832', fontSize: 12, fontWeight: '700' }}>Trung tâm hỗ trợ BCA</Text></View><Text accessibilityRole="header" aria-level={1} style={{ color: colors.text, fontSize: compact ? 25 : 28, lineHeight: compact ? 34 : 37, fontWeight: '800', letterSpacing: -0.5 }}>Chúng tôi luôn sẵn sàng{'\n'}lắng nghe và hỗ trợ bạn</Text><Text style={{ color: '#626571', fontSize: 13, lineHeight: 21, maxWidth: 420 }}>Gửi phản hồi, yêu cầu hỗ trợ hoặc góp ý để chúng tôi phục vụ bạn tốt hơn.</Text></View>
        {!compact && <View style={{ width: wide ? 168 : 180, height: 170 }}><SupportArt /></View>}
      </View>
      <View style={[s.card, { width: wide ? 320 : undefined, gap: 10 }]}>
        <View style={s.headingRow}><Headset size={20} color="#D72832" /><Text accessibilityRole="header" aria-level={2} style={s.title}>Liên hệ nhanh</Text></View><Text style={s.body}>Theo dõi yêu cầu trong ứng dụng hoặc liên hệ qua email hỗ trợ.</Text>
        <Pressable accessibilityRole="link" accessibilityLabel="Theo dõi yêu cầu đã gửi" onPress={onHistory} style={({ pressed }) => [s.contact, { opacity: pressed ? 0.65 : 1 }]}><View style={s.contactIcon}><MessageCircle size={20} color="#D72832" /></View><View style={{ flex: 1, gap: 3 }}><Text style={s.contactTitle}>Yêu cầu đã gửi</Text><Text style={s.note}>Xem lịch sử và phản hồi</Text></View><ChevronRight size={16} color={colors.muted} /></Pressable>
        <View style={[s.contact, { paddingRight: 3 }]}><Pressable accessibilityRole="link" accessibilityLabel="Gửi email hỗ trợ" onPress={onEmail} style={{ flex: 1, minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 10 }}><View style={s.contactIcon}><Mail size={20} color="#D72832" /></View><View style={{ flex: 1, gap: 3 }}><Text style={s.contactTitle}>Email hỗ trợ</Text><Text style={s.note}>{SUPPORT_EMAIL}</Text></View></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Sao chép email hỗ trợ" onPress={onCopyEmail} hitSlop={2} style={{ minWidth: 40, minHeight: 40, alignItems: 'center', justifyContent: 'center' }}><Copy size={17} color={colors.muted} /></Pressable></View>
      </View>
    </View>
    <View style={{ flexDirection: wide ? 'row' : 'column', alignItems: 'flex-start', gap: 16 }}>
      <View style={[s.card, { flex: wide ? 1.55 : undefined, width: wide ? undefined : '100%', minWidth: 0 }]}>{form}</View>
      <View style={{ flex: wide ? 1 : undefined, width: wide ? undefined : '100%', minWidth: 0, gap: 16 }}>
        <View style={[s.card, { gap: 8 }]}><View style={s.headingRow}><CircleHelp size={21} color="#D72832" /><Text accessibilityRole="header" aria-level={2} style={[s.title, { flex: 1 }]}>Câu hỏi thường gặp</Text><Pressable accessibilityRole="button" accessibilityLabel={allOpen ? 'Thu gọn câu trả lời' : 'Xem tất cả câu trả lời'} onPress={() => setOpen(allOpen ? [] : questions.map((_, i) => i))} style={{ minHeight: 36, justifyContent: 'center' }}><Text style={{ color: '#D72832', fontSize: 11, fontWeight: '600' }}>{allOpen ? 'Thu gọn' : 'Xem tất cả →'}</Text></Pressable></View>
          {questions.map((item, index) => { const expanded = open.includes(index); const Icon = expanded ? ChevronUp : ChevronDown; return <View key={item.question} style={{ borderBottomWidth: index === questions.length - 1 ? 0 : 1, borderBottomColor: colors.border }}><Pressable accessibilityRole="button" accessibilityLabel={item.question} accessibilityState={{ expanded }} aria-expanded={expanded} onPress={() => setOpen(current => current.includes(index) ? current.filter(value => value !== index) : [...current, index])} style={({ pressed }) => ({ minHeight: 44, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10, opacity: pressed ? 0.6 : 1 })}><Text style={{ flex: 1, color: colors.text, fontSize: 12, lineHeight: 19 }}>{item.question}</Text><Icon size={15} color={colors.muted} /></Pressable>{expanded && <View style={{ paddingBottom: 12, gap: 8 }}><Text style={s.body}>{item.answer}</Text>{item.route && <Pressable accessibilityRole="link" accessibilityLabel={item.link} onPress={() => onNavigate(item.route!)} style={{ minHeight: 36, justifyContent: 'center' }}><Text style={{ color: '#D72832', fontSize: 12, fontWeight: '600' }}>{item.link} →</Text></Pressable>}</View>}</View>; })}
        </View>
        <View style={{ borderWidth: 1, borderColor: '#F8E3E7', borderRadius: 12, backgroundColor: '#FFF0F3', padding: 18, flexDirection: 'row', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}><Lightbulb size={25} color="#D72832" /><View style={{ flex: 1, minWidth: 130, gap: 6 }}><Text accessibilityRole="header" aria-level={2} style={s.title}>Góp ý nâng cấp</Text><Text style={s.body}>Chia sẻ ý kiến để chúng tôi cải thiện sản phẩm và trải nghiệm ngày càng tốt hơn.</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Gửi góp ý nâng cấp" onPress={onSuggest} hitSlop={4} style={({ pressed }) => ({ minHeight: 36, alignSelf: 'center', paddingHorizontal: 10, gap: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E76B73', borderRadius: 7, opacity: pressed ? 0.65 : 1 })}><PencilLine size={14} color="#D72832" /><Text style={{ color: '#D72832', fontSize: 12, fontWeight: '600' }}>Gửi góp ý</Text></Pressable></View>
      </View>
    </View>
  </View>;
}
const s = StyleSheet.create({
  card: { padding: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 }, title: { color: colors.text, fontSize: 16, lineHeight: 22, fontWeight: '700' },
  body: { color: '#666976', fontSize: 12, lineHeight: 19 }, note: { color: colors.muted, fontSize: 11, lineHeight: 17 },
  contact: { borderWidth: 1, borderColor: '#EBEBF1', borderRadius: 9, paddingHorizontal: 8, paddingVertical: 5, minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 10 },
  contactIcon: { width: 34, height: 34, borderRadius: 8, backgroundColor: '#FFF0F2', alignItems: 'center', justifyContent: 'center' },
  contactTitle: { color: colors.text, fontSize: 12, fontWeight: '600', lineHeight: 18 },
});
