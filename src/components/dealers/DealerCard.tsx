import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { BadgeCheck, Check, MapPin, Store, Users } from 'lucide-react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { colors } from '../../theme';
import type { Dealer } from '../../types/dealers';
import { followDealer } from '../../services/dealers';
import { errorMessage } from '../../services/api';
import { useAuth } from '../../stores/auth';

export function DealerImage({ uri, logo = false }: { uri: string; logo?: boolean }) {
  const [failed, setFailed] = useState(false);
  return <View style={{ width: '100%', height: '100%', backgroundColor: logo ? '#FFF7F4' : '#F6E7E3', alignItems: 'center', justifyContent: 'center' }}>
    {uri && !failed ? <Image accessibilityLabel={logo ? 'Logo đại lý' : 'Ảnh bìa đại lý'} source={{ uri }} resizeMode={logo ? 'contain' : 'cover'} onError={() => setFailed(true)} style={{ width: '100%', height: '100%' }} /> : <Store size={logo ? 27 : 48} color={logo ? colors.primary : '#D6A99E'} strokeWidth={1.4} />}
  </View>;
}

export function VerifiedBadge() { return <View accessibilityLabel="Đại lý đã xác minh"><BadgeCheck size={16} fill={colors.primary} color="white" /></View>; }

export function FollowButton({ dealer, solid = false }: { dealer: Dealer; solid?: boolean }) {
  const user = useAuth(state => state.user);
  const client = useQueryClient();
  const follow = useMutation({ mutationFn: () => followDealer(dealer.id, dealer.isFollowing),
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ['dealers'] }); await client.invalidateQueries({ queryKey: ['dealer', dealer.slug] }); } });
  return <View style={{ gap: 5 }}>
    <Pressable accessibilityRole="button" accessibilityLabel={`${dealer.isFollowing ? 'Bỏ theo dõi' : 'Theo dõi'} ${dealer.name}`} accessibilityState={{ disabled: follow.isPending, selected: dealer.isFollowing }} disabled={follow.isPending}
      onPress={event => { event.stopPropagation(); if (!user) { router.push('/login'); return; } follow.mutate(); }}
      hitSlop={8}
      style={({ pressed }) => ({ minHeight: solid ? 40 : 28, borderRadius: solid ? 7 : 14, borderWidth: 1, borderColor: colors.primary, paddingHorizontal: solid ? 5 : 8, flexDirection: 'row', gap: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: solid && !dealer.isFollowing ? colors.primary : dealer.isFollowing ? '#FFF0EE' : 'white', opacity: pressed || follow.isPending ? 0.6 : 1 })}>
      {dealer.isFollowing && <Check size={12} color={colors.primary} />}<Text style={{ color: solid && !dealer.isFollowing ? '#FFFFFF' : colors.primary, fontWeight: '700', fontSize: 11 }}>{follow.isPending ? 'Đang xử lý…' : dealer.isFollowing ? 'Đang theo dõi' : 'Theo dõi'}</Text>
    </Pressable>
    {follow.error && <Text accessibilityRole="alert" style={{ color: colors.primary, fontSize: 11 }}>{errorMessage(follow.error)}</Text>}
  </View>;
}

export function DealerCard({ dealer, width }: { dealer: Dealer; width: number }) {
  return <View style={{ width, borderRadius: 14, backgroundColor: 'white', borderColor: colors.border, borderWidth: 1, overflow: 'hidden', boxShadow: '0 3px 12px #34212C08', justifyContent: 'space-between' }}>
    <Link href={{ pathname: '/dai-ly/[slug]', params: { slug: dealer.slug } }} asChild>
      <Pressable accessibilityRole="link" accessibilityLabel={`Xem đại lý ${dealer.name}`} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
        <View style={{ height: 104 }}><DealerImage key={dealer.coverUrl} uri={dealer.coverUrl} /></View>
        <View style={{ paddingHorizontal: 12, paddingBottom: 8, gap: 7 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: -19 }}>
            <View style={{ width: 52, height: 52, borderRadius: 13, borderWidth: 3, borderColor: 'white', overflow: 'hidden', backgroundColor: 'white' }}><DealerImage key={dealer.logoUrl} uri={dealer.logoUrl} logo /></View>
            <View style={{ flex: 1, paddingTop: 20, flexDirection: 'row', gap: 3, alignItems: 'center' }}><Text numberOfLines={1} style={{ color: colors.text, fontSize: 14, fontWeight: '800', flexShrink: 1 }}>{dealer.name}</Text>{dealer.isVerified && <VerifiedBadge />}</View>
          </View>
          <Text numberOfLines={1} style={{ fontSize: 12, lineHeight: 18, color: colors.muted }}>{dealer.description || 'Khám phá thông tin đại lý'}</Text>
          <View accessibilityLabel="Phạm vi hoạt động" style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 4 }}><View style={{ paddingTop: 2 }}><MapPin size={13} color={colors.muted} /></View><Text style={{ flex: 1, fontSize: 12, lineHeight: 18, color: colors.muted }}>{dealer.provinces || 'Chưa thiết lập phạm vi'}</Text></View>
        </View>
      </Pressable>
    </Link>
    <View style={{ padding: 12, paddingTop: 0, flexDirection: 'row', justifyContent: 'space-between', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
      <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}><Users size={13} color={colors.muted} /><Text style={{ color: colors.muted, fontSize: 11 }}>{dealer.followerCount.toLocaleString('vi-VN')} theo dõi</Text></View>
      <FollowButton dealer={dealer} />
    </View>
  </View>;
}

export function DealerSkeleton({ width }: { width: number }) {
  return <View accessibilityLabel="Đang tải đại lý" style={{ width, borderRadius: 14, overflow: 'hidden', backgroundColor: 'white', paddingBottom: 18, gap: 12 }}><View style={{ height: 104, backgroundColor: '#E7E7EC' }} /><View style={{ marginHorizontal: 14, width: '65%', height: 16, borderRadius: 4, backgroundColor: '#E7E7EC' }} /><View style={{ marginHorizontal: 14, width: '85%', height: 12, borderRadius: 4, backgroundColor: '#F0F0F4' }} /><View style={{ marginHorizontal: 14, width: '45%', height: 12, borderRadius: 4, backgroundColor: '#F0F0F4' }} /></View>;
}
