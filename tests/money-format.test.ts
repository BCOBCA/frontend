import { expect, it, vi } from 'vitest';
import { money } from '../src/theme';

vi.mock('react-native', () => ({ StyleSheet: { create: (styles: unknown) => styles } }));

it('shows VND in groups of three digits without a fractional part', () => {
  expect(money(8333.33)).toBe('8.333 VNĐ');
  expect(money(16666.67)).toBe('16.667 VNĐ');
  expect(money(1000000)).toBe('1.000.000 VNĐ');
});
