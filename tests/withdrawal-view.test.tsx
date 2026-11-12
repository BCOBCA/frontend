import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import { WithdrawalRequestView, type WithdrawalRequestViewProps } from '../src/components/affiliate/WithdrawalRequestView';
import { withdrawalQuote } from '../src/components/affiliate/withdrawal';
const state = vi.hoisted(() => ({ actions: {} as Record<string, () => void>, checked: {} as Record<string, boolean>, disabled: {} as Record<string, boolean> }));
vi.mock('react-native', () => ({ View: 'div', Text: 'span', StyleSheet: { create: (v: unknown) => v }, TextInput: () => <input />, Pressable: ({ children, accessibilityLabel, accessibilityState, disabled, onPress }: { children: React.ReactNode; accessibilityLabel: string; accessibilityState?: { checked?: boolean }; disabled?: boolean; onPress: () => void }) => { state.actions[accessibilityLabel] = onPress; state.checked[accessibilityLabel] = !!accessibilityState?.checked; state.disabled[accessibilityLabel] = !!disabled; return <button aria-label={accessibilityLabel} disabled={disabled}>{children}</button>; } }));
vi.mock('lucide-react-native', () => Object.fromEntries(['Building2', 'Check', 'Circle', 'CircleHelp', 'ClipboardList', 'Coins', 'PlusCircle', 'Send', 'Wallet'].map(name => [name, () => null])));
vi.mock('../src/components/affiliate/WithdrawalBankForm', () => ({ WithdrawalBankForm: () => <p>Bank form</p> }));
const wallet = { code: 'CODE', availableBalance: 100000, pendingBalance: 450000, totalReferrals: 0, debtBalance: 0 };
const settings = { feeAmount: 5000, minimumAmount: 50000, maximumAmount: 50000000, revision: 'current' };
function props(): WithdrawalRequestViewProps { return { wallet, settings, amount: '50000', quote: withdrawalQuote('50000', wallet, settings), banks: [{ id: 'own', bankName: 'My Bank', accountNumber: '****6789', accountHolder: 'MY NAME' }], selectedId: 'own', disabled: false, submitDisabled: false, submitting: false, uncertain: false, addingBank: false, savingBank: false, onAmount: vi.fn(), onSelectBank: vi.fn(), onAddBank: vi.fn(), onSaveBank: vi.fn(), onCancelBank: vi.fn(), onSubmit: vi.fn() }; }
beforeEach(() => { state.actions = {}; state.checked = {}; state.disabled = {}; });
it('shows gross, fee and net directly before submit without including pending commissions in the balance', () => {
  const p = props(); const html = renderToStaticMarkup(<WithdrawalRequestView {...p} />);
  for (const text of ['100.000 VNĐ', '50.000 VNĐ', '5.000 VNĐ', '45.000 VNĐ', 'Tóm tắt yêu cầu', 'Số tiền thực nhận']) expect(html).toContain(text);
  expect(html).not.toContain('450.000 VNĐ'); expect(html.indexOf('Tóm tắt yêu cầu')).toBeLessThan(html.indexOf('aria-label="Gửi yêu cầu rút tiền"'));
  state.actions['Gửi yêu cầu rút tiền'](); expect(p.onSubmit).toHaveBeenCalledOnce();
});
it('selects only a returned bank ID and exposes the add-bank action', () => {
  const p = props(); renderToStaticMarkup(<WithdrawalRequestView {...p} />);
  const label = 'My Bank, tài khoản ****6789, MY NAME'; expect(state.checked[label]).toBe(true);
  state.actions[label](); expect(p.onSelectBank).toHaveBeenCalledWith('own'); state.actions['Thêm ngân hàng mới'](); expect(p.onAddBank).toHaveBeenCalledOnce();
});
it('only claims a free fee when the loaded configuration says zero', () => {
  const p = props(); const missing = renderToStaticMarkup(<WithdrawalRequestView {...p} settings={undefined} quote={withdrawalQuote('', wallet)} submitDisabled />);
  expect(missing).not.toContain('Miễn phí'); expect(state.disabled['Gửi yêu cầu rút tiền']).toBe(true);
  const free = { ...settings, feeAmount: 0 }; expect(renderToStaticMarkup(<WithdrawalRequestView {...p} settings={free} quote={withdrawalQuote('50000', wallet, free)} />)).toContain('Miễn phí');
});
