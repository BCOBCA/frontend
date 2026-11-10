import { View } from 'react-native';
import { LoginNotice, Page } from '../src/components/common/ui';
import { AffiliateCommissionHistory } from '../src/components/affiliate/AffiliateCommissionHistory';
import { useAuth } from '../src/stores/auth';
import { styles as s } from '../src/theme';

export default function Commissions() {
  const user = useAuth(state => state.user);
  return <Page title="Hoa hồng Affiliate" back>{!user ? <LoginNotice /> : <View style={s.padded}><AffiliateCommissionHistory /></View>}</Page>;
}
