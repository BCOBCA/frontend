import { beforeEach, describe, expect, it } from 'vitest';
import { useToast } from '../src/stores/toast';

beforeEach(() => useToast.setState({ toast: null }));

describe('screen-level toast feedback', () => {
  it('defaults to success and supports error feedback', () => {
    useToast.getState().show('Đã thêm vào giỏ hàng.');
    expect(useToast.getState().toast).toMatchObject({ message: 'Đã thêm vào giỏ hàng.', tone: 'success' });
    useToast.getState().show('Không thể thêm sản phẩm.', 'error');
    expect(useToast.getState().toast?.tone).toBe('error');
  });
  it('replaces the previous message and ignores its delayed dismissal', () => {
    useToast.getState().show('First'); const first = useToast.getState().toast!;
    useToast.getState().show('Second'); const second = useToast.getState().toast!;
    expect(second.id).toBeGreaterThan(first.id);
    useToast.getState().dismiss(first.id);
    expect(useToast.getState().toast?.message).toBe('Second');
    useToast.getState().dismiss(second.id);
    expect(useToast.getState().toast).toBeNull();
  });
});
