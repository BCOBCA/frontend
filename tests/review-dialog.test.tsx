import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, expect, it, vi } from 'vitest';
import { ReviewDialog } from '../src/components/orders/ReviewDialog';

const state = vi.hoisted(() => ({ close: undefined as undefined | (() => void), actions: {} as Record<string, () => void>, form: undefined as undefined | { itemId: string; onBusyChange: (busy: boolean) => void; onSaved: () => void } }));
vi.mock('react-native', () => {
  const Box = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  return { Platform: { OS: 'web' }, View: Box, Text: Box, KeyboardAvoidingView: Box, ScrollView: Box,
    Modal: ({ children, onRequestClose }: { children: React.ReactNode; onRequestClose: () => void }) => { state.close = onRequestClose; return <section role="dialog">{children}</section>; },
    Pressable: ({ children, accessibilityLabel, disabled, onPress }: { children: React.ReactNode; accessibilityLabel: string; disabled?: boolean; onPress: () => void }) => { if (!disabled) state.actions[accessibilityLabel] = onPress; return <button disabled={disabled}>{children}</button>; },
  };
});
vi.mock('lucide-react-native', () => ({ X: () => null }));
vi.mock('../src/theme', () => ({ colors: {} }));
vi.mock('../src/components/orders/ReviewForm', () => ({ ReviewForm: (props: NonNullable<typeof state.form>) => { state.form = props; return <textarea aria-label="Nội dung đánh giá" />; } }));
const items = [{ id: 'first', productName: 'Kẹp tóc', quantity: 1, unitPrice: 20000, totalPrice: 20000 }, { id: 'second', productName: 'Áo thun', variantName: 'M', quantity: 1, unitPrice: 100000, totalPrice: 100000 }];
beforeEach(() => { state.actions = {}; state.close = undefined; state.form = undefined; });
it('opens the single-item editor in a modal without nested buttons', () => {
  const html = renderToStaticMarkup(<ReviewDialog items={[items[0]]} onDismiss={vi.fn()} />);
  expect(html).toContain('role="dialog"'); expect(html).toContain('Nội dung đánh giá'); expect(state.form?.itemId).toBe('first');
  let depth = 0; for (const [tag] of html.matchAll(/<\/?button\b[^>]*>/g)) { depth += tag.startsWith('</') ? -1 : 1; expect(depth).toBeLessThanOrEqual(1); }
});
it('lets buyers choose among multiple order items and honors the selected detail item', () => {
  const html = renderToStaticMarkup(<ReviewDialog items={items} onDismiss={vi.fn()} />);
  expect(html).toContain('Chọn sản phẩm'); expect(html).toContain('Áo thun'); expect(state.form).toBeUndefined();
  renderToStaticMarkup(<ReviewDialog items={items} initialItemId="second" onDismiss={vi.fn()} />);
  expect(state.form?.itemId).toBe('second');
});
it('labels reviewed products as viewing while preserving the first-review option for others', () => {
  const reviewed = { ...items[0], hasReview: true };
  expect(renderToStaticMarkup(<ReviewDialog items={[reviewed]} onDismiss={vi.fn()} />)).toContain('Xem đánh giá');
  expect(renderToStaticMarkup(<ReviewDialog items={[reviewed, items[1]]} initialItemId="second" onDismiss={vi.fn()} />)).toContain('Đánh giá sản phẩm');
});
it('guards backdrop/system/close while saving, then closes after successful save', () => {
  const dismiss = vi.fn();
  renderToStaticMarkup(<ReviewDialog items={[items[0]]} onDismiss={dismiss} />);
  state.form!.onBusyChange(true);
  state.actions['Đóng đánh giá'](); state.actions['Đóng popup đánh giá'](); state.close!();
  expect(dismiss).not.toHaveBeenCalled();
  state.form!.onBusyChange(false); state.close!(); expect(dismiss).toHaveBeenCalledOnce();
  state.form!.onSaved(); expect(dismiss).toHaveBeenCalledTimes(2);
});
