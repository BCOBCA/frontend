import { useRef, useState, type ComponentRef, type PropsWithChildren } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Info, Percent, Layers, Wallet, ShieldCheck, ClipboardList, Share2, Link2, ShoppingCart, ArrowRight, Zap, Database, ChartNoAxesColumnIncreasing, Check, ChevronDown, ChevronUp } from 'lucide-react-native';
import { Header, Status } from '../components/common/ui';
import { AffiliatePolicyArt } from '../components/affiliate/AffiliatePolicyArt';
import { AffiliateLinkArt } from '../components/affiliate/AffiliateLinkArt';
import { AffiliateRankIcon } from '../components/affiliate/AffiliateRankIcon';
import { PolicyNote, PolicyParagraphs, PolicyTable } from '../components/affiliate/PolicyContent';
import { commissionExamples, policyQuestions, policySections, policyTerms, unpublished } from '../components/affiliate/affiliate-policy-content';
import { request } from '../services/api';
import { useAuth } from '../stores/auth';
import type { AffiliatePolicy, AffiliateRank } from '../types/api';
import { colors, money, styles as s } from '../theme';

const menus = [
  { id: 'overview', label: 'Tổng quan', Icon: Info }, { id: 'eligibility', label: 'Điều kiện tham gia', Icon: ShieldCheck },
  { id: 'steps', label: 'Cách hoạt động', Icon: Percent }, { id: 'ranks', label: 'Hệ thống hạng & hoa hồng', Icon: Layers },
  { id: 'rank-updates', label: 'Nâng hạng & điều chỉnh', Icon: ChartNoAxesColumnIncreasing }, { id: 'commission', label: 'Hoa hồng sản phẩm', Icon: Database },
  { id: 'orders', label: 'Đơn hàng & đối soát', Icon: ShoppingCart }, { id: 'payment', label: 'Thanh toán', Icon: Wallet },
  { id: 'rights', label: 'Quyền lợi & trách nhiệm', Icon: ClipboardList }, { id: 'rules', label: 'Quy định & điều kiện', Icon: ShieldCheck },
  { id: 'disputes', label: 'Khiếu nại & thay đổi', Icon: Info }, { id: 'faq', label: 'Câu hỏi thường gặp', Icon: ClipboardList },
] as const;
type SectionId = typeof menus[number]['id'];
const steps = [{ Icon: Link2, text: 'Lấy liên kết sản phẩm' }, { Icon: Share2, text: 'Chia sẻ đến người khác' }, { Icon: ShoppingCart, text: 'Có đơn hàng thành công' }, { Icon: Database, text: 'Nhận hoa hồng' }];
const rules = ['Sử dụng tài khoản và thông tin cá nhân hợp lệ.', 'Không gian lận, tự tạo đơn hoặc quảng bá nội dung vi phạm pháp luật.', 'Lượt giới thiệu thành công được tính khi người được mời có đơn hoàn tất và đã thanh toán.', 'Đơn hủy hoặc hoàn tiền có thể làm hoa hồng bị hủy hoặc cấn trừ.', 'Tuân thủ điều khoản sử dụng và chính sách của Báo chí Online BCA.'];

function Heading({ children }: PropsWithChildren) {
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}><View style={{ width: 4, height: 19, backgroundColor: colors.primary, borderRadius: 2 }} /><Text accessibilityRole="header" style={{ flex: 1, color: colors.text, fontSize: 16, lineHeight: 23, fontWeight: '800' }}>{children}</Text></View>;
}
function Action({ title, onPress, outline = false, compact = false }: { title: string; onPress: () => void; outline?: boolean; compact?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, minHeight: compact ? 36 : 44, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, borderColor: colors.primary, backgroundColor: outline ? '#FFFFFF88' : colors.primary, opacity: pressed ? 0.8 : 1 })}>
    {!outline && <Share2 size={16} color={colors.surface} />}<Text style={{ color: outline ? colors.primary : colors.surface, fontSize: 13, fontWeight: '700' }}>{title}</Text>
  </Pressable>;
}

export default function AffiliatePolicyScreen() {
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const user = useAuth(state => state.user);
  const ranks = useQuery({ queryKey: ['affiliate-ranks'], queryFn: () => request<AffiliateRank[]>('GET', '/affiliate/ranks') });
  const policy = useQuery({ queryKey: ['affiliate-policy'], queryFn: () => request<AffiliatePolicy>('GET', '/affiliate/policy') });
  const questions = policyQuestions(policy.data);
  const examples = commissionExamples(ranks.data ?? []);
  const upgradeExample = [...(ranks.data ?? [])].sort((a, b) => a.rank - b.rank).find(rank => rank.minSuccessfulReferrals > 0);
  const [active, setActive] = useState<SectionId>('overview');
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const positions = useRef<Partial<Record<SectionId, number>>>({});
  const trackSection = (id: SectionId, event: LayoutChangeEvent) => { positions.current[id] = event.nativeEvent.layout.y; };
  const goTo = (id: SectionId) => { setActive(id); scroll.current?.scrollTo({ y: positions.current[id] ?? 0, animated: true }); };
  const panel = { backgroundColor: colors.surface, borderRadius: 12, padding: 16, gap: 4 };
  return <SafeAreaView style={[s.page, { backgroundColor: colors.primary }]} edges={['top', 'left', 'right']}>
    <Header title="Chính sách Affiliate" back />
    <View style={{ flex: 1, backgroundColor: '#FAFAFC' }}><View style={[s.container, { flex: 1, padding: wide ? 24 : 12, gap: 16 }]}>
      <View style={{ flex: 1, flexDirection: wide ? 'row' : 'column', gap: 16, minHeight: 0 }}>
        <ScrollView horizontal={!wide} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} style={{ width: wide ? 205 : '100%', flexGrow: 0, flexShrink: wide ? 1 : 0, maxHeight: wide ? undefined : 60, backgroundColor: colors.surface, borderRadius: 12 }} contentContainerStyle={{ flexDirection: wide ? 'column' : 'row', padding: 8, gap: 8 }}>
          {menus.map(({ id, label, Icon }, index) => <Pressable key={id} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: active === id }} onPress={() => goTo(id)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 6, backgroundColor: active === id ? colors.primary : '#FFF7F8', opacity: pressed ? 0.8 : 1 })}>
            <Icon size={17} color={active === id ? colors.surface : colors.primary} /><Text style={{ color: active === id ? colors.surface : colors.text, fontSize: 12, lineHeight: 18, fontWeight: '600', flexShrink: 1 }}>{index + 1}. {label}</Text>
          </Pressable>)}
        </ScrollView>
        <ScrollView ref={scroll} showsVerticalScrollIndicator={false} style={{ flex: 1, minWidth: 0 }} contentContainerStyle={{ gap: 16, paddingBottom: 32 }} onScroll={event => { const offset = event.nativeEvent.contentOffset.y + 24; const current = [...menus].reverse().find(menu => positions.current[menu.id] != null && positions.current[menu.id]! <= offset); if (current) setActive(current.id); }} scrollEventThrottle={100}>
          <View onLayout={event => trackSection('overview', event)} style={{ gap: 16 }}>
            <View style={{ backgroundColor: '#FFECEF', borderRadius: 12, overflow: 'hidden', minHeight: wide ? 170 : undefined }}>
              <View style={{ width: wide ? '62%' : '100%', paddingHorizontal: wide ? 22 : 18, paddingVertical: 14, gap: 6, zIndex: 1 }}>
                <Text accessibilityRole="header" style={{ fontSize: wide ? 26 : 24, lineHeight: 31, color: '#111827', fontWeight: '800' }}>Chương trình <Text style={{ color: '#ED202B' }}>Affiliate</Text></Text>
                <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20, fontWeight: '700' }}>Giới thiệu sản phẩm – Nhận hoa hồng hấp dẫn</Text>
                <Text style={{ color: colors.text, fontSize: 11, lineHeight: 16, maxWidth: 340 }}>Kiếm thêm thu nhập bằng cách chia sẻ liên kết sản phẩm đến bạn bè, người theo dõi và cộng đồng của bạn.</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 }}><Action title="Tham gia ngay" compact={wide} onPress={() => router.push(user ? '/affiliate-ranks' : '/login')} /><Action title="Xem hướng dẫn" compact={wide} outline onPress={() => goTo('steps')} /></View>
              </View>
              <View style={wide ? { position: 'absolute', top: 0, right: 0, bottom: 0, width: '43%' } : { width: '100%', height: 180 }}><AffiliatePolicyArt /></View>
            </View>
            <Status error={policy.error} retry={() => void policy.refetch()} />
            <View style={{ flexDirection: wide ? 'row' : 'column', gap: 16 }}>
              <View style={{ flex: 1, padding: 4 }}><Heading>Affiliate là gì?</Heading><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 12 }}><Text style={[s.small, { flex: 1, color: colors.text, lineHeight: 22 }]}>Là chương trình cho phép bạn chia sẻ liên kết sản phẩm trên Báo chí Online BCA. Khi có người mua hàng qua liên kết của bạn, bạn sẽ nhận được hoa hồng theo quy định.</Text><View style={{ width: wide ? 120 : 96, aspectRatio: 180 / 130, flexShrink: 0 }}><AffiliateLinkArt /></View></View></View>
              <View style={[panel, { flex: 1, backgroundColor: '#FFF0F3' }]}><Heading>Lợi ích khi tham gia</Heading>{[{ Icon: Zap, text: 'Dễ dàng bắt đầu với liên kết chia sẻ' }, { Icon: Database, text: 'Hoa hồng theo hạng, minh bạch' }, { Icon: ChartNoAxesColumnIncreasing, text: 'Theo dõi hiệu quả trực quan' }, { Icon: Wallet, text: 'Quản lý thu nhập và yêu cầu rút tiền' }].map(({ Icon, text }) => <View key={text} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 5 }}><Icon size={23} color="#F5222D" strokeWidth={2.3} /><Text style={[s.small, { color: colors.text, flex: 1 }]}>{text}</Text></View>)}</View>
            </View>
            <View style={panel}><Heading>1. Giới thiệu, phạm vi & đối tượng áp dụng</Heading><PolicyParagraphs items={policySections.scope} /></View>
          </View>
          <View onLayout={event => trackSection('eligibility', event)} style={panel}><Heading>2. Điều kiện đăng ký & tham gia</Heading><PolicyParagraphs items={policySections.eligibility} /></View>
          <View onLayout={event => trackSection('steps', event)} style={[panel, { padding: 12, gap: 10 }]}><Heading>3. Cách hoạt động & cơ chế giới thiệu</Heading><View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 16 }}>
            {steps.map(({ Icon, text }, index) => <View key={text} style={{ width: wide ? '25%' : '50%', alignItems: 'center', gap: 3, paddingHorizontal: 8 }}><View style={{ width: 48, height: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF0F3', borderRadius: 24 }}><Icon size={23} color="#F5222D" strokeWidth={2} /></View><Text style={{ fontSize: 11, lineHeight: 15, fontWeight: '800', color: colors.text }}>Bước {index + 1}</Text><Text style={{ textAlign: 'center', color: colors.text, fontSize: 12, lineHeight: 17 }}>{text}</Text>{(wide ? index < 3 : index % 2 === 0) && <View style={{ position: 'absolute', right: -7, top: 25 }}><ArrowRight size={16} color="#F5222D" strokeWidth={2} /></View>}</View>)}
          </View><PolicyParagraphs items={policySections.memberReferral} /><PolicyTable headings={['Cơ chế', 'Mục đích & điều kiện']} rows={[
            ['Mã / liên kết mời thành viên', 'Ghi nhận người được mời. Mỗi người chỉ tính một lượt xét hạng sau đơn đầu tiên hợp lệ.'],
            ['Liên kết sản phẩm', 'Ghi nhận nguồn cho đơn/sản phẩm đủ điều kiện hoa hồng; không tự làm tăng lượt xét hạng.'],
          ]} /><PolicyNote>Lưu ý: được mời đăng ký không đồng nghĩa mọi đơn mua về sau đều được hưởng hoa hồng. Việc quy thuộc đơn và quyền lợi sản phẩm phải được kiểm tra riêng.</PolicyNote></View>
          <View onLayout={event => trackSection('ranks', event)} style={{ flexDirection: wide ? 'row' : 'column', gap: 16 }}>
            <View style={[panel, { flex: 1.4, minWidth: 0 }]}><Heading>4. Hệ thống 5 hạng Affiliate & hoa hồng</Heading>
              <Status loading={ranks.isLoading} error={ranks.error} retry={() => void ranks.refetch()} />
              {!!ranks.data?.length && <View style={{ borderWidth: 1, borderColor: '#F1E9EC', borderRadius: 8, overflow: 'hidden' }}>
                <View style={{ flexDirection: 'row', backgroundColor: '#FDEEF1', paddingHorizontal: 10, paddingVertical: 7, alignItems: 'center', gap: 6 }}><Text style={{ flex: 1, color: colors.text, fontSize: 12, fontWeight: '700' }}>Hạng</Text><View style={{ flex: 1.3, alignItems: 'center' }}><Text style={{ textAlign: 'center', color: colors.text, fontSize: 11, lineHeight: 15, fontWeight: '700' }}>Lượt giới thiệu thành công*</Text><Text style={{ textAlign: 'center', color: colors.text, fontSize: 10, lineHeight: 14 }}>(hoàn thành đơn hàng đầu tiên)</Text></View><Text style={{ width: 64, textAlign: 'center', color: colors.text, fontSize: 12, fontWeight: '700' }}>Hoa hồng</Text></View>
                {[...ranks.data].sort((a, b) => a.rank - b.rank).map((rank, index) => <View key={rank.rank} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, minHeight: 31, borderTopWidth: 1, borderColor: '#F1E9EC' }}><View style={{ flex: 1, flexDirection: 'row', gap: 8, alignItems: 'center' }}><AffiliateRankIcon level={index} /><Text style={{ flex: 1, fontSize: 12, lineHeight: 17, color: colors.text, fontWeight: '700' }}>{rank.name}</Text></View><Text style={{ flex: 1.3, textAlign: 'center', fontSize: 12, lineHeight: 17, color: colors.text }}>{rank.minSuccessfulReferrals.toLocaleString('vi-VN')}+</Text><Text style={{ width: 64, textAlign: 'center', color: '#F5222D', fontWeight: '800', fontSize: 13, lineHeight: 18 }}>{(rank.commissionRate * 100).toLocaleString('vi-VN', { maximumFractionDigits: 2 })}%</Text></View>)}
              </View>}
              {!ranks.isLoading && !ranks.error && ranks.data?.length === 0 && <Text style={s.small}>Chưa có cấu hình hạng Affiliate.</Text>}
              <View style={{ flexDirection: 'row', gap: 6, padding: 10, backgroundColor: '#FFF0F3', borderRadius: 6, marginTop: 6 }}><Info size={14} color={colors.text} /><Text style={{ flex: 1, fontSize: 11, lineHeight: 17, color: colors.text }}>*Mỗi người được mời chỉ tính một lượt khi có đơn hoàn tất, đã thanh toán. Đơn hủy hoặc chưa thanh toán không được tính.</Text></View>
            </View>
            <View style={[panel, { flex: 1 }]}><Heading>Điều kiện cần lưu ý</Heading>{rules.map(text => <View key={text} style={{ flexDirection: 'row', gap: 8, paddingVertical: 7 }}><View style={{ borderRadius: 10, backgroundColor: colors.primary, padding: 2, alignSelf: 'flex-start' }}><Check size={11} color={colors.surface} /></View><Text style={{ flex: 1, color: colors.text, fontSize: 12, lineHeight: 20 }}>{text}</Text></View>)}</View>
          </View>
          <View onLayout={event => trackSection('rank-updates', event)} style={panel}><Heading>5. Nâng hạng, cập nhật & lượt không hợp lệ</Heading><PolicyParagraphs items={policySections.rankUpdates} /><PolicyNote>{upgradeExample ? `Ví dụ minh họa theo cấu hình: có ${upgradeExample.minSuccessfulReferrals} người được mời hợp lệ thì tổng vẫn là ${upgradeExample.minSuccessfulReferrals} sau khi lên hạng ${upgradeExample.name}. Nếu một người không còn đơn hợp lệ, số lượt còn ${upgradeExample.minSuccessfulReferrals - 1}; hạng được xác định lại theo bảng cấu hình.` : 'Số lượt không đặt lại khi lên hạng. Lượt không còn đủ điều kiện phải được đối soát; không cộng lượt giả để giữ hạng.'}</PolicyNote></View>
          <View onLayout={event => trackSection('commission', event)} style={panel}><Heading>6. Chính sách hoa hồng sản phẩm & ví dụ</Heading><PolicyParagraphs items={policySections.commission} />
            <Text style={{ marginTop: 12, color: colors.text, fontWeight: '700', fontSize: 14 }}>Ví dụ minh họa, không phải cam kết thu nhập</Text>
            {examples.length ? <><Text style={[s.small, { lineHeight: 21 }]}>Giả định hạng {examples[0].rankName}, tỷ lệ {(examples[0].rate * 100).toLocaleString('vi-VN', { maximumFractionDigits: 2 })}% đang được API trả về, sản phẩm bật Affiliate, không có trần thấp hơn và còn đủ ngân sách.</Text><PolicyTable headings={['Giá trị sản phẩm hợp lệ (giả định)', 'Tỷ lệ hạng từ cấu hình', 'Hoa hồng minh họa']} rows={examples.map(example => [money(example.base), `${(example.rate * 100).toLocaleString('vi-VN', { maximumFractionDigits: 2 })}%`, money(example.amount)])} /></> : <Text style={s.small}>Chưa đủ dữ liệu hạng để tính ví dụ. Không sử dụng tỷ lệ mẫu thay cấu hình.</Text>}
            <PolicyNote>Nếu trần sản phẩm thấp hơn tỷ lệ hạng thì áp dụng trần thấp hơn. Nếu hoa hồng tính được vượt ngân sách còn lại thì số tiền chỉ trong phạm vi ngân sách đó. Ví dụ không bao gồm quy tắc riêng chưa được công bố.</PolicyNote>
          </View>
          <View onLayout={event => trackSection('orders', event)} style={panel}><Heading>7. Đơn hàng, đối soát, hoàn tiền & hủy đơn</Heading><PolicyParagraphs items={policySections.orders} /><PolicyTable headings={['Tình huống', 'Cách xem xét quyền lợi']} rows={[
            ['Đơn mới tạo / chưa thanh toán', 'Chưa đủ điều kiện ghi nhận hoa hồng.'], ['Đơn hoàn tất, đã thanh toán, nguồn hợp lệ', 'Xem xét ghi nhận vào số dư chờ duyệt theo sản phẩm và tỷ lệ áp dụng.'],
            ['Đang chờ hoàn tiền hoặc xác minh', 'Chưa đủ điều kiện duyệt; cần kiểm tra kết quả xử lý.'], ['Đã hoàn tiền / giao dịch không hợp lệ', 'Không đủ điều kiện; điều chỉnh lượt hợp lệ và thu hồi hoa hồng liên quan theo đối soát.'],
          ]} /></View>
          <View onLayout={event => trackSection('payment', event)} style={panel}><Heading>8. Số dư hoa hồng, rút tiền & thanh toán</Heading><PolicyParagraphs items={policySections.payment} />
            <PolicyTable headings={['Loại số dư', 'Ý nghĩa']} rows={[
              ['Chờ duyệt', 'Chưa được sử dụng để rút tiền.'], ['Khả dụng', 'Đã duyệt, sau điều chỉnh; được xem xét khi gửi yêu cầu rút hợp lệ.'], ['Cần cấn trừ', 'Khoản hoa hồng phải thu hồi; có thể ảnh hưởng việc rút hoặc duyệt chi.'],
            ]} />
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 4 }}>Thông số được công bố từ cấu hình</Text>
            <PolicyTable headings={['Thông số', 'Giá trị công bố']} rows={policyTerms(policy.data).map(term => [term.label, term.value])} />
            <PolicyNote>Thời gian chờ duyệt không phải thời gian thanh toán. “Chưa công bố” không có nghĩa là 0 ngày, miễn phí, không có ngưỡng hoặc luôn chấp nhận nguồn gần nhất. Nếu không tải được cấu hình, chưa thể xác minh các thông số này.</PolicyNote>
            <View style={{ alignSelf: 'flex-start', marginTop: 10 }}><Action title="Yêu cầu rút tiền" outline onPress={() => router.push(user ? '/withdrawal' : '/login')} /></View>
          </View>
          <View onLayout={event => trackSection('rights', event)} style={panel}><Heading>9. Quyền lợi & trách nhiệm người tham gia</Heading><PolicyParagraphs items={policySections.rights} /></View>
          <View onLayout={event => trackSection('rules', event)} style={panel}><Heading>10. Quy định & điều kiện: hành vi cấm, xử lý</Heading><PolicyParagraphs items={policySections.prohibited} /><PolicyNote>Phần điều khoản xử lý cần được đơn vị vận hành phê duyệt trước khi áp dụng như quy định chính thức. Không tự đặt thêm chế tài bằng nội dung giao diện.</PolicyNote></View>
          <View onLayout={event => trackSection('disputes', event)} style={panel}><Heading>11. Khiếu nại, tranh chấp & thay đổi chính sách</Heading><PolicyParagraphs items={policySections.disputes} />
            <PolicyNote>Email tiếp nhận: {policy.data?.complaintEmail || unpublished}.{ '\n' }Thời hạn phản hồi nội bộ: {policy.data?.complaintResponseTime || unpublished}. Việc chưa công bố thời hạn nội bộ không loại trừ thời hạn bắt buộc theo pháp luật áp dụng.</PolicyNote>
            <View style={{ alignSelf: 'flex-start', marginTop: 10 }}><Action title="Gửi phản ánh / khiếu nại" outline onPress={() => router.push(user ? '/feedback' : '/login')} /></View>
          </View>
          <View onLayout={event => trackSection('faq', event)} style={panel}><Heading>12. Câu hỏi thường gặp</Heading>{questions.map(({ id, question, answer }, index) => <View key={id} style={{ borderBottomWidth: 1, borderColor: colors.border, paddingVertical: 4 }}><Pressable accessibilityRole="button" accessibilityLabel={question} accessibilityState={{ expanded: openQuestion === index }} onPress={() => setOpenQuestion(openQuestion === index ? null : index)} style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12 }}><Text style={{ flex: 1, fontSize: 14, lineHeight: 22, color: colors.text, fontWeight: '600' }}>{index + 1}. {question}</Text>{openQuestion === index ? <ChevronUp size={17} color={colors.primary} /> : <ChevronDown size={17} color={colors.primary} />}</Pressable>{openQuestion === index && <Text selectable style={{ color: colors.text, fontSize: 14, paddingBottom: 12, lineHeight: 23 }}>{answer}</Text>}</View>)}</View>
        </ScrollView>
      </View>
    </View></View>
  </SafeAreaView>;
}
