import { Text } from 'react-native';
import { DataList } from '../src/components/common/DataList';
import { dateTime, styles as s } from '../src/theme';
import { withdrawalMoney } from '../src/components/affiliate/withdrawal';
type Withdrawal = { id: string; amount: number; feeAmount?: number; netAmount?: number; bankName: string; accountNumber: string; status: string; transactionReference: string; requestedAt: string };
const labels: Record<string, string> = { PENDING: 'Chờ duyệt', APPROVED: 'Đã duyệt, chờ chuyển tiền', PAID: 'Đã chi', REJECTED: 'Đã từ chối và hoàn số dư' };
export default function Withdrawals() { return <DataList<Withdrawal> title="Lịch sử rút tiền" path="/affiliate/withdrawals" name="withdrawals" render={item => <><Text style={s.price}>{withdrawalMoney(item.amount)}</Text><Text style={s.small}>Phí rút tiền: {item.feeAmount == null ? '—' : item.feeAmount === 0 ? 'Miễn phí' : withdrawalMoney(item.feeAmount)}</Text><Text style={s.body}>Số tiền thực nhận: {item.netAmount == null ? '—' : withdrawalMoney(item.netAmount)}</Text><Text style={s.body}>{item.bankName} · {item.accountNumber}</Text><Text style={s.body}>{labels[item.status] ?? item.status}</Text><Text style={s.small}>{dateTime(item.requestedAt)}</Text>{item.transactionReference && <Text style={s.small}>Mã chuyển tiền: {item.transactionReference}</Text>}</>} />; }
