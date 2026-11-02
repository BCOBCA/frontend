import { StyleSheet } from 'react-native';
export const colors = { primary: '#DF403B', background: '#F3F3F7', surface: '#FFFFFF', text: '#24242B', muted: '#777985', border: '#E8E8ED', disabled: '#E4E4E9', gold: '#F6CC53', member: '#D1D7DB', black: '#000000' };
export const money = (amount: number) => `${new Intl.NumberFormat('vi-VN').format(amount)} VNĐ`;
export const dateTime = (value: string) => new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(value));
export const styles = StyleSheet.create({
  fill: { flex: 1 }, page: { flex: 1, backgroundColor: colors.background }, container: { width: '100%', maxWidth: 1180, alignSelf: 'center' },
  padded: { padding: 16, gap: 16 }, row: { flexDirection: 'row', alignItems: 'center', gap: 12 }, between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  title: { fontSize: 20, fontWeight: '700', color: colors.text }, body: { fontSize: 16, color: colors.text }, small: { fontSize: 13, color: colors.muted }, muted: { fontSize: 16, color: colors.muted },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, gap: 12 }, line: { borderBottomColor: colors.border, borderBottomWidth: 1 },
  input: { borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, borderRadius: 8, paddingHorizontal: 12, minHeight: 48, fontSize: 16, color: colors.text },
  error: { color: colors.primary, fontSize: 14 }, price: { color: colors.primary, fontWeight: '700', fontSize: 17 }, center: { alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
});
