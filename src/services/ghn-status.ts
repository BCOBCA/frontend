export const ghnStatusLabels: Record<string, string> = {
  PENDING: 'Chờ tạo vận đơn GHN', ready_to_pick: 'Chờ GHN lấy hàng', picking: 'GHN đang đến lấy hàng',
  money_collect_picking: 'GHN đang thu tiền khi lấy hàng', picked: 'GHN đã lấy hàng', storing: 'Hàng đang ở kho GHN',
  sorting: 'GHN đang phân loại hàng', transporting: 'GHN đang vận chuyển', delivering: 'GHN đang giao hàng',
  money_collect_delivering: 'GHN đang thu tiền khi giao hàng', delivered: 'Giao hàng thành công', delivery_fail: 'Giao hàng chưa thành công',
  waiting_to_return: 'Chờ hoàn hàng về shop', return: 'Đã yêu cầu hoàn hàng', return_transporting: 'Đang vận chuyển hàng hoàn',
  return_sorting: 'Đang phân loại hàng hoàn', returning: 'GHN đang hoàn hàng về shop', return_fail: 'Hoàn hàng chưa thành công',
  returned: 'Đã hoàn hàng về shop', cancel: 'Vận đơn GHN đã hủy', exception: 'Vận đơn gặp sự cố', lost: 'GHN báo thất lạc hàng',
  damage: 'GHN báo hàng hư hỏng', scrap: 'GHN báo hàng đã tiêu hủy',
};
