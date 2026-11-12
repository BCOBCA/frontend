import { Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { request } from '../../services/api';

export type SupportAttachment = DocumentPicker.DocumentPickerAsset;
const types: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
  pdf: 'application/pdf', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', txt: 'text/plain',
};
export async function pickSupportAttachment(): Promise<SupportAttachment | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: Object.values(types), multiple: false, copyToCacheDirectory: true, base64: false });
  if (result.canceled) return null;
  const asset = result.assets[0];
  const mime = types[asset.name.split('.').pop()?.toLowerCase() ?? ''];
  let error = '';
  if (!mime || (asset.mimeType && asset.mimeType !== 'application/octet-stream' && asset.mimeType !== mime)) error = 'Chỉ hỗ trợ ảnh JPG, PNG, WebP hoặc tài liệu PDF, DOCX, XLSX, TXT.';
  else if ((asset.size ?? asset.file?.size ?? 0) > 5 * 1024 * 1024) error = 'Tệp không được lớn hơn 5 MB.';
  else if ((asset.size ?? asset.file?.size) === 0) error = 'Không thể đính kèm tệp trống.';
  if (error) {
    if (asset.file && asset.uri.startsWith('blob:')) URL.revokeObjectURL(asset.uri);
    throw new Error(error);
  }
  return { ...asset, mimeType: mime };
}
export async function uploadSupportAttachment(asset: SupportAttachment): Promise<string> {
  const form = new FormData();
  if (Platform.OS === 'web') {
    if (!asset.file) throw new Error('Không đọc được tệp đã chọn. Vui lòng chọn lại.');
    form.append('file', asset.file.slice(0, asset.file.size, asset.mimeType), asset.name);
  } else form.append('file', { uri: asset.uri, name: asset.name, type: asset.mimeType } as unknown as Blob);
  return (await request<{ url: string }>('POST', '/feedbacks/attachments', form)).url;
}
