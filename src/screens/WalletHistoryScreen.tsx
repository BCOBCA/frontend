import { useEffect, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { LoginNotice, Page } from '../components/common/ui';
import { WalletHistoryView } from '../components/affiliate/WalletHistoryView';
import { walletHistoryPath, walletHistoryRow, withdrawalHistoryRow, type WalletHistoryEntry, type WalletHistoryFilter, type WalletHistoryTab, type WithdrawalHistoryEntry } from '../components/affiliate/wallet-history';
import { request } from '../services/api';
import { useAuth } from '../stores/auth';
import type { Page as ResultPage } from '../types/api';

export default function WalletHistoryScreen() {
  const user = useAuth(state => state.user);
  return <Page title="Lịch sử ví Affiliate" back footerTab="member">{user ? <WalletHistoryController key={user.id} userId={user.id} /> : <LoginNotice />}</Page>;
}

export function WalletHistoryController({ userId }: { userId: string }) {
  const { width } = useWindowDimensions();
  const [draft, setDraft] = useState('');
  const [filter, setFilter] = useState<WalletHistoryFilter>({ tab: 'ledger', period: 'all', kind: 'all', search: '', page: 1 });
  useEffect(() => {
    const search = draft.trim().slice(0, 200); if (search === filter.search) return;
    const timer = setTimeout(() => setFilter(current => ({ ...current, search, page: 1 })), 300); return () => clearTimeout(timer);
  }, [draft, filter.search]);
  const query = useQuery({ queryKey: ['wallet-transactions', userId, filter.tab, filter.period, filter.kind, filter.search, filter.page], queryFn: () => request<ResultPage<WalletHistoryEntry | WithdrawalHistoryEntry>>('GET', walletHistoryPath(filter)) });
  const submitSearch = () => { const search = draft.trim().slice(0, 200); setDraft(search); setFilter(current => ({ ...current, search, page: 1 })); };
  const tab = (value: WalletHistoryTab) => { setDraft(''); setFilter(current => ({ ...current, tab: value, kind: 'all', search: '', page: 1 })); };
  return <WalletHistoryView filter={filter} draft={draft} rows={(query.data?.items ?? []).map(entry => 'referenceType' in entry ? walletHistoryRow(entry) : withdrawalHistoryRow(entry))} loading={query.isLoading} error={query.error} totalPages={query.data?.totalPages ?? 0} width={width}
    onTab={tab} onPeriod={period => setFilter(current => ({ ...current, period, page: 1 }))} onKind={kind => setFilter(current => ({ ...current, kind, page: 1 }))} onSearch={setDraft} onSubmitSearch={submitSearch} onPage={page => setFilter(current => ({ ...current, page }))} onRetry={() => void query.refetch()} />;
}
