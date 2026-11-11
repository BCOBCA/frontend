import { z } from 'zod';

export const SUPPORT_EMAIL = 'mxh@baochi.online';
export const SUGGESTION_SUBJECT = 'Góp ý nâng cấp';
export const supportTopics = ['Đơn hàng và thanh toán', 'Affiliate và hoa hồng', 'Tài khoản và đăng nhập', 'Ưu đãi và voucher', SUGGESTION_SUBJECT, 'Vấn đề khác'] as const;
export const feedbackSchema = z.object({
  subject: z.string().refine(value => supportTopics.some(topic => topic === value), 'Vui lòng chọn chủ đề cần hỗ trợ.'),
  content: z.string().trim().min(5, 'Vui lòng mô tả ít nhất 5 ký tự.').max(1000, 'Nội dung tối đa 1.000 ký tự.'),
  reference: z.string().trim().max(2048, 'Liên kết quá dài.').refine(value => {
    if (!value) return true;
    try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password; } catch { return false; }
  }, 'Vui lòng nhập liên kết http hoặc https hợp lệ.'),
});
export type FeedbackValues = z.infer<typeof feedbackSchema>;
export const emptyFeedback: FeedbackValues = { subject: '', content: '', reference: '' };
export function feedbackPayload(values: FeedbackValues) {
  const parsed = feedbackSchema.parse(values);
  return { type: parsed.subject === SUGGESTION_SUBJECT ? 'FEEDBACK' : 'SUPPORT', subject: parsed.subject, content: parsed.content + (parsed.reference ? `\n\nLiên kết minh họa: ${parsed.reference}` : '') };
}
