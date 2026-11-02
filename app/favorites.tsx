import { Text } from 'react-native';
import { router } from 'expo-router';
import { DataList } from '../src/components/common/DataList';
import { Button } from '../src/components/common/ui';
import type { Product } from '../src/types/api';
import { money, styles as s } from '../src/theme';
export default function Favorites() { return <DataList<Product> title="Sản phẩm yêu thích" path="/favorites" name="favorites" render={item => <><Text style={s.body}>{item.name}</Text>{item.price !== null && <Text style={s.price}>{money(item.salePrice ?? item.price)}</Text>}<Button title="Xem sản phẩm" outline onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })} /></>} />; }
