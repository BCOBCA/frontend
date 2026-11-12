import { withdrawalMoney } from './withdrawal';

export type WalletHistoryTab = 'ledger' | 'withdrawals';
export type WalletHistoryFilter = { tab: WalletHistoryTab; period: string; kind: string; search: string; page: number };
export type WalletHistoryEntry = { id: string; type: string; amount: number; balanceAfter: number; referenceType: string; referenceId: string; createdAt: string; referenceCode?: string; status?: string };
export type WithdrawalHistoryEntry = { id: string; amount: number; feeAmount?: number; netAmount?: number; balanceAfter?: number | null; bankName: string; accountNumber: string; status: string; transactionReference: string; requestedAt: string };
export type WalletHistoryRow = { id: string; date: string; title: string; caption?: string; code: string; amount: number; balance: number | null; balanceLabel?: string; status: string; tone: 'success' | 'pending' | 'danger' | 'neutral'; negative: boolean; icon: 'commission' | 'withdrawal' | 'adjustment'; fee?: number; net?: number };
export const historyPeriods = [{ value: 'all', label: 'Tất cả thời gian' }, { value: 'today', label: 'Hôm nay' }, { value: 'week', label: 'Tuần này' }, { value: 'month', label: 'Tháng này' }, { value: 'quarter', label: 'Quý này' }];
export const ledgerKinds = [{ value: 'all', label: 'Tất cả' }, { value: 'commission', label: 'Hoa hồng sản phẩm' }, { value: 'withdrawal', label: 'Rút / hoàn tiền rút' }, { value: 'refund', label: 'Thu hồi / cấn trừ' }, { value: 'other', label: 'Giao dịch khác' }];
export const withdrawalKinds = [{ value: 'all', label: 'Tất cả' }, { value: 'PENDING', label: 'Chờ duyệt' }, { value: 'APPROVED', label: 'Đang xử lý' }, { value: 'PAID', label: 'Đã chi' }, { value: 'REJECTED', label: 'Đã từ chối' }];

export function walletHistoryPath(filter: WalletHistoryFilter) {
  const params = new URLSearchParams({ page: String(filter.page), pageSize: '6', period: filter.period });
  if (filter.kind !== 'all') params.set(filter.tab === 'ledger' ? 'transactionType' : 'status', filter.kind);
  if (filter.search.trim()) params.set('search', filter.search.trim().slice(0, 200));
  return `/affiliate/${filter.tab === 'ledger' ? 'transactions' : 'withdrawals'}?${params}`;
}

function referenceCode(value: string) {
  const code = /^[a-f\d]{8}-[a-f\d]{4}-/i.test(value) ? value.slice(0, 8).toUpperCase() : value;
  return code.startsWith('#') ? code : `#${code}`;
}
function status(value: string, withdrawal = false): Pick<WalletHistoryRow, 'status' | 'tone'> {
  if (value === 'PENDING') return { status: 'Chờ duyệt', tone: 'pending' };
  if (value === 'APPROVED') return withdrawal ? { status: 'Đang xử lý', tone: 'pending' } : { status: 'Thành công', tone: 'success' };
  if (value === 'PAID' || value === 'POSTED') return { status: withdrawal && value === 'PAID' ? 'Đã chi' : 'Thành công', tone: 'success' };
  if (value === 'REVERSED') return { status: 'Đã thu hồi', tone: 'danger' };
  if (value === 'REJECTED') return { status: 'Đã từ chối', tone: 'danger' };
  return { status: value || '—', tone: 'neutral' };
}

export function walletHistoryRow(entry: WalletHistoryEntry): WalletHistoryRow {
  const title = entry.type === 'PENDING_CREDIT' ? 'Hoa hồng chờ duyệt' : entry.type === 'PENDING_DEBIT' ? 'Chuyển khỏi số dư chờ duyệt'
    : entry.type === 'DEBT_CREDIT' ? 'Hoa hồng cần thu hồi' : entry.type === 'DEBT_DEBIT' ? 'Giảm khoản cần thu hồi'
      : entry.type === 'RECOVERY_DEBIT' ? 'Cấn trừ hoa hồng' : entry.referenceType === 'Withdrawal' ? entry.amount > 0 ? 'Hoàn tiền rút' : 'Giữ tiền rút'
        : entry.referenceType === 'Refund' ? 'Thu hồi hoa hồng' : entry.referenceType === 'Commission' ? 'Hoa hồng sản phẩm' : entry.amount > 0 ? 'Cộng số dư' : 'Điều chỉnh số dư';
  const negative = entry.type.startsWith('DEBT_') ? entry.amount > 0 : entry.amount < 0;
  return { id: entry.id, date: entry.createdAt, title, code: referenceCode(entry.referenceCode || entry.referenceId || entry.id), amount: entry.amount, balance: entry.balanceAfter,
    balanceLabel: entry.type.startsWith('PENDING_') ? 'Chờ duyệt' : entry.type.startsWith('DEBT_') ? 'Cần thu hồi' : undefined,
    ...status(entry.status ?? (entry.type === 'PENDING_CREDIT' ? 'PENDING' : 'POSTED')), negative,
    icon: entry.referenceType === 'Commission' ? 'commission' : entry.referenceType === 'Withdrawal' ? 'withdrawal' : 'adjustment' };
}

export function withdrawalHistoryRow(entry: WithdrawalHistoryEntry): WalletHistoryRow {
  return { id: entry.id, date: entry.requestedAt, title: entry.bankName, caption: entry.accountNumber, code: referenceCode(entry.transactionReference || entry.id), amount: -entry.amount, balance: entry.balanceAfter ?? null,
    ...status(entry.status, true), negative: true, icon: 'withdrawal', fee: entry.feeAmount, net: entry.netAmount };
}

export function signedHistoryMoney(amount: number) { return `${amount > 0 ? '+' : ''}${withdrawalMoney(amount)}`; }
export function formatHistoryDate(value: string) {
  const date = new Date(value);
  const day = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' }).format(date);
  const time = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' }).format(date);
  return `${day} ${time}`;
}
export function historyPages(page: number, totalPages: number): (number | '…')[] {
  const pages = [...new Set([1, ...Array.from({ length: 5 }, (_, index) => page - 2 + index), totalPages])].filter(value => value > 0 && value <= totalPages).sort((a, b) => a - b);
  return pages.flatMap((value, index) => index > 0 && value - pages[index - 1] > 1 ? ['…' as const, value] : [value]);
}
