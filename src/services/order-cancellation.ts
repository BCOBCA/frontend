export const buyerCancellationReasons = [
  'Không còn nhu cầu mua', 'Đặt nhầm hoặc trùng đơn', 'Muốn thay đổi sản phẩm',
  'Muốn thay đổi địa chỉ nhận hàng', 'Tìm được giá tốt hơn',
] as const;

export function buyerCancellationReason(reason: string) {
  const value = reason.trim();
  if (!buyerCancellationReasons.some(choice => choice === value)) throw new Error('Vui lòng chọn lý do hủy đơn trong danh sách.');
  return value;
}
