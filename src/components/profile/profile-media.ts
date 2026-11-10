import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { request } from '../../services/api';

export async function pickProfileImage(kind: 'avatar' | 'cover'): Promise<string | null> {
  const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: Platform.OS !== 'web', aspect: kind === 'avatar' ? [1, 1] : [16, 9], quality: 0.85 });
  if (picked.canceled) return null;
  const asset = picked.assets[0];
  const mime = asset.mimeType ?? (asset.uri.toLowerCase().endsWith('.png') ? 'image/png' : asset.uri.toLowerCase().endsWith('.webp') ? 'image/webp' : 'image/jpeg');
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(mime)) throw new Error('Vui lòng chọn ảnh JPEG, PNG hoặc WebP.');
  if ((asset.fileSize ?? asset.file?.size ?? 0) > 5 * 1024 * 1024) throw new Error('Ảnh không được lớn hơn 5 MB.');
  const form = new FormData();
  if (Platform.OS === 'web') {
    if (!asset.file) throw new Error('Không đọc được ảnh đã chọn. Vui lòng chọn lại.');
    form.append('file', asset.file);
  } else form.append('file', { uri: asset.uri, name: asset.fileName ?? `profile.${mime.split('/')[1]}`, type: mime } as unknown as Blob);
  const uploaded = await request<{ url: string }>('POST', '/auth/profile-images', form);
  return uploaded.url;
}
