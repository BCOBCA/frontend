import { useState, type ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Button, Empty, LoginNotice, Page as PageView, Status } from './ui';
import { request } from '../../services/api';
import type { Page } from '../../types/api';
import { useAuth } from '../../stores/auth';
import { styles as s } from '../../theme';

export function DataList<T extends { id: string }>({ title, path, name, render, publicAccess = false }: { title: string; path: string; name: string; render: (item: T) => ReactNode; publicAccess?: boolean }) {
  const [page, setPage] = useState(1); const user = useAuth(state => state.user);
  const query = useQuery({ queryKey: [name, page], queryFn: () => request<Page<T>>('GET', `${path}${path.includes('?') ? '&' : '?'}page=${page}`), enabled: publicAccess || !!user });
  return <PageView title={title} back>{!publicAccess && !user ? <LoginNotice /> : <View style={s.padded}><Status loading={query.isLoading} error={query.error} retry={() => void query.refetch()} />{query.data?.items.length === 0 && <Empty text="Chưa có dữ liệu" />}{query.data?.items.map(item => <View key={item.id} style={s.card}>{render(item)}</View>)}
    {query.data && query.data.totalPages > 1 && <View style={s.between}><Button title="Trước" disabled={page === 1} onPress={() => setPage(page - 1)} /><Text style={s.body}>{page}/{query.data.totalPages}</Text><Button title="Sau" disabled={page >= query.data.totalPages} onPress={() => setPage(page + 1)} /></View>}
  </View>}</PageView>;
}
