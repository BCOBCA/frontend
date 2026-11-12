import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { LoginNotice, Page } from '../src/components/common/ui';
import { FeedbackHistoryView } from '../src/components/support/FeedbackHistoryView';
import { feedbackHistoryPath, type FeedbackAttachment, type SentFeedback } from '../src/components/support/feedback-history';
import { errorMessage, request } from '../src/services/api';
import { useAuth } from '../src/stores/auth';
import { useToast } from '../src/stores/toast';
import type { Page as ResultPage } from '../src/types/api';

export default function FeedbackHistory() {
  const user = useAuth(state => state.user);
  const showToast = useToast(state => state.show);
  const [draft, setDraft] = useState('');
  const [filter, setFilter] = useState({ page: 1, search: '' });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  useEffect(() => {
    const search = draft.trim().slice(0, 200);
    if (search === filter.search) return;
    const timeout = setTimeout(() => { setFilter({ page: 1, search }); setExpandedId(null); }, 300);
    return () => clearTimeout(timeout);
  }, [draft, filter.search]);
  const query = useQuery({ queryKey: ['feedback-history', user?.id, filter.page, filter.search], queryFn: () => request<ResultPage<SentFeedback>>('GET', feedbackHistoryPath(filter.page, filter.search)), enabled: !!user });
  const openAttachment = async (attachment: FeedbackAttachment) => {
    try { await Linking.openURL(attachment.url); }
    catch { showToast('Không thể mở tệp. Vui lòng thử lại.', 'error'); }
  };
  const submitSearch = (value: string) => { const search = value.trim().slice(0, 200); setDraft(search); setFilter({ page: 1, search }); setExpandedId(null); };
  return <Page title="Phản hồi đã gửi" back footerTab="member" search={draft} searchPlaceholder="Tìm kiếm phản hồi..." onSearch={setDraft} onSubmitSearch={submitSearch}>
    {!user ? <LoginNotice /> : <FeedbackHistoryView items={query.data?.items ?? []} loading={query.isLoading} error={query.error ? errorMessage(query.error) : undefined} search={filter.search} page={filter.page} totalPages={query.data?.totalPages ?? 0} expandedId={expandedId} onToggle={id => setExpandedId(current => current === id ? null : id)} onOpenAttachment={openAttachment} onRetry={() => void query.refetch()} onCreate={() => router.push('/feedback')} onPage={page => { setFilter(current => ({ ...current, page })); setExpandedId(null); }} />}
  </Page>;
}
