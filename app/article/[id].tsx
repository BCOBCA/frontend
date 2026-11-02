import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import { Page, Status } from '../../src/components/common/ui';
import { request } from '../../src/services/api';
import type { Article } from '../../src/types/api';
import { dateTime, styles as s } from '../../src/theme';
export default function ArticleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useQuery({ queryKey: ['article', id], queryFn: () => request<Article>('GET', `/articles/${id}`) });
  return <Page title="Tin tức" back><View style={s.padded}><Status loading={query.isLoading} error={query.error} retry={() => void query.refetch()} />{query.data && <><Text style={s.title}>{query.data.title}</Text>{query.data.publishedAt && <Text style={s.small}>{dateTime(query.data.publishedAt)}</Text>}{query.data.thumbnailUrl && <Image source={{ uri: query.data.thumbnailUrl }} style={{ width: '100%', height: 220 }} contentFit="cover" />}<Text style={s.body}>{query.data.content}</Text></>}</View></Page>;
}
