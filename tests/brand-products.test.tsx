import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import BrandDetail from '../app/brand/[id]';

vi.mock('react-native', () => {
  const Container = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  return { View: Container, Text: Container, Pressable: Container, useWindowDimensions: () => ({ width: 390 }) };
});
vi.mock('expo-router', () => ({ useLocalSearchParams: () => ({ id: 'brand1' }) }));
vi.mock('expo-image', () => ({ Image: () => null }));
vi.mock('../src/components/common/ui', () => ({ Page: ({ children }: { children?: React.ReactNode }) => <main>{children}</main>, Empty: () => null, Status: () => null }));
vi.mock('../src/components/product/ProductCard', () => ({ ProductCard: ({ item, width }: { item: { name: string; isService: boolean }; width: number }) => <article data-width={width} data-service={item.isService}>{item.name}</article> }));
vi.mock('../src/services/api', () => ({ request: vi.fn() }));
vi.mock('../src/theme', () => ({ styles: {}, money: (value: number) => String(value) }));
vi.mock('@tanstack/react-query', () => ({ useQuery: ({ queryKey }: { queryKey: string[] }) => ({
  data: queryKey[0] === 'brand' ? { name: 'Brand' } : { items: [{ id: 'same-id', name: queryKey[0], isService: queryKey[0] === 'brand-services' }], totalItems: 1 },
}) }));

describe('brand product listings', () => {
  it('renders products and services with the shared dealer card at mobile width', () => {
    const html = renderToStaticMarkup(<BrandDetail />);
    expect(html.match(/<article/g)).toHaveLength(2);
    expect(html).toContain('data-service="false"');
    expect(html).toContain('data-service="true"');
    const widths = [...html.matchAll(/data-width="(\d+)"/g)].map(match => Number(match[1]));
    expect(widths).toHaveLength(2);
    expect(widths[0] + widths[1] + 12).toBeLessThanOrEqual(390 - 24);
  });
});
