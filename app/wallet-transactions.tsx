import { Text } from 'react-native';
import { DataList } from '../src/components/common/DataList';
import { dateTime, money, styles as s } from '../src/theme';
type Transaction = { id: string; type: string; amount: number; balanceAfter: number; referenceType: string; createdAt: string };
const labels: Record<string, string> = { PENDING_CREDIT: 'Hoa hồng chờ duyệt', PENDING_DEBIT: 'Chuyển khỏi số dư chờ duyệt', CREDIT: 'Cộng số dư khả dụng', DEBIT: 'Giảm số dư khả dụng', DEBT_CREDIT: 'Hoa hồng cần thu hồi', DEBT_DEBIT: 'Giảm khoản cần thu hồi', RECOVERY_DEBIT: 'Cấn trừ hoa hồng đã thu hồi' };
export default function WalletTransactions() { return <DataList<Transaction> title="Lịch sử ví Affiliate" path="/affiliate/transactions" name="wallet-transactions" render={item => <><Text style={s.body}>{labels[item.type] ?? item.type}</Text><Text style={s.price}>{money(item.amount)}</Text><Text style={s.small}>{item.type.startsWith('PENDING_') ? 'Số dư chờ duyệt' : item.type.startsWith('DEBT_') ? 'Khoản cần thu hồi' : 'Số dư khả dụng'} sau giao dịch: {money(item.balanceAfter)}</Text><Text style={s.small}>{dateTime(item.createdAt)}</Text></>} />; }
