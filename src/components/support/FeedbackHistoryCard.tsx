import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ChevronDown, ChevronRight, CircleCheck, CircleHelp, Clock3, ExternalLink, FileSpreadsheet, FileText, ImageOff, MessageSquareText, ShoppingBag, Tag, UserRound, Users } from 'lucide-react-native';
import { colors } from '../../theme';
import { feedbackCreatedAt, parseFeedbackContent, type FeedbackAttachment, type SentFeedback } from './feedback-history';

function AttachmentPreview({ attachment, small = false }: { attachment: FeedbackAttachment; small?: boolean }) {
  const [failed, setFailed] = useState(false);
  const Icon = attachment.kind === 'image' ? ImageOff : attachment.extension === 'XLSX' ? FileSpreadsheet : FileText;
  const size = small ? 40 : 62;
  return attachment.kind === 'image' && !failed
    ? <Image source={{ uri: attachment.url }} accessibilityLabel={attachment.name} resizeMode="cover" onError={() => setFailed(true)} style={{ width: size, height: size, borderRadius: 8, backgroundColor: '#F4F4F9' }} />
    : <View accessibilityLabel={attachment.name} style={{ width: size, height: size, borderRadius: 8, backgroundColor: '#F6F5FA', alignItems: 'center', justifyContent: 'center', gap: 3 }}><Icon size={small ? 19 : 24} color={colors.muted} />{!small && <Text style={{ fontSize: 9, color: colors.muted, fontWeight: '600' }}>{attachment.extension}</Text>}</View>;
}

export function FeedbackHistoryCard({ item, expanded, onToggle, onOpenAttachment }: { item: SentFeedback; expanded: boolean; onToggle: () => void; onOpenAttachment: (attachment: FeedbackAttachment) => void }) {
  const compact = useWindowDimensions().width < 600;
  const { message, attachments } = parseFeedbackContent(item.content);
  const created = feedbackCreatedAt(item.createdAt);
  const TopicIcon = ({ 'Góp ý nâng cấp': MessageSquareText, 'Ưu đãi và voucher': Tag, 'Đơn hàng và thanh toán': ShoppingBag, 'Tài khoản và đăng nhập': UserRound, 'Affiliate và hoa hồng': Users } as Record<string, typeof MessageSquareText>)[item.subject] || CircleHelp;
  const resolved = item.status === 'RESOLVED';
  const StatusIcon = resolved ? CircleCheck : Clock3;
  const Arrow = expanded ? ChevronDown : ChevronRight;
  const badge = <View style={[s.badge, { backgroundColor: resolved ? '#EAF6EF' : '#FFF0D7', alignSelf: compact ? 'flex-start' : 'center' }]}><StatusIcon size={14} color={resolved ? '#286541' : '#975500'} /><Text style={{ fontSize: 11, fontWeight: '600', color: resolved ? '#286541' : '#975500' }}>{resolved ? 'Đã trả lời' : 'Chờ xử lý'}</Text></View>;
  return <View style={s.card}>
    <Pressable accessibilityRole="button" accessibilityLabel={`Xem chi tiết phản hồi: ${item.subject}`} accessibilityHint={`${message}. ${created.time}, ${created.date}. ${attachments.length} tệp đính kèm.`} accessibilityState={{ expanded }} aria-expanded={expanded} onPress={onToggle} style={({ pressed }) => ({ padding: compact ? 14 : 18, flexDirection: 'row', alignItems: 'stretch', gap: compact ? 12 : 20, opacity: pressed ? 0.7 : 1, minHeight: 98 })}>
      <View style={{ width: compact ? 48 : 68, borderRightWidth: 1, borderRightColor: '#ECEBF3', paddingRight: compact ? 10 : 20 }}><View style={{ width: compact ? 38 : 48, height: compact ? 38 : 48, borderRadius: 12, backgroundColor: '#FFECEE', alignItems: 'center', justifyContent: 'center' }}><TopicIcon size={compact ? 22 : 25} color="#D92A33" strokeWidth={1.7} /></View></View>
      <View style={{ flex: 1, minWidth: 0, gap: 5 }}>
        <Text accessibilityRole="header" aria-level={2} numberOfLines={2} style={s.subject}>{item.subject}</Text>
        <Text numberOfLines={2} style={s.message}>{message || 'Ảnh hoặc tài liệu đính kèm'}</Text>
        {!!attachments.length && <View style={{ flexDirection: 'row', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>{attachments.slice(0, 2).map((attachment, index) => <AttachmentPreview key={`${attachment.url}-${index}`} attachment={attachment} />)}{attachments.length > 2 && <View accessibilityLabel={`Còn ${attachments.length - 2} tệp đính kèm`} style={s.more}><Text style={{ color: colors.muted, fontSize: 15 }}>+{attachments.length - 2}</Text></View>}</View>}
        {attachments.some(file => file.kind === 'document') && <Text numberOfLines={1} style={s.time}>{attachments.filter(file => file.kind === 'document').map(file => file.name).join(' · ')}</Text>}
        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 6 }}><Clock3 size={13} color="#9B9DAF" /><Text style={s.time}>{created.time}</Text><View style={{ width: 1, height: 12, backgroundColor: '#DEDDE9' }} /><Text style={s.time}>{created.date}</Text></View>
        {compact && <View style={{ marginTop: 6 }}>{badge}</View>}
      </View>
      {!compact && badge}
      <View style={{ justifyContent: compact ? 'flex-start' : 'center', paddingTop: compact ? 3 : 0 }}><Arrow size={19} color={colors.text} /></View>
    </Pressable>
    {expanded && <View style={{ borderTopWidth: 1, borderTopColor: colors.border, padding: compact ? 16 : 20, gap: 16 }}>
      <View style={{ gap: 6 }}><Text style={s.detailTitle}>Nội dung phản hồi</Text><Text selectable style={s.detailMessage}>{message || 'Ảnh hoặc tài liệu đính kèm'}</Text></View>
      {!!attachments.length && <View style={{ gap: 8 }}><Text style={s.detailTitle}>Tệp đính kèm ({attachments.length})</Text>{attachments.map((attachment, index) => <Pressable key={`${attachment.url}-${index}`} accessibilityRole="link" accessibilityLabel={`Mở tệp: ${attachment.name}`} onPress={() => onOpenAttachment(attachment)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 8, opacity: pressed ? 0.65 : 1 })}><AttachmentPreview attachment={attachment} small /><View style={{ flex: 1, minWidth: 0, gap: 3 }}><Text numberOfLines={2} style={s.message}>{attachment.name}</Text><Text style={s.time}>{attachment.extension}</Text></View><ExternalLink size={16} color={colors.muted} /></Pressable>)}</View>}
      <View style={{ padding: 14, borderRadius: 8, backgroundColor: item.adminResponse ? '#F0F8F3' : '#F6F6FA', gap: 6 }}><Text style={s.detailTitle}>{item.adminResponse ? 'Phản hồi từ BCA' : 'Yêu cầu đang chờ xử lý'}</Text><Text selectable style={s.detailMessage}>{item.adminResponse || 'Phản hồi từ bộ phận hỗ trợ sẽ được cập nhật tại đây.'}</Text></View>
    </View>}
  </View>;
}

const s = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 13, borderWidth: 1, borderColor: '#ECEBF3', boxShadow: '0 3px 9px #35325209', overflow: 'hidden' },
  subject: { color: colors.text, fontWeight: '700', fontSize: 15, lineHeight: 21 },
  message: { color: colors.text, fontSize: 13, lineHeight: 20 },
  time: { color: '#707385', fontSize: 11, lineHeight: 17 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  more: { width: 62, height: 62, backgroundColor: '#F5F4FA', borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  detailTitle: { color: colors.text, fontSize: 13, fontWeight: '600', lineHeight: 20 },
  detailMessage: { color: '#5D606E', fontSize: 13, lineHeight: 22 },
});
