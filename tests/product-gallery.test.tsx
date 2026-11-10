import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { ProductGallery } from '../src/components/product/ProductGallery';

vi.mock('react-native', () => {
  const Container = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  return { View: Container, Text: Container, ScrollView: Container, Pressable: ({ children, accessibilityLabel, disabled }: { children?: React.ReactNode; accessibilityLabel: string; disabled?: boolean }) => <button aria-label={accessibilityLabel} disabled={disabled}>{children}</button> };
});
vi.mock('expo-image', () => ({ Image: ({ source, accessibilityLabel }: { source: { uri: string }; accessibilityLabel: string }) => <img src={source.uri} alt={accessibilityLabel} /> }));
vi.mock('lucide-react-native', () => ({ ChevronLeft: () => null, ChevronRight: () => null, Package: () => null, Maximize2: () => null, X: () => null }));
vi.mock('../src/theme', () => ({ colors: {} }));

describe('product image gallery', () => {
  it('makes every image discoverable through thumbnails and navigation', () => {
    const urls = Array.from({ length: 5 }, (_, i) => `https://example.test/${i}.webp`);
    const html = renderToStaticMarkup(<ProductGallery name="iPhone X" imageUrl={urls[0]} imageUrls={urls} />);
    for (let i = 1; i <= 5; i++) expect(html).toContain(`Xem ảnh ${i} của iPhone X`);
    expect(html).toContain('Ảnh tiếp theo');
    expect(html).toContain('Ảnh trước');
    expect(html).toContain('1 / 5');
  });
  it('keeps a single-image fallback without misleading navigation', () => {
    const html = renderToStaticMarkup(<ProductGallery name="Sản phẩm" imageUrl="https://example.test/one.webp" imageUrls={[]} />);
    expect(html).toContain('https://example.test/one.webp');
    expect(html).not.toContain('Ảnh tiếp theo');
  });
  it('handles missing images and deduplicates the primary image', () => {
    expect(renderToStaticMarkup(<ProductGallery name="Chưa có ảnh" />)).toContain('Chưa có ảnh sản phẩm');
    const html = renderToStaticMarkup(<ProductGallery name="Sản phẩm" imageUrl="one" imageUrls={['one', 'one', 'two']} />);
    expect(html).toContain('1 / 2');
    expect(html).not.toContain('Xem ảnh 3');
  });
});
