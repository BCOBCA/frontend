import { Text } from 'react-native';
import { DataList } from '../src/components/common/DataList';
import { dateTime, money, styles as s } from '../src/theme';
type Refund = { id: string; orderId: string; amount: number; reason: string; status: string; providerRefundCode: string; createdAt: string };
const labels: Record<string, string> = { PENDING: 'Chờ kiểm tra', APPROVED: 'Đã duyệt, chờ hoàn tiền', COMPLETED: 'Đã hoàn tiền', REJECTED: 'Đã từ chối' };
export default function Refunds() { return <DataList<Refund> title="Lịch sử hoàn tiền" path="/refunds" name="refunds" render={item => <><Text style={s.price}>{money(item.amount)}</Text><Text style={s.body}>{labels[item.status] ?? item.status}</Text><Text style={s.body}>{item.reason}</Text><Text style={s.small}>{dateTime(item.createdAt)}</Text>{item.providerRefundCode && <Text style={s.small}>Mã xác nhận: {item.providerRefundCode}</Text>}</>} />; }
