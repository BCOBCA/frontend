import { beforeEach, expect, it, vi } from 'vitest';
import { pickSupportAttachment, uploadSupportAttachment } from '../src/components/support/support-attachments';

const state = vi.hoisted(() => ({ canceled: false, name: 'evidence.pdf', mime: 'application/pdf', size: 4, platform: 'web', request: vi.fn(async () => ({ url: 'https://example.test/evidence.pdf' })) }));
vi.mock('react-native', () => ({ Platform: { get OS() { return state.platform; } } }));
vi.mock('expo-document-picker', () => ({ getDocumentAsync: vi.fn(async () => ({ canceled: state.canceled, assets: [{ uri: 'file:test', name: state.name, mimeType: state.mime, size: state.size, file: new File(['test'], state.name, { type: state.mime }) }] })) }));
vi.mock('../src/services/api', () => ({ request: state.request }));
beforeEach(() => { state.canceled = false; state.name = 'evidence.pdf'; state.mime = 'application/pdf'; state.size = 4; state.platform = 'web'; state.request.mockClear(); });
it('cancel leaves selection unchanged and never uploads', async () => {
  state.canceled = true;
  expect(await pickSupportAttachment()).toBeNull();
  expect(state.request).not.toHaveBeenCalled();
});
it('selects locally without uploading, then submits file bytes as multipart', async () => {
  const asset = await pickSupportAttachment();
  expect(asset?.name).toBe('evidence.pdf');
  expect(state.request).not.toHaveBeenCalled();
  expect(await uploadSupportAttachment(asset!)).toBe('https://example.test/evidence.pdf');
  const form = state.request.mock.calls[0] as unknown as [string, string, FormData];
  expect(form.slice(0, 2)).toEqual(['POST', '/feedbacks/attachments']);
  expect((form[2].get('file') as File).name).toBe('evidence.pdf');
});
it('rejects oversize, empty, executable or mismatched files', async () => {
  state.size = 5 * 1024 * 1024 + 1;
  await expect(pickSupportAttachment()).rejects.toThrow('5 MB');
  state.size = 0;
  await expect(pickSupportAttachment()).rejects.toThrow('trống');
  state.size = 4; state.name = 'evidence.exe';
  await expect(pickSupportAttachment()).rejects.toThrow('hỗ trợ');
  state.name = 'evidence.png';
  await expect(pickSupportAttachment()).rejects.toThrow('hỗ trợ');
});
it('accepts a document with missing MIME using its extension', async () => {
  state.mime = '';
  expect((await pickSupportAttachment())?.mimeType).toBe('application/pdf');
});
