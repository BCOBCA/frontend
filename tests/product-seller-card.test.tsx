import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductSellerCard } from '../src/components/product/ProductSellerCard';

const state = vi.hoisted(() => ({ verified: false, following: false, count: 0 as number | undefined, ready: true, pending: false }));
vi.mock('react-native', () => {
  const Box = ({ children, accessibilityLabel, disabled }: { children?: React.ReactNode; accessibilityLabel?: string; disabled?: boolean }) => <div aria-label={accessibilityLabel} aria-disabled={disabled}>{children}</div>;
  return { View: Box, Text: Box, Pressable: Box, Image: () => null };
});
vi.mock('expo-router', () => ({ router: { push: vi.fn() }, Link: () => null }));
vi.mock('lucide-react-native', () => Object.fromEntries(['BadgeCheck', 'Check', 'MapPin', 'Store', 'Users', 'ShieldCheck', 'Star'].map(name => [name, () => null])));
vi.mock('../src/theme', () => ({ colors: { primary: '#E53935', surface: '#FFF', border: '#EEE', text: '#111', muted: '#777' } }));
vi.mock('../src/stores/auth', () => ({ useAuth: () => undefined }));
vi.mock('../src/services/api', () => ({ request: vi.fn(), errorMessage: () => 'Error' }));
vi.mock('../src/services/dealers', () => ({ getDealer: vi.fn(), followDealer: vi.fn() }));
vi.mock('../src/components/common/ui', () => ({ Status: () => null }));
vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ queryKey }: { queryKey: string[] }) => ({ data: queryKey[0] === 'dealer' ? state.ready ? { dealer: { id: 'store-1', name: 'Cửa hàng thực tế', logoUrl: '', slug: 'store-1', isVerified: state.verified, isFollowing: state.following } } : undefined : state.count === undefined ? undefined : { totalItems: state.count }, error: null }),
  useMutation: () => ({ isPending: state.pending, error: null }),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));
const seller = { id: 'store-1', name: 'Cửa hàng thực tế', slug: 'store-1', logoUrl: '', description: 'Store description', phone: null };

describe('product seller reference card', () => {
  beforeEach(() => { state.verified = false; state.following = false; state.count = 0; state.ready = true; state.pending = false; });
  it('shows real store identity, zero products and actions without join date or invented ratings', () => {
    const html = renderToStaticMarkup(<ProductSellerCard seller={seller} />);
    expect(html).toContain('Cửa hàng thực tế');
    expect(html).toContain('Xem gian hàng');
    expect(html).toContain('Theo dõi');
    expect(html).toContain('Chưa có');
    expect(html).toContain('>0<');
    expect(html).not.toContain('Tham gia');
    expect(html).not.toContain('chính hãng');
    expect(html).not.toContain('đã xác minh');
  });
  it('only shows verification from dealer data and renders the actual catalog count', () => {
    state.verified = true; state.count = 320;
    const html = renderToStaticMarkup(<ProductSellerCard seller={seller} />);
    expect(html).toContain('Cửa hàng đã xác minh');
    expect(html).toContain('>320<');
  });
  it('preserves the followed and pending states of the shared follow action', () => {
    state.following = true;
    expect(renderToStaticMarkup(<ProductSellerCard seller={seller} />)).toContain('Đang theo dõi');
    state.pending = true;
    const html = renderToStaticMarkup(<ProductSellerCard seller={seller} />);
    expect(html).toContain('Đang xử lý');
    expect(html).toContain('aria-disabled="true"');
  });
  it('does not invent a zero product count while queries are loading', () => {
    state.ready = false; state.count = undefined;
    const html = renderToStaticMarkup(<ProductSellerCard seller={seller} />);
    expect(html).toContain('—');
    expect(html).not.toContain('>0<');
  });
});
