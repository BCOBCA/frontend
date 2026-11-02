import { Text } from 'react-native';
import { DataList } from '../src/components/common/DataList';
import type { Referral } from '../src/types/api';
import { dateTime, styles as s } from '../src/theme';
export default function Referrals() { return <DataList<Referral> title="Người được giới thiệu" path="/affiliate/referrals" name="referrals" render={item => <><Text style={s.body}>{item.fullName}</Text><Text style={s.small}>{item.status === 'QUALIFIED' ? 'Đã đủ điều kiện' : 'Chờ đủ điều kiện'} · {dateTime(item.createdAt)}</Text></>} />; }
