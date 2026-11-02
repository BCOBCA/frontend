import { Text } from 'react-native';
import { DataList } from '../src/components/common/DataList';
import type { Point } from '../src/types/api';
import { dateTime, styles as s } from '../src/theme';
export default function Points() { return <DataList<Point> title="Lịch sử điểm" path="/membership/points" name="points" render={item => <><Text style={s.body}>{item.description}</Text><Text style={s.price}>{item.points > 0 ? '+' : ''}{item.points} điểm</Text><Text style={s.small}>{item.type === 'DEBT_CREDIT' || item.type === 'DEBT_DEBIT' ? 'Điểm cần thu hồi' : 'Số dư'}: {item.balanceAfter} · {dateTime(item.createdAt)}</Text></>} />; }
