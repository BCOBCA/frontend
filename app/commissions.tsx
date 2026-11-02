import { Text } from 'react-native';
import { DataList } from '../src/components/common/DataList';
import { dateTime, money, styles as s } from '../src/theme';
type Commission = { id: string; commissionRate: number; baseAmount: number; commissionAmount: number; status: string; createdAt: string };
const labels: Record<string, string> = { PENDING: 'Đang chờ duyệt', APPROVED: 'Đã duyệt', REVERSED: 'Đã thu hồi do hoàn tiền' };
export default function Commissions() { return <DataList<Commission> title="Hoa hồng Affiliate" path="/affiliate/commissions" name="commissions" render={item => <><Text style={s.price}>{money(item.commissionAmount)}</Text><Text style={s.body}>Giá trị tính hoa hồng: {money(item.baseAmount)}</Text><Text style={s.small}>Tỷ lệ: {item.commissionRate * 100}% · {labels[item.status] ?? item.status}</Text><Text style={s.small}>{dateTime(item.createdAt)}</Text></>} />; }
