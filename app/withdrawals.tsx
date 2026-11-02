import { Text } from 'react-native';
import { DataList } from '../src/components/common/DataList';
import { dateTime, money, styles as s } from '../src/theme';
type Withdrawal = { id: string; amount: number; bankName: string; accountNumber: string; status: string; transactionReference: string; requestedAt: string };
const labels: Record<string, string> = { PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt, chờ chuyển tiền', PAID: 'Đã chi', REJECTED: 'Đã từ chối và hoàn số dư' };
export default function Withdrawals() { return <DataList<Withdrawal> title="Lịch sử rút tiền" path="/affiliate/withdrawals" name="withdrawals" render={item => <><Text style={s.price}>{money(item.amount)}</Text><Text style={s.body}>{item.bankName} · {item.accountNumber}</Text><Text style={s.body}>{labels[item.status] ?? item.status}</Text><Text style={s.small}>{dateTime(item.requestedAt)}</Text>{item.transactionReference && <Text style={s.small}>Mã chuyển tiền: {item.transactionReference}</Text>}</>} />; }
