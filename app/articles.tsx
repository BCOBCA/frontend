import { Text } from 'react-native';
import { router } from 'expo-router';
import { DataList } from '../src/components/common/DataList';
import { Button } from '../src/components/common/ui';
import type { Article } from '../src/types/api';
import { styles as s } from '../src/theme';
export default function Articles() { return <DataList<Article> title="Tin tức" path="/articles" name="articles" publicAccess render={item => <><Text style={s.title}>{item.title}</Text><Text style={s.body}>{item.summary}</Text><Button title="Đọc bài viết" outline onPress={() => router.push({ pathname: '/article/[id]', params: { id: item.id } })} /></>} />; }
