import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductVariantSelector } from '../src/components/product/ProductVariantSelector';
import type { Variant } from '../src/types/api';

const actions = vi.hoisted(() => new Map<string, () => void>());
vi.mock('react-native', () => {
  const Container = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  return { View: Container, Text: Container, Pressable: ({ children, accessibilityLabel, accessibilityState, disabled, onPress }: { children?: React.ReactNode; accessibilityLabel: string; accessibilityState: { checked: boolean }; disabled: boolean; onPress: () => void }) => {
    if (!disabled) actions.set(accessibilityLabel, onPress);
    return <button aria-label={accessibilityLabel} aria-checked={accessibilityState.checked} disabled={disabled}>{children}</button>;
  } };
});
vi.mock('../src/theme', () => ({ colors: {}, styles: {} }));
const base = { price: 100, salePrice: null, availableStock: 2, sku: 'SKU' };
const variants: Variant[] = [
  { ...base, id: 'black128', name: 'Đen / 128 GB', attributes: { color: 'Đen', storage: '128 GB' }, isSample: true },
  { ...base, id: 'silver256', name: 'Bạc / 256 GB', attributes: { color: 'Bạc', storage: '256 GB' } },
  { ...base, id: 'red128', name: 'Đỏ / 128 GB', attributes: { color: 'Đỏ', storage: '128 GB' }, availableStock: 0 },
];
beforeEach(() => actions.clear());

describe('product variant selector', () => {
  it('selects a real available combination and disables sold-out colors', () => {
    const onSelect = vi.fn();
    const html = renderToStaticMarkup(<ProductVariantSelector variants={variants} selected={variants[0]} onSelect={onSelect} />);
    expect(html).toContain('Màu sắc: Đen');
    expect(html).toContain('Dung lượng: 128 GB');
    expect(html).not.toContain('dữ liệu mẫu');
    expect(html).toContain('aria-label="Màu sắc: Đen" aria-checked="true"');
    actions.get('Màu sắc: Bạc')!();
    expect(onSelect).toHaveBeenCalledWith('silver256');
    expect(actions.has('Màu sắc: Đỏ')).toBe(false);
  });
  it('renders size options for clothing', () => {
    const shirt = { ...variants[0], attributes: { color: 'Đen', size: 'M' } };
    expect(renderToStaticMarkup(<ProductVariantSelector variants={[shirt]} selected={shirt} onSelect={vi.fn()} />)).toContain('Kích thước: M');
  });
  it('keeps a flat selector for legacy variants and handles an empty catalog', () => {
    const legacy = { ...variants[0], name: 'Phiên bản cũ', attributes: undefined, availableStock: 0 };
    const html = renderToStaticMarkup(<ProductVariantSelector variants={[legacy]} selected={legacy} onSelect={vi.fn()} />);
    expect(html).toContain('Phiên bản cũ');
    expect(actions.size).toBe(0);
    expect(renderToStaticMarkup(<ProductVariantSelector variants={[]} onSelect={vi.fn()} />)).toContain('Chưa có phiên bản');
  });
});
