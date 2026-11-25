import { Text } from 'react-native';
import { Button } from '../common/ui';
import { styles as s } from '../../theme';
import type { OwnedVoucher } from '../../types/api';
import { OfferDetails, voucherDate } from './OfferDetails';

export function OwnedOfferDetails({ item, onClose, onShop }: { item: OwnedVoucher; onClose: () => void; onShop: () => void }) {
  return <OfferDetails item={item} onClose={onClose} footer={<Button title="Mua sắm ngay" onPress={onShop} />}>
    <Text style={s.small}>{(item.pointCost ?? 0) > 0 ? `Đã đổi ${item.pointCost!.toLocaleString('vi-VN')} điểm` : 'Đã thu thập'} · {voucherDate(item.claimedAt)}</Text>
  </OfferDetails>;
}
