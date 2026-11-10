import { useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';
import { useIsFocused } from 'expo-router';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors, styles as s } from '../../theme';
import { birthdayDisplay, birthdayInput } from './birthday-input';
import { profileSchema } from './profile-data';

type Props = { value: string; onChange: (value: string) => void; onBlur: () => void; disabled?: boolean; error?: string };
const pad = (value: number) => String(value).padStart(2, '0');

export function BirthdayField({ value, onChange, onBlur, disabled = false, error }: Props) {
  const focused = useIsFocused();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => new Date());
  const [yearText, setYearText] = useState('');
  const today = new Date();
  const todayISO = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const validYear = /^\d{4}$/.test(yearText) && Number(yearText) >= 1900 && Number(yearText) <= today.getFullYear();
  const year = validYear ? Number(yearText) : month.getFullYear();
  const offset = (new Date(year, month.getMonth(), 1).getDay() + 6) % 7;
  const days = new Date(year, month.getMonth() + 1, 0).getDate();
  const previousDisabled = !validYear || (year === 1900 && month.getMonth() === 0);
  const nextDisabled = !validYear || (year === today.getFullYear() && month.getMonth() >= today.getMonth());

  if (open && (!focused || disabled)) setOpen(false);
  const showCalendar = () => {
    const initial = value && profileSchema.shape.dateOfBirth.safeParse(value).success ? new Date(`${value}T12:00:00`) : today;
    setMonth(initial); setYearText(String(initial.getFullYear())); setOpen(true);
  };
  const moveMonth = (delta: number) => {
    const next = new Date(year, month.getMonth() + delta, 1);
    setMonth(next); setYearText(String(next.getFullYear()));
  };

  return <View style={{ gap: 6 }}>
    <Text style={s.body}>Ngày sinh (DD/MM/YYYY)</Text>
    <View style={{ justifyContent: 'center' }}>
      <TextInput accessibilityLabel="Ngày sinh (DD/MM/YYYY)" value={birthdayDisplay(value)} onChangeText={text => onChange(birthdayInput(text))} onBlur={onBlur} editable={!disabled} placeholder="31/12/2000" placeholderTextColor={colors.muted} maxLength={10} keyboardType="numbers-and-punctuation" autoCorrect={false} style={[s.input, { paddingRight: 48 }]} />
      <Pressable accessibilityRole="button" accessibilityLabel="Chọn ngày sinh từ lịch" accessibilityState={{ disabled, expanded: open }} disabled={disabled} onPress={showCalendar} style={{ position: 'absolute', right: 0, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><CalendarDays size={21} color={disabled ? colors.muted : colors.primary} /></Pressable>
    </View>
    {error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
    <Modal visible={open && focused && !disabled} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, backgroundColor: 'rgba(20,26,38,0.24)' }}>
        <View accessibilityViewIsModal style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, width: '100%', maxWidth: 360, gap: 12 }}>
          <Text accessibilityRole="header" style={s.title}>Chọn ngày sinh</Text>
          <View style={s.between}>
            <Pressable accessibilityRole="button" accessibilityLabel="Tháng trước" disabled={previousDisabled} accessibilityState={{ disabled: previousDisabled }} onPress={() => moveMonth(-1)} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><ChevronLeft color={previousDisabled ? colors.disabled : colors.text} size={20} /></Pressable>
            <Text style={s.body}>Tháng {month.getMonth() + 1}</Text>
            <TextInput accessibilityLabel="Năm trên lịch" value={yearText} onChangeText={setYearText} maxLength={4} keyboardType="number-pad" selectTextOnFocus style={[s.input, { width: 76, textAlign: 'center' }]} />
            <Pressable accessibilityRole="button" accessibilityLabel="Tháng sau" disabled={nextDisabled} accessibilityState={{ disabled: nextDisabled }} onPress={() => moveMonth(1)} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}><ChevronRight color={nextDisabled ? colors.disabled : colors.text} size={20} /></Pressable>
          </View>
          {!validYear && <Text accessibilityRole="alert" style={s.error}>Nhập năm từ 1900 đến {today.getFullYear()}.</Text>}
          <View style={{ flexDirection: 'row' }}>{['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => <Text key={day} style={[s.small, { width: `${100 / 7}%`, textAlign: 'center' }]}>{day}</Text>)}</View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {Array.from({ length: Math.ceil((offset + days) / 7) * 7 }, (_, index) => {
              const day = index - offset + 1;
              if (day < 1 || day > days) return <View key={index} style={{ width: `${100 / 7}%`, height: 44 }} />;
              const iso = `${year}-${pad(month.getMonth() + 1)}-${pad(day)}`;
              const unavailable = !validYear || iso > todayISO;
              const selected = iso === value;
              return <Pressable key={index} accessibilityRole="button" accessibilityLabel={birthdayDisplay(iso)} accessibilityState={{ selected, disabled: unavailable }} disabled={unavailable} onPress={() => { onChange(iso); onBlur(); setOpen(false); }} style={{ width: `${100 / 7}%`, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: selected ? colors.primary : 'transparent' }}><Text style={{ fontSize: 14, color: unavailable ? colors.muted : selected ? colors.surface : colors.text }}>{day}</Text></Pressable>;
            })}
          </View>
          <Pressable accessibilityRole="button" onPress={() => setOpen(false)} style={{ alignSelf: 'flex-end', minHeight: 44, justifyContent: 'center', paddingHorizontal: 16 }}><Text style={{ color: colors.primary, fontWeight: '600' }}>Đóng</Text></Pressable>
        </View>
      </View>
    </Modal>
  </View>;
}
