import { View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Field, Status } from '../common/ui';
import { bankDetailsSchema, type BankDetails } from './withdrawal';

export function WithdrawalBankForm({ busy, error, onSave, onCancel }: { busy: boolean; error?: unknown; onSave: (value: BankDetails) => void; onCancel: () => void }) {
  const form = useForm<BankDetails>({ resolver: zodResolver(bankDetailsSchema), defaultValues: { bankName: '', accountNumber: '', accountHolder: '' } });
  return <View style={{ borderWidth: 1, borderColor: '#F0DCE0', borderRadius: 10, padding: 12, gap: 12, backgroundColor: '#FFFAFB' }}>
    {([{ name: 'bankName', label: 'Tên ngân hàng' }, { name: 'accountNumber', label: 'Số tài khoản' }, { name: 'accountHolder', label: 'Tên chủ tài khoản' }] as const).map(({ name, label }) => <Controller key={name} name={name} control={form.control} render={({ field }) => <Field label={label} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} editable={!busy} maxLength={name === 'accountNumber' ? 34 : 150} autoCorrect={false} keyboardType={name === 'accountNumber' ? 'number-pad' : 'default'} error={form.formState.errors[name]?.message} />} />)}
    <Status error={error} />
    <View style={{ flexDirection: 'row', gap: 10 }}><View style={{ flex: 1 }}><Button title="Hủy" outline disabled={busy} onPress={onCancel} /></View><View style={{ flex: 1 }}><Button title={busy ? 'Đang lưu...' : 'Lưu ngân hàng'} disabled={busy} onPress={() => void form.handleSubmit(onSave)()} /></View></View>
  </View>;
}
