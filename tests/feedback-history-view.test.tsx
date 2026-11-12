import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';
import { FeedbackHistoryCard } from '../src/components/support/FeedbackHistoryCard';
import { FeedbackHistoryView } from '../src/components/support/FeedbackHistoryView';
const state = vi.hoisted(() => ({ width: 1200, actions: {} as Record<string, () => void> }));
vi.mock('react-native', () => ({ View: 'div', Text: 'span', StyleSheet: { create: (s: unknown) => s }, useWindowDimensions: () => ({ width: state.width }), Image: ({ source, accessibilityLabel }: { source: { uri: string }; accessibilityLabel: string }) => <img src={source.uri} alt={accessibilityLabel} />, Pressable: ({ accessibilityLabel, onPress, children }: { accessibilityLabel: string; onPress: () => void; children: React.ReactNode }) => { state.actions[accessibilityLabel] = onPress; return <button aria-label={accessibilityLabel}>{children}</button>; } }));
vi.mock('lucide-react-native', () => Object.fromEntries(['MessageSquareText', 'Tag', 'ShoppingBag', 'UserRound', 'Users', 'CircleHelp', 'Clock3', 'CircleCheck', 'ChevronRight', 'ChevronDown', 'FileText', 'FileSpreadsheet', 'ImageOff', 'ExternalLink', 'Inbox', 'SearchX', 'ArrowLeft', 'ArrowRight'].map(name => [name, () => <i>{name}</i>])));
const item = { id: 'one', subject: 'Góp ý nâng cấp', content: 'test bị lỗi ảnh\n\nTệp đính kèm: one.png\nhttps://example.test/one.png\n\nTệp đính kèm: two.jpg\nhttps://example.test/two.jpg\n\nTệp đính kèm: three.png\nhttps://example.test/three.png', status: 'OPEN', adminResponse: '', createdAt: '2026-11-12T01:48:00Z' };
it.each([375, 1200])('renders the reference card at %spx with thumbnails, overflow, status and Vietnam time', width => {
  state.width = width;
  const onToggle = vi.fn();
  const html = renderToStaticMarkup(<FeedbackHistoryCard item={item} expanded={false} onToggle={onToggle} onOpenAttachment={vi.fn()} />);
  for (const text of ['Góp ý nâng cấp', 'test bị lỗi ảnh', 'Chờ xử lý', '08:48', '12/11/2026', '+1']) expect(html).toContain(text);
  expect(html.match(/<img/g)).toHaveLength(2); expect(html).not.toContain('Tệp đính kèm:');
  state.actions['Xem chi tiết phản hồi: Góp ý nâng cấp'](); expect(onToggle).toHaveBeenCalledOnce();
});
it('expanded feedback shows full message, staff reply and clickable document name', () => {
  const onOpenAttachment = vi.fn();
  const html = renderToStaticMarkup(<FeedbackHistoryCard item={{ ...item, content: 'Nội dung\n\nTệp đính kèm: báo cáo.pdf\nhttps://example.test/proof.pdf', status: 'RESOLVED', adminResponse: 'Đã kiểm tra và xử lý.' }} expanded onToggle={vi.fn()} onOpenAttachment={onOpenAttachment} />);
  for (const text of ['Đã trả lời', 'Phản hồi từ BCA', 'Đã kiểm tra và xử lý.', 'báo cáo.pdf', 'PDF', 'FileText']) expect(html).toContain(text);
  state.actions['Mở tệp: báo cáo.pdf'](); expect(onOpenAttachment).toHaveBeenCalledWith(expect.objectContaining({ url: 'https://example.test/proof.pdf' }));
});
it('handles loading, failure, empty and search-empty states', () => {
  const props = { items: [], page: 1, totalPages: 1, expandedId: null, onToggle: vi.fn(), onOpenAttachment: vi.fn(), onPage: vi.fn(), onRetry: vi.fn(), onCreate: vi.fn() };
  expect(renderToStaticMarkup(<FeedbackHistoryView {...props} loading />)).toContain('Đang tải phản hồi');
  const error = renderToStaticMarkup(<FeedbackHistoryView {...props} error="Mất kết nối" />); expect(error).toContain('Mất kết nối'); state.actions['Thử lại'](); expect(props.onRetry).toHaveBeenCalledOnce();
  expect(renderToStaticMarkup(<FeedbackHistoryView {...props} />)).toContain('Bạn chưa gửi phản hồi nào');
  expect(renderToStaticMarkup(<FeedbackHistoryView {...props} search="voucher" />)).toContain('Không tìm thấy phản hồi');
});
it('preserves previous/next page controls', () => {
  const onPage = vi.fn();
  renderToStaticMarkup(<FeedbackHistoryView items={[item]} page={2} totalPages={3} expandedId={null} onToggle={vi.fn()} onOpenAttachment={vi.fn()} onPage={onPage} onRetry={vi.fn()} onCreate={vi.fn()} />);
  state.actions['Trang trước'](); state.actions['Trang sau'](); expect(onPage.mock.calls).toEqual([[1], [3]]);
});
