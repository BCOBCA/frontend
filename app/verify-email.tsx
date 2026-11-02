import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { Button, Page, Status } from '../src/components/common/ui';
import { request } from '../src/services/api';
import { styles as s } from '../src/theme';
export default function VerifyEmail() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const verify = useMutation({ mutationFn: () => request('POST', '/auth/verify-email', { token }) });
  return <Page title="Xác minh email" back><View style={s.padded}><Text style={s.body}>{verify.isSuccess ? 'Email đã được xác minh.' : token ? 'Xác nhận địa chỉ email của bạn.' : 'Vui lòng mở liên kết xác minh trong email.'}</Text><Status error={verify.error} />{token && !verify.isSuccess && <Button title="Xác minh email" disabled={verify.isPending} onPress={() => verify.mutate()} />}</View></Page>;
}
