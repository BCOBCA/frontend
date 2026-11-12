import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronDown, ChevronRight, CircleHelp, Eye, EyeOff, Gift, Target } from 'lucide-react-native';
import type { Affiliate } from '../../types/api';
import { colors } from '../../theme';
import { affiliateMoney, affiliatePercent } from './affiliate-catalog';
import { AffiliateRankIcon } from './AffiliateRankIcon';

export function AffiliateIncomeCard({ wallet, error, onRetry, onManage, signedIn }: { wallet?: Affiliate; error?: string; onRetry: () => void; onManage: () => void; signedIn: boolean }) {
  const [hidden, setHidden] = useState(false);
  const EyeIcon = hidden ? EyeOff : Eye;
  return <View style={s.panel}>
    <View style={s.row}><Text accessibilityRole="header" aria-level={2} style={[s.title, { flex: 1 }]}>Thu nhập cộng tác</Text><Pressable accessibilityRole="button" accessibilityLabel={hidden ? 'Hiện thu nhập' : 'Ẩn thu nhập'} onPress={() => setHidden(!hidden)} hitSlop={6} style={{ minWidth: 32, minHeight: 32, alignItems: 'center', justifyContent: 'center' }}><EyeIcon size={18} color={colors.muted} /></Pressable></View>
    {error ? <><Text accessibilityRole="alert" style={s.note}>{error}</Text><Pressable accessibilityRole="button" accessibilityLabel="Tải lại thu nhập" onPress={onRetry}><Text style={{ fontSize: 12, color: colors.primary }}>Thử lại</Text></Pressable></> : <>
      <Text style={s.note}>Hoa hồng chờ duyệt</Text><Pressable accessibilityRole="button" accessibilityLabel="Xem thu nhập cộng tác" onPress={onManage} style={[s.row, { justifyContent: 'space-between' }]}><Text style={{ color: '#D91F2A', fontSize: 25, lineHeight: 32, fontWeight: '800' }}>{hidden ? '••••••' : wallet ? affiliateMoney(wallet.pendingBalance) : '—'}</Text><ChevronRight size={19} color={colors.text} /></Pressable>
      <Text style={s.note}>Khả dụng: {hidden ? '••••••' : wallet ? affiliateMoney(wallet.availableBalance) : '—'}</Text>
      {wallet?.rankInfo ? <View style={s.row}><AffiliateRankIcon level={wallet.rankInfo.rank - 1} size={22} /><Text style={[s.note, { color: '#A3494E', flexShrink: 1 }]}>{`${wallet.rankInfo.name} · Hoa hồng ${affiliatePercent(wallet.rankInfo.commissionRate)}`}</Text></View> : <Text style={[s.note, { color: '#A3494E' }]}>{signedIn ? 'Đang tải hạng Affiliate...' : 'Đăng nhập để xem hạng của bạn'}</Text>}
    </>}
  </View>;
}

const questions = [
  { question: 'Hoa hồng được tính như thế nào?', answer: 'Tỷ lệ dựa trên hạng Affiliate hiện tại của bạn, áp dụng mức trần và ngân sách của sản phẩm nếu có. Số tiền trên card là ước tính theo giá đang hiển thị; giảm giá đơn hàng và điều kiện ghi nhận có thể làm thay đổi số tiền thực tế.' },
  { question: 'Khi nào tôi nhận được hoa hồng?', answer: 'Đơn hoàn thành, đã thanh toán và đủ điều kiện được ghi nhận hoa hồng chờ duyệt. Bạn có thể theo dõi việc duyệt và số dư khả dụng trong Quản lý cộng tác.' },
  { question: 'Làm sao để rút hoa hồng?', answer: 'Vào Quản lý cộng tác → Yêu cầu rút tiền. Số tiền rút phụ thuộc số dư khả dụng và chính sách hiện hành; hoa hồng chờ duyệt chưa thể rút.' },
];
export function CollaborationHelp({ onPolicy }: { onPolicy: () => void }) {
  const [open, setOpen] = useState<number | null>(null);
  return <View style={{ gap: 12 }}>
    <View style={s.panel}><View style={s.row}><Target size={19} color="#E02B35" /><Text accessibilityRole="header" aria-level={2} style={s.title}>Hướng dẫn nhanh</Text></View>{[
      ['Chọn sản phẩm', 'Tìm sản phẩm phù hợp để chia sẻ'], ['Lấy link cộng tác', 'Nhấn “Lấy link” để tạo link cá nhân'], ['Chia sẻ & nhận hoa hồng', 'Gửi link đến bạn bè và theo dõi hoa hồng khi có đơn hàng đủ điều kiện'],
    ].map(([title, description], index) => <View key={title} style={{ flexDirection: 'row', gap: 10 }}><View style={{ width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFE5E8' }}><Text style={{ color: '#DD2631', fontSize: 14, fontWeight: '700' }}>{index + 1}</Text></View><View style={{ flex: 1, gap: 2 }}><Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>{title}</Text><Text style={s.note}>{description}</Text></View></View>)}</View>
    <Pressable accessibilityRole="link" accessibilityLabel="Xem chi tiết chính sách cộng tác" onPress={onPolicy} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 9, borderRadius: 11, padding: 13, backgroundColor: '#FFF0F2', borderWidth: 3, borderColor: 'white', opacity: pressed ? 0.65 : 1 })}><Gift size={20} color="#E02B35" /><Text style={{ flex: 1, fontSize: 11, fontWeight: '700', color: '#CF2630' }}>Xem chi tiết chính sách cộng tác</Text><ChevronRight size={16} color={colors.text} /></Pressable>
    <View style={s.panel}><View style={s.row}><CircleHelp size={19} color="#E02B35" /><Text accessibilityRole="header" aria-level={2} style={s.title}>Câu hỏi thường gặp</Text></View>{questions.map((item, index) => <View key={item.question} style={{ backgroundColor: '#FAFAFC', borderWidth: 1, borderColor: '#EEEEF3', borderRadius: 7, overflow: 'hidden' }}><Pressable accessibilityRole="button" accessibilityLabel={item.question} accessibilityState={{ expanded: open === index }} onPress={() => setOpen(open === index ? null : index)} style={{ minHeight: 40, paddingHorizontal: 9, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 5 }}><Text style={{ flex: 1, color: colors.text, fontSize: 11, fontWeight: '600', lineHeight: 16 }}>{item.question}</Text><ChevronDown size={14} color={colors.muted} /></Pressable>{open === index && <Text style={[s.note, { padding: 10, paddingTop: 0, lineHeight: 19 }]}>{item.answer}</Text>}</View>)}</View>
  </View>;
}
const s = StyleSheet.create({ panel: { backgroundColor: colors.surface, borderRadius: 13, padding: 14, gap: 10 }, row: { flexDirection: 'row', alignItems: 'center', gap: 7 }, title: { fontSize: 14, fontWeight: '700', color: colors.text }, note: { color: '#737583', fontSize: 11, lineHeight: 16 } });
