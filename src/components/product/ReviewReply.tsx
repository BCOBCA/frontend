import { Text, View } from 'react-native';
import { colors, dateTime } from '../../theme';

export type SellerReply = { content: string; storeName: string; updatedAt: string };

export function ReviewReply({ reply }: { reply?: SellerReply | null }) {
  if (!reply) return null;
  return <View style={{ padding: 12, gap: 6, borderRadius: 8, backgroundColor: '#F6F6F9', borderLeftWidth: 3, borderLeftColor: colors.primary }}>
    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>Phản hồi của {reply.storeName}</Text>
    <Text style={{ fontSize: 13, lineHeight: 20, color: colors.text }}>{reply.content}</Text>
    <Text style={{ fontSize: 11, color: colors.muted }}>{dateTime(reply.updatedAt)}</Text>
  </View>;
}
