import { expect, it } from 'vitest';
import { parseFeedbackContent, feedbackCreatedAt } from '../src/components/support/feedback-history';

it('extracts ordered attachments and leaves the message clean', () => {
  const parsed = parseFeedbackContent('test bị lỗi ảnh\n\nTệp đính kèm: photo.png\nhttps://example.test/a.png?v=2\n\nTệp đính kèm: hợp đồng.pdf\nhttps://example.test/a.pdf');
  expect(parsed.message).toBe('test bị lỗi ảnh');
  expect(parsed.attachments).toEqual([{ name: 'photo.png', url: 'https://example.test/a.png?v=2', kind: 'image', extension: 'PNG' }, { name: 'hợp đồng.pdf', url: 'https://example.test/a.pdf', kind: 'document', extension: 'PDF' }]);
});
it('supports old URL attachments with query strings and encoded filenames', () => {
  const parsed = parseFeedbackContent('Nội dung\n\nLiên kết minh họa: https://example.test/%E1%BA%A3nh.jpg?download=1');
  expect(parsed.message).toBe('Nội dung'); expect(parsed.attachments[0]).toMatchObject({ name: 'ảnh.jpg', kind: 'image' });
});
it.each(['javascript:alert(1)', 'https://user:password@example.test/a.png', 'file:///private.png', 'not-a-url'])('preserves unsupported attachment text without clickable links: %s', url => {
  const content = `Nội dung\n\nTệp đính kèm: a.png\n${url}`;
  expect(parseFeedbackContent(content)).toEqual({ message: content, attachments: [] });
});
it('does not interpret arbitrary URLs or attachment-like text in the middle of a message', () => {
  const content = 'https://example.test/a.png\n\nTệp đính kèm: a.png\nhttps://example.test/a.png\nCòn nội dung phía sau';
  expect(parseFeedbackContent(content)).toEqual({ message: content, attachments: [] });
});
it('formats time in Vietnam and handles invalid timestamps', () => {
  expect(feedbackCreatedAt('2026-11-12T01:48:00Z')).toEqual({ time: '08:48', date: '12/11/2026' });
  expect(feedbackCreatedAt('invalid')).toEqual({ time: '--:--', date: '--/--/----' });
});
