import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, it, vi } from 'vitest';
import { AttachmentField } from '../src/components/support/AttachmentField';
const state = vi.hoisted(() => ({ actions: {} as Record<string, () => void> }));
vi.mock('react-native', () => ({ StyleSheet: { create: (v: unknown) => v }, View: 'div', Text: 'span', Image: ({ source, accessibilityLabel }: { source: { uri: string }; accessibilityLabel: string }) => <img src={source.uri} alt={accessibilityLabel} />, Pressable: ({ accessibilityLabel, disabled, onPress, children }: { accessibilityLabel: string; disabled: boolean; onPress: () => void; children: React.ReactNode }) => { state.actions[accessibilityLabel] = onPress; return <button aria-label={accessibilityLabel} disabled={disabled}>{children}</button>; } }));
vi.mock('lucide-react-native', () => ({ Paperclip: () => null, X: () => null, FileText: () => <i>document-icon</i>, FileSpreadsheet: () => <i>spreadsheet-icon</i> }));
it('renders image preview, name and replace/remove actions', () => {
  const onPick = vi.fn(), onRemove = vi.fn();
  const html = renderToStaticMarkup(<AttachmentField attachment={{ name: 'ảnh.png', uri: 'blob:test', mimeType: 'image/png', size: 1024 }} onPick={onPick} onRemove={onRemove} />);
  expect(html).toContain('<img'); expect(html).toContain('ảnh.png');
  state.actions['Đổi tệp đính kèm'](); state.actions['Xóa tệp đính kèm']();
  expect(onPick).toHaveBeenCalledOnce(); expect(onRemove).toHaveBeenCalledOnce();
});
it.each([['report.pdf', 'document-icon', 'PDF'], ['report.xlsx', 'spreadsheet-icon', 'XLSX']])('renders %s as a document with type and filename', (name, icon, type) => {
  const html = renderToStaticMarkup(<AttachmentField attachment={{ name, uri: 'blob:test', mimeType: 'application/octet-stream' }} onPick={vi.fn()} onRemove={vi.fn()} busy />);
  expect(html).toContain(name); expect(html).toContain(type); expect(html).toContain(icon); expect(html).not.toContain('<img'); expect(html).toContain('disabled');
});
