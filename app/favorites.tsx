import { useState } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Button, Empty, Page as PageView, Status } from '../src/components/common/ui';
import { FavoritesLoginNotice } from '../src/components/favorites/FavoritesLoginNotice';
import { ProductCard } from '../src/components/product/ProductCard';
import { gridItemWidth } from '../src/components/common/grid-layout';
import { request } from '../src/services/api';
import { useAuth } from '../src/stores/auth';
import type { Page, Product } from '../src/types/api';
import { styles as s } from '../src/theme';
export default function Favorites() {
  const user = useAuth(state => state.user);
  if (!user) return <PageView title="Sản phẩm yêu thích" back><FavoritesLoginNotice /></PageView>;
  return <SavedProducts key={user.id} userId={user.id} />;
}

function SavedProducts({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const [gridWidth, setGridWidth] = useState(0);
  const { width } = useWindowDimensions();
  const columns = width >= 1100 ? 6 : width >= 768 ? 3 : 2;
  const cardWidth = gridItemWidth(gridWidth || Math.min(width, 1180) - 24, columns, 12);
  const query = useQuery({ queryKey: ['favorites', page, userId], queryFn: () => request<Page<Product>>('GET', `/favorites?page=${page}`) });
  return <PageView title="Sản phẩm yêu thích" back><View style={s.padded}>
    <Status loading={query.isLoading} error={query.error} retry={() => void query.refetch()} />
    {query.data?.items.length === 0 && <Empty text="Chưa có sản phẩm yêu thích" />}
    <View onLayout={event => setGridWidth(event.nativeEvent.layout.width)} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {query.data?.items.map(item => <ProductCard key={item.id} item={{ ...item, isFavorite: true }} width={cardWidth} />)}
    </View>
    {query.data && query.data.totalPages > 1 && <View style={s.between}>
      <Button title="Trước" disabled={page === 1} onPress={() => setPage(page - 1)} />
      <Text style={s.body}>{page}/{query.data.totalPages}</Text>
      <Button title="Sau" disabled={page >= query.data.totalPages} onPress={() => setPage(page + 1)} />
    </View>}
  </View></PageView>;
}
