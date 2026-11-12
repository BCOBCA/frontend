import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Building2, Check, Circle, CircleHelp, ClipboardList, Coins, PlusCircle, Send, Wallet } from 'lucide-react-native';
import { colors } from '../../theme';
import type { Affiliate } from '../../types/api';
import { WithdrawalBankForm } from './WithdrawalBankForm';
import { withdrawalMoney, type AffiliateBankAccount, type BankDetails, type WithdrawalSettings, type withdrawalQuote } from './withdrawal';

export type WithdrawalRequestViewProps = {
  wallet?: Affiliate; settings?: WithdrawalSettings; amount: string; quote: ReturnType<typeof withdrawalQuote>;
  banks: AffiliateBankAccount[]; selectedId: string; disabled: boolean; submitDisabled: boolean; submitting: boolean; uncertain: boolean;
  addingBank: boolean; savingBank: boolean; bankError?: unknown;
  onAmount: (value: string) => void; onSelectBank: (id: string) => void; onAddBank: () => void; onSaveBank: (value: BankDetails) => void; onCancelBank: () => void; onSubmit: () => void;
};

export function WithdrawalRequestView(p: WithdrawalRequestViewProps) {
  const [explainBalance, setExplainBalance] = useState(false);
  return <View style={{ gap: 18 }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 14, backgroundColor: '#FFF3F5', backgroundImage: 'linear-gradient(110deg, #FFF0F3, #FFF9FA)' }}>
      <View style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}><Wallet size={27} color={colors.primary} strokeWidth={1.7} /></View>
      <View style={{ flex: 1, minWidth: 0, gap: 5 }}><Text style={s.small}>Số dư khả dụng</Text><Text style={[s.balance, { color: colors.primary }]}>{p.wallet ? withdrawalMoney(p.wallet.availableBalance) : '—'}</Text></View>
      <View style={{ width: 1, height: 40, backgroundColor: '#ECDDE1' }} />
      <View style={{ flex: 1, minWidth: 0, gap: 5 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}><Text style={[s.small, { flexShrink: 1 }]}>Số tiền có thể rút</Text><Pressable accessibilityRole="button" accessibilityLabel="Giải thích số tiền có thể rút" accessibilityState={{ expanded: explainBalance }} onPress={() => setExplainBalance(!explainBalance)} hitSlop={8}><CircleHelp size={14} color={colors.muted} /></Pressable></View><Text style={s.balance}>{p.quote.withdrawable === null ? '—' : withdrawalMoney(p.quote.withdrawable)}</Text></View>
    </View>
    {explainBalance && <Text style={s.note}>Số dư khả dụng được áp dụng giới hạn mỗi lần rút. Hoa hồng chờ về chưa thể rút. Phí được trừ vào số tiền bạn yêu cầu.</Text>}
    {!!p.wallet?.debtBalance && <Text accessibilityRole="alert" style={s.error}>{p.quote.error}</Text>}
    <View style={{ gap: 10 }}>
      <View style={s.heading}><Coins size={21} color={colors.primary} /><Text accessibilityRole="header" aria-level={2} style={s.title}>Số tiền rút</Text></View>
      <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#D8D8E3', borderRadius: 9, paddingHorizontal: 12 }}><TextInput accessibilityLabel="Số tiền rút" placeholder="Nhập số tiền muốn rút" placeholderTextColor={colors.muted} value={p.amount} onChangeText={p.onAmount} editable={!p.disabled} inputMode="numeric" keyboardType="number-pad" maxLength={16} style={{ flex: 1, minWidth: 0, height: 44, color: colors.text, fontSize: 14 }} /><Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>VNĐ</Text></View>
      <Text style={s.note}>{p.settings ? `Tối thiểu: ${withdrawalMoney(p.settings.minimumAmount)}  |  Tối đa: ${withdrawalMoney(p.settings.maximumAmount)} mỗi lần` : 'Đang tải giới hạn rút tiền...'}</Text>
      {!!p.amount && !!p.quote.error && !p.wallet?.debtBalance && <Text accessibilityRole="alert" style={s.error}>{p.quote.error}</Text>}
    </View>
    <View style={{ gap: 10 }}>
      <View style={s.heading}><Building2 size={22} color={colors.primary} /><Text accessibilityRole="header" aria-level={2} style={s.title}>Chọn ngân hàng thụ hưởng</Text></View>
      {!p.banks.length && !p.addingBank && <Text style={s.note}>Thêm tài khoản ngân hàng của bạn để nhận tiền.</Text>}
      <View role="radiogroup" accessibilityLabel="Ngân hàng nhận tiền" style={{ gap: 8 }}>{p.banks.map(bank => {
        const selected = bank.id === p.selectedId;
        return <Pressable key={bank.id} accessibilityRole="radio" accessibilityLabel={`${bank.bankName}, tài khoản ${bank.accountNumber}, ${bank.accountHolder}`} accessibilityState={{ checked: selected, disabled: p.disabled }} disabled={p.disabled} onPress={() => p.onSelectBank(bank.id)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: selected ? '#ED3C50' : '#E4E4EC', borderRadius: 9, backgroundColor: selected ? '#FFF4F6' : 'white', minHeight: 64, paddingHorizontal: 12, paddingVertical: 9, opacity: pressed ? 0.65 : 1 })}>
          <View style={{ width: 38, height: 38, borderRadius: 8, backgroundColor: '#F5F5F9', alignItems: 'center', justifyContent: 'center' }}><Building2 size={24} color="#6A7181" /></View>
          <View style={{ flex: 1, minWidth: 0, gap: 4 }}><Text style={{ color: colors.text, fontSize: 14, fontWeight: '700' }}>{bank.bankName}</Text><Text style={{ color: '#4F5361', fontSize: 11, lineHeight: 17 }}>STK: {bank.accountNumber}  |  Chủ tài khoản: {bank.accountHolder}</Text></View>
          {selected ? <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#E92338', alignItems: 'center', justifyContent: 'center' }}><Check size={14} color="white" /></View> : <Circle size={20} color="#C7CAD6" />}
        </Pressable>;
      })}</View>
      {p.addingBank ? <WithdrawalBankForm busy={p.savingBank} error={p.bankError} onSave={p.onSaveBank} onCancel={p.onCancelBank} /> : <Pressable accessibilityRole="button" accessibilityLabel="Thêm ngân hàng mới" disabled={p.disabled || p.banks.length >= 10} onPress={p.onAddBank} style={({ pressed }) => ({ minHeight: 42, borderWidth: 1, borderStyle: 'dashed', borderColor: '#EF4353', borderRadius: 9, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7, opacity: p.disabled || p.banks.length >= 10 ? 0.4 : pressed ? 0.65 : 1 })}><PlusCircle size={19} color={colors.primary} /><Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>Thêm ngân hàng mới</Text></Pressable>}
    </View>
    <View style={{ borderRadius: 11, padding: 14, backgroundColor: '#FFF2F5', gap: 12 }}>
      <View style={s.heading}><ClipboardList size={21} color={colors.primary} /><Text accessibilityRole="header" aria-level={2} style={s.title}>Tóm tắt yêu cầu</Text></View>
      <View style={s.row}><Text style={s.body}>Số tiền rút</Text><Text style={s.amount}>{withdrawalMoney(p.quote.amount)}</Text></View>
      <View style={s.row}><Text style={s.body}>Phí rút tiền</Text><Text style={s.amount}>{!p.settings ? '—' : p.quote.fee === 0 ? 'Miễn phí' : withdrawalMoney(p.quote.fee)}</Text></View>
      <View style={{ height: 1, backgroundColor: '#E9DCE1' }} />
      <View style={s.row}><Text style={[s.body, { fontWeight: '700' }]}>Số tiền thực nhận</Text><Text style={{ color: colors.primary, fontSize: 20, lineHeight: 26, fontWeight: '800', flexShrink: 1, textAlign: 'right' }}>{p.settings ? withdrawalMoney(p.quote.net) : '—'}</Text></View>
    </View>
    {p.uncertain && <Text accessibilityRole="alert" style={s.note}>Chưa xác định kết quả gửi. Thử lại để kiểm tra cùng yêu cầu; thông tin tạm khóa để tránh tạo yêu cầu trùng.</Text>}
    <Pressable accessibilityRole="button" accessibilityLabel="Gửi yêu cầu rút tiền" accessibilityState={{ disabled: p.submitDisabled, busy: p.submitting }} disabled={p.submitDisabled} onPress={p.onSubmit} style={({ pressed }) => ({ minHeight: 44, borderRadius: 9, backgroundColor: '#E41428', backgroundImage: 'linear-gradient(100deg, #E90818, #DC152C)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, opacity: p.submitDisabled ? 0.4 : pressed ? 0.65 : 1 })}><Send size={19} color="white" /><Text style={{ color: 'white', fontSize: 14, fontWeight: '700' }}>{p.submitting ? 'Đang gửi...' : p.uncertain ? 'Thử lại yêu cầu' : 'Gửi yêu cầu rút tiền'}</Text></Pressable>
  </View>;
}
const s = StyleSheet.create({ heading: { flexDirection: 'row', alignItems: 'center', gap: 9 }, title: { color: colors.text, fontSize: 15, lineHeight: 21, fontWeight: '700' }, small: { color: colors.text, fontSize: 11, lineHeight: 16 }, balance: { color: colors.text, fontSize: 19, lineHeight: 25, fontWeight: '800' }, note: { color: '#707385', fontSize: 11, lineHeight: 17 }, error: { color: '#BE2B3C', fontSize: 12, lineHeight: 18 }, row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, body: { fontSize: 13, lineHeight: 19, color: colors.text, flexShrink: 1 }, amount: { fontSize: 13, lineHeight: 19, color: colors.text, fontWeight: '700', textAlign: 'right', flexShrink: 1 } });
