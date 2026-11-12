import { Image, Pressable, Text, View } from 'react-native';
import { FileSpreadsheet, FileText, Paperclip, X } from 'lucide-react-native';
import { colors } from '../../theme';
import type { SupportAttachment } from './support-attachments';

type Props = { attachment?: SupportAttachment | null; busy?: boolean; error?: string; onPick: () => void; onRemove: () => void };
export function AttachmentField({ attachment, busy, error, onPick, onRemove }: Props) {
  const extension = attachment?.name.split('.').pop()?.toUpperCase() || 'TỆP';
  const Icon = extension === 'XLSX' ? FileSpreadsheet : FileText;
  return <View style={{ gap: 8 }}>
    <Text style={{ color: colors.text, fontSize: 12 }}>Ảnh hoặc tài liệu đính kèm <Text style={{ color: colors.muted }}>(không bắt buộc)</Text></Text>
    <Pressable accessibilityRole="button" accessibilityLabel={attachment ? 'Đổi tệp đính kèm' : 'Chọn ảnh hoặc tài liệu từ thiết bị'} accessibilityState={{ disabled: !!busy }} disabled={busy} onPress={onPick} style={({ pressed }) => ({ minHeight: 44, borderWidth: 1, borderColor: error ? '#E44A50' : '#DEDDE5', borderRadius: 8, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8, opacity: busy ? 0.5 : pressed ? 0.7 : 1 })}>
      <Paperclip size={17} color={colors.muted} /><Text style={{ color: colors.text, fontSize: 13 }}>{attachment ? 'Chọn tệp khác' : 'Chọn ảnh hoặc tài liệu từ thiết bị'}</Text>
    </Pressable>
    {attachment && <View style={{ padding: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 8, gap: 10 }}>
      {attachment.mimeType?.startsWith('image/') && <Image source={{ uri: attachment.uri }} accessibilityLabel={`Ảnh đính kèm: ${attachment.name}`} resizeMode="contain" style={{ width: '100%', height: 180, borderRadius: 6, backgroundColor: '#F5F5F8' }} />}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {!attachment.mimeType?.startsWith('image/') && <View style={{ backgroundColor: '#FFF0F1', padding: 10, borderRadius: 6 }}><Icon size={25} color="#D72832" /></View>}
        <View style={{ flex: 1, minWidth: 0, gap: 3 }}><Text numberOfLines={2} style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{attachment.name}</Text><Text style={{ fontSize: 11, color: colors.muted }}>{extension}{attachment.size != null ? ` · ${(attachment.size / 1024).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} KB` : ''}</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Xóa tệp đính kèm" disabled={busy} onPress={onRemove} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', opacity: busy ? 0.5 : 1 }}><X size={18} color={colors.muted} /></Pressable>
      </View>
    </View>}
    <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 17 }}>JPG, PNG, WebP, PDF, DOCX, XLSX hoặc TXT. Tối đa 5 MB/tệp.</Text>
    {!!error && <Text accessibilityRole="alert" style={{ color: '#C72A33', fontSize: 12 }}>{error}</Text>}
  </View>;
}
