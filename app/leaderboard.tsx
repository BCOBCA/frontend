import { Text } from 'react-native';
import { DataList } from '../src/components/common/DataList';
import { styles as s } from '../src/theme';
type Entry = { id: string; displayName: string; referrals: number; rank: number; tier?: string; commissionRate?: number };
export default function Leaderboard() { return <DataList<Entry> title="Bảng xếp hạng giới thiệu" path="/affiliate/leaderboard" name="leaderboard" render={item => <><Text style={s.title}>#{item.rank} · {item.displayName}</Text><Text style={s.body}>{item.referrals} lượt giới thiệu thành công</Text>{item.tier && <Text style={s.small}>{item.tier} · Hoa hồng {((item.commissionRate ?? 0) * 100).toLocaleString('vi-VN')}%</Text>}</>} />; }
