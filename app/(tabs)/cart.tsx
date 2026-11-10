import { useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Header } from '../../src/components/common/ui';
import { CartView } from '../../src/components/cart/CartView';
import { queryClient, useAuth } from '../../src/stores/auth';
import { useToast } from '../../src/stores/toast';
import { errorMessage, request } from '../../src/services/api';
import { applyCartOperation } from '../../src/services/cart';
import { DESKTOP_HEADER_WIDTH } from '../../src/navigation/tabs';
import { colors, styles as s } from '../../src/theme';
import type { Cart } from '../../src/types/api';

export default function CartScreen() {
  const user = useAuth(state => state.user);
  const showToast = useToast(state => state.show);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const cart = useQuery({ queryKey: ['cart'], queryFn: () => request<Cart>('GET', '/cart'), enabled: !!user });
  const mutation = useMutation({
    mutationFn: applyCartOperation,
    onError: error => showToast(errorMessage(error), 'error'),
    // Wait for fresh server totals after successful or partially failed group updates.
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });
  return <SafeAreaView style={[s.page, { backgroundColor: colors.primary }]} edges={['top', 'left', 'right']}>
    <Header title="Giỏ hàng" />
    <CartView cart={cart.data} guest={!user} loading={!!user && cart.isLoading} error={cart.error} refreshing={cart.isFetching} busy={mutation.isPending}
      bottomInset={width >= DESKTOP_HEADER_WIDTH ? insets.bottom : 0} retry={() => void cart.refetch()} onChange={operation => mutation.mutate(operation)} onCheckout={() => router.push('/checkout')} />
  </SafeAreaView>;
}
