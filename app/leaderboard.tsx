import { Text } from 'react-native';
import { DataList } from '../src/components/common/DataList';
import { styles as s } from '../src/theme';
type Entry = { id: string; displayName: string; referrals: number; rank: number };
export default function Leaderboard() { return <DataList<Entry> title="Bảng xếp hạng giới thiệu" path="/affiliate/leaderboard" name="leaderboard" render={item => <><Text style={s.title}>#{item.rank} · {item.displayName}</Text><Text style={s.body}>{item.referrals} lượt giới thiệu</Text></>} />; }
