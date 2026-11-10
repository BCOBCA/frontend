import { describe, expect, it } from 'vitest';
import { policyDate, policyPublication, policyTerms, commissionExamples, policyQuestions } from '../src/components/affiliate/affiliate-policy-content';
import type { AffiliatePolicy } from '../src/types/api';

const policy: AffiliatePolicy = { approvalStatus: 'DRAFT', version: null, updatedOn: null, effectiveOn: null, approvedOn: null, attributionDays: null, approvalHoldDays: null, withdrawalFee: null, minimumWithdrawal: null, paymentTime: null, attributionRule: null, complaintEmail: null, complaintResponseTime: null, operatorName: null, operatorAddress: null };

describe('affiliate policy disclosure', () => {
  it('does not invent dates, fees, tracking windows or payout promises', () => {
    expect(policyDate(null)).toBe('Chưa công bố');
    expect(policyDate('2030-02-30')).toBe('Chưa công bố');
    expect(policyDate('2030-11-05')).toBe('05/11/2030');
    expect(policyTerms(policy).every(row => row.value === 'Chưa công bố')).toBe(true);
    expect(policyPublication(policy, '2030-11-05')).toContain('Dự thảo');
    expect(policyPublication(undefined, '2030-11-05')).toContain('Chưa xác minh');
  });
  it('publishes only complete approval metadata and distinguishes future effective dates', () => {
    const approved = { ...policy, approvalStatus: 'APPROVED' as const, version: 'v1', updatedOn: '2030-01-01', approvedOn: '2030-01-02', effectiveOn: '2030-02-01' };
    expect(policyPublication(approved, '2030-01-15')).toContain('Chưa đến ngày hiệu lực');
    expect(policyPublication(approved, '2030-02-01')).toContain('Đã được phê duyệt');
    expect(policyPublication({ ...approved, approvedOn: null }, '2030-02-01')).toContain('Dự thảo');
  });
  it('uses configured values including a zero-day approval hold without inferring zero fees', () => {
    const terms = policyTerms({ ...policy, attributionDays: 21, approvalHoldDays: 0 });
    expect(terms.find(row => row.id === 'tracking')?.value).toBe('21 ngày');
    expect(terms.find(row => row.id === 'hold')?.value).toBe('0 ngày');
    expect(terms.find(row => row.id === 'fee')?.value).toBe('Chưa công bố');
  });
  it('calculates explicitly illustrative examples from API rates only', () => {
    expect(commissionExamples([])).toEqual([]);
    const [example] = commissionExamples([{ rank: 0, name: 'Hạng từ API', minSuccessfulReferrals: 0, commissionRate: 0.0425 }]);
    expect(example.rankName).toBe('Hạng từ API'); expect(example.amount).toBe(example.base * 0.0425);
    expect(commissionExamples([{ rank: 0, name: 'Invalid', minSuccessfulReferrals: 0, commissionRate: 2 }])).toEqual([]);
  });
  it('provides practical FAQ with configuration-backed answers', () => {
    const faq = policyQuestions({ ...policy, attributionDays: 21 });
    expect(faq.length).toBeGreaterThanOrEqual(10);
    expect(new Set(faq.map(item => item.question)).size).toBe(faq.length);
    expect(faq.find(item => item.id === 'tracking')?.answer).toContain('21 ngày');
    expect(faq.find(item => item.id === 'payout')?.answer).toContain('Chưa công bố');
  });
});
