import { StyleSheet } from 'react-native';
export const colors = { primary: '#DF403B', background: '#F3F3F7', surface: '#FFFFFF', text: '#24242B', muted: '#777985', border: '#E8E8ED', disabled: '#E4E4E9', gold: '#F6CC53', member: '#D1D7DB', black: '#000000' };
export const money = (amount: number) => `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(amount)} VNĐ`;
export const dateTime = (value: string) => new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(value));
export const styles = StyleSheet.create({
  fill: { flex: 1 }, page: { flex: 1, backgroundColor: colors.background }, container: { width: '100%', maxWidth: 1180, alignSelf: 'center' },
  padded: { padding: 12, gap: 12 }, row: { flexDirection: 'row', alignItems: 'center', gap: 10 }, between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  title: { fontSize: 18, lineHeight: 24, fontWeight: '700', color: colors.text }, body: { fontSize: 14, lineHeight: 20, color: colors.text }, small: { fontSize: 13, lineHeight: 18, color: colors.muted }, muted: { fontSize: 14, lineHeight: 20, color: colors.muted },
  card: { backgroundColor: colors.surface, borderRadius: 10, padding: 12, gap: 10 }, line: { borderBottomColor: colors.border, borderBottomWidth: 1 },
  input: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 8, paddingHorizontal: 10, minHeight: 44, fontSize: 14, color: colors.text },
  error: { color: colors.primary, fontSize: 13, lineHeight: 18 }, price: { color: colors.primary, fontWeight: '700', fontSize: 15, lineHeight: 21 }, center: { alignItems: 'center', justifyContent: 'center', padding: 16, gap: 12 },
});
