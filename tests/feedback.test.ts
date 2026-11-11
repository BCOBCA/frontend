import { expect, it } from 'vitest';
import { feedbackPayload, feedbackSchema, SUPPORT_EMAIL, SUGGESTION_SUBJECT } from '../src/services/feedback';

it('uses the confirmed support email and maps help versus suggestions correctly', () => {
  expect(SUPPORT_EMAIL).toBe('mxh@baochi.online');
  expect(feedbackPayload({ subject: 'Đơn hàng và thanh toán', content: '  Tôi cần kiểm tra đơn hàng  ', reference: '' })).toEqual({ type: 'SUPPORT', subject: 'Đơn hàng và thanh toán', content: 'Tôi cần kiểm tra đơn hàng' });
  expect(feedbackPayload({ subject: SUGGESTION_SUBJECT, content: 'Góp ý trải nghiệm tìm kiếm', reference: '' }).type).toBe('FEEDBACK');
});
it('includes an optional illustration link in the stored request content', () => {
  const payload = feedbackPayload({ subject: 'Vấn đề khác', content: 'Nội dung mô tả', reference: 'https://example.test/image.png' });
  expect(payload.content).toBe('Nội dung mô tả\n\nLiên kết minh họa: https://example.test/image.png');
});
it('rejects blank/unknown topics, whitespace content, oversized content and non-web links', () => {
  const base = { subject: 'Vấn đề khác', content: 'Nội dung mô tả', reference: '' };
  for (const override of [{ subject: '' }, { subject: 'Unknown' }, { content: '     ' }, { content: 'a'.repeat(1001) }, { reference: 'javascript:alert(1)' }, { reference: 'file:///private' }]) expect(feedbackSchema.safeParse({ ...base, ...override }).success).toBe(false);
});
