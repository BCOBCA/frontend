import { beforeEach, describe, expect, it, vi } from 'vitest';
import { pickProfileImage } from '../src/components/profile/profile-media';
const state = vi.hoisted(() => ({ canceled: false, size: 4, mime: 'image/png', request: vi.fn(async () => ({ url: 'https://example.test/upload.png' })) }));
vi.mock('react-native', () => ({ Platform: { OS: 'web' } }));
vi.mock('expo-image-picker', () => ({ launchImageLibraryAsync: vi.fn(async () => ({ canceled: state.canceled, assets: [{ uri: 'blob:test-avatar', mimeType: state.mime, fileSize: state.size, file: new File(['test'], 'avatar.png', { type: 'image/png' }) }] })) }));
vi.mock('../src/services/api', () => ({ request: state.request }));
beforeEach(() => { state.canceled = false; state.size = 4; state.mime = 'image/png'; state.request.mockClear(); });
describe('profile gallery upload', () => {
  it('does not upload when the user cancels the picker', async () => {
    state.canceled = true;
    expect(await pickProfileImage('cover')).toBeNull(); expect(state.request).not.toHaveBeenCalled();
  });
  it('rejects oversize or unsupported images before requesting upload', async () => {
    state.size = 6 * 1024 * 1024;
    await expect(pickProfileImage('avatar')).rejects.toThrow('5 MB');
    state.size = 4; state.mime = 'image/svg+xml';
    await expect(pickProfileImage('avatar')).rejects.toThrow('JPEG');
    expect(state.request).not.toHaveBeenCalled();
  });
  it('sends a picked image as multipart to the authenticated profile endpoint', async () => {
    expect(await pickProfileImage('avatar')).toBe('https://example.test/upload.png');
    expect(state.request).toHaveBeenCalledWith('POST', '/auth/profile-images', expect.any(FormData));
  });
});
