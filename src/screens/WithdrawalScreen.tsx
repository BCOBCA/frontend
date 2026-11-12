import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Button, LoginNotice, Page, Status } from '../components/common/ui';
import { WithdrawalRequestView } from '../components/affiliate/WithdrawalRequestView';
import { createWithdrawalAttempt, withdrawalMoney, withdrawalQuote, withdrawalResultUnknown, type AffiliateBankAccount, type BankDetails, type WithdrawalAttempt, type WithdrawalSettings } from '../components/affiliate/withdrawal';
import { request } from '../services/api';
import { useAuth } from '../stores/auth';
import type { Affiliate } from '../types/api';
import { colors } from '../theme';

export default function WithdrawalScreen() {
  const user = useAuth(state => state.user);
  return <Page title="Yêu cầu rút tiền" back footerTab="member">{user ? <WithdrawalForm key={user.id} userId={user.id} /> : <LoginNotice />}</Page>;
}

export function WithdrawalForm({ userId }: { userId: string }) {
  const client = useQueryClient();
  const [amount, setAmount] = useState('');
  const [bankId, setBankId] = useState('');
  const [addingBank, setAddingBank] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [success, setSuccess] = useState<WithdrawalAttempt | null>(null);
  const attempt = useRef<WithdrawalAttempt | null>(null);
  const submitLock = useRef(false);
  const bankLock = useRef(false);
  const wallet = useQuery({ queryKey: ['affiliate', userId], queryFn: () => request<Affiliate>('GET', '/affiliate') });
  const settings = useQuery({ queryKey: ['withdrawal-settings'], queryFn: () => request<WithdrawalSettings>('GET', '/affiliate/withdrawal-settings') });
  const banks = useQuery({ queryKey: ['affiliate-bank-accounts', userId], queryFn: () => request<AffiliateBankAccount[]>('GET', '/affiliate/bank-accounts') });
  const selected = banks.data?.find(bank => bank.id === bankId) ?? banks.data?.[0];
  const quote = withdrawalQuote(amount, wallet.data, settings.data);
  const refresh = () => { void wallet.refetch(); void settings.refetch(); void banks.refetch(); };
  const saveBank = useMutation({ mutationFn: (value: BankDetails) => request<AffiliateBankAccount>('POST', '/affiliate/bank-accounts', value), retry: false, onSuccess: bank => {
    client.setQueryData<AffiliateBankAccount[]>(['affiliate-bank-accounts', userId], previous => [...(previous ?? []), bank]);
    setBankId(bank.id); setAddingBank(false);
  }, onSettled: () => { bankLock.current = false; } });
  const send = useMutation({ mutationFn: (value: WithdrawalAttempt) => request<{ id: string }>('POST', '/affiliate/withdrawals', value.payload, { 'Idempotency-Key': value.key }), retry: false,
    onSuccess: (_result, value) => {
      setSuccess(value); setUncertain(false);
      for (const name of ['affiliate', 'withdrawals', 'wallet-transactions']) void client.invalidateQueries({ queryKey: [name] });
    }, onError: error => {
      const unknown = withdrawalResultUnknown(error); setUncertain(unknown);
      if (!unknown) { attempt.current = null; refresh(); }
    }, onSettled: () => { submitLock.current = false; },
  });
  const busy = send.isPending || saveBank.isPending;
  const submitDisabled = busy || !!success || (!uncertain && (!!quote.error || !selected || !!wallet.error || !!settings.error || !!banks.error || settings.isFetching || addingBank));
  const submit = () => {
    if (submitLock.current || submitDisabled) return;
    if (!uncertain) {
      if (!selected || !settings.data) return;
      attempt.current = createWithdrawalAttempt({ amount: quote.amount, bankAccountId: selected.id, expectedConfigurationRevision: settings.data.revision }, quote.fee);
    }
    if (!attempt.current) return;
    submitLock.current = true; send.mutate(attempt.current);
  };
  return <View style={{ width: '100%', maxWidth: 760, alignSelf: 'center', padding: 12 }}>
    <View style={{ backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: '#ECECF3', padding: 14, gap: 12 }}>
      <Status loading={wallet.isLoading || settings.isLoading || banks.isLoading} error={wallet.error || settings.error || banks.error} retry={refresh} />
      <Status error={send.error} />
      {success ? <View style={{ gap: 14, padding: 10 }}><Text accessibilityRole="header" style={{ color: colors.text, fontWeight: '700', fontSize: 19 }}>Đã gửi yêu cầu rút tiền</Text><Text style={{ fontSize: 14, lineHeight: 21, color: colors.text }}>Số tiền thực nhận: {withdrawalMoney(success.netAmount)}</Text><Text style={{ fontSize: 12, lineHeight: 19, color: colors.muted }}>Yêu cầu đang chờ xử lý. Tiền chưa được chuyển cho đến khi quản trị viên ghi nhận giao dịch.</Text><Button title="Xem lịch sử rút tiền" onPress={() => router.replace('/withdrawals')} /><Button title="Về Ví Affiliate" outline onPress={() => router.replace('/affiliate')} /></View>
        : <WithdrawalRequestView wallet={wallet.data} settings={settings.data} amount={amount} quote={quote} banks={banks.data ?? []} selectedId={selected?.id ?? ''} disabled={busy || uncertain} submitDisabled={submitDisabled} submitting={send.isPending} uncertain={uncertain} addingBank={addingBank} savingBank={saveBank.isPending} bankError={saveBank.error}
          onAmount={value => { setAmount(value); send.reset(); }} onSelectBank={id => { setBankId(id); send.reset(); }} onAddBank={() => { setAddingBank(true); saveBank.reset(); }} onCancelBank={() => { setAddingBank(false); saveBank.reset(); }} onSaveBank={value => { if (!bankLock.current) { bankLock.current = true; saveBank.mutate(value); } }} onSubmit={submit} />}
    </View>
  </View>;
}
