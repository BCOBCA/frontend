import { useState } from 'react';
import { Share, Text, View, useWindowDimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { LoginNotice, Page, Status } from '../components/common/ui';
import { AffiliateDashboardLinks, AffiliateDashboardRank, AffiliateWalletCard } from '../components/affiliate/AffiliateDashboardView';
import { AffiliateInvitationCard, type AffiliateInvitation } from '../components/affiliate/AffiliateInvitationCard';
import { request, errorMessage } from '../services/api';
import { useAuth } from '../stores/auth';
import { useToast } from '../stores/toast';
import { money } from '../theme';
import type { Affiliate, AffiliateRank } from '../types/api';

export default function AffiliateDashboardScreen() {
  const user = useAuth(state => state.user);
  const showToast = useToast(state => state.show);
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const [copyFailure, setCopyFailure] = useState<{ userId: string; message: string } | null>(null);
  const wallet = useQuery({ queryKey: ['affiliate', user?.id], queryFn: () => request<Affiliate>('GET', '/affiliate'), enabled: !!user });
  const invitation = useQuery({ queryKey: ['affiliate-invitation', user?.id], queryFn: () => request<AffiliateInvitation>('GET', '/affiliate/invitation'), enabled: !!user });
  const ranks = useQuery({ queryKey: ['affiliate-ranks'], queryFn: () => request<AffiliateRank[]>('GET', '/affiliate/ranks'), enabled: !!user });
  const copy = async () => {
    if (!user || !invitation.data?.url || invitation.error) return;
    setCopyFailure(null);
    try {
      if (!await Clipboard.setStringAsync(invitation.data.url)) throw new Error('Không thể sao chép. Bạn có thể chọn liên kết bên dưới để sao chép thủ công.');
      showToast('Đã sao chép link giới thiệu.');
    } catch (error) { setCopyFailure({ userId: user.id, message: errorMessage(error) }); }
  };
  const share = async () => {
    if (!user || !invitation.data?.url || invitation.error) return;
    try { await Share.share({ message: invitation.data.url, url: invitation.data.url }); }
    catch (error) { showToast(errorMessage(error), 'error'); }
  };
  return <Page title="Ví Affiliate" back footerTab="member">
    {!user ? <LoginNotice /> : <View key={user.id} style={{ padding: wide ? 20 : 12, gap: 16 }}>
      <Status loading={wallet.isLoading} error={wallet.error} retry={() => void wallet.refetch()} />
      <View style={{ flexDirection: wide ? 'row' : 'column', alignItems: 'stretch', gap: 16 }}>
        <View style={{ flex: wide ? 2.1 : undefined, minWidth: 0 }}><AffiliateWalletCard wallet={wallet.data} wide={wide} onLedger={() => router.push('/wallet-transactions')} onWithdraw={() => router.push('/withdrawal')} /></View>
        <View style={{ flex: wide ? 1 : undefined, minWidth: 0 }}><AffiliateInvitationCard invitation={invitation.data} loading={invitation.isLoading} error={invitation.error} copyError={copyFailure?.userId === user.id ? copyFailure.message : undefined} onRetry={() => void invitation.refetch()} onCopy={() => void copy()} onShare={() => void share()} /></View>
      </View>
      {!!wallet.data?.debtBalance && <Text accessibilityRole="alert" style={{ fontSize: 13, lineHeight: 19, color: '#BE2840' }}>Hoa hồng cần cấn trừ sau hoàn tiền: {money(wallet.data.debtBalance)}</Text>}
      <Status error={ranks.error} retry={() => void ranks.refetch()} />
      <AffiliateDashboardRank wallet={wallet.data} ranks={ranks.data ?? []} wide={wide} onDetails={() => router.push('/info/affiliate')} />
      <AffiliateDashboardLinks width={width} onNavigate={route => router.push(route)} />
    </View>}
  </Page>;
}
