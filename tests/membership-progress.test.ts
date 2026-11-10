import { describe, expect, it } from 'vitest';
import { guestMembershipProgress, membershipProgressText } from '../src/components/membership/membership-progress';
import type { MembershipProgress } from '../src/types/api';

const progress: MembershipProgress = { level: 5, minPoints: 1000, nextLevel: 6, nextLevelMinPoints: 1600, pointsToNextLevel: 200, progressPercent: 66.67, benefits: [] };

describe('member level presentation', () => {
  it('shows the server level and remaining points without hardcoded thresholds', () => {
    expect(membershipProgressText(progress, 1400)).toEqual({ level: 'Lv.5', next: 'Còn 200 điểm lên Lv.6', balance: '1.400 điểm', percent: 66.67 });
  });
  it('shows the highest level without suggesting an eleventh level', () => {
    const maximum = { ...progress, level: 10, nextLevel: null, nextLevelMinPoints: null, pointsToNextLevel: 0, progressPercent: 100 };
    expect(membershipProgressText(maximum, 12000).next).toBe('Đã đạt level cao nhất');
  });
  it('shows Lv.1 and the next threshold for guests', () => {
    expect(membershipProgressText(guestMembershipProgress, 0)).toEqual({ level: 'Lv.1', next: 'Còn 100 điểm lên Lv.2', balance: '0 điểm', percent: 0 });
  });
  it('keeps placeholders when authenticated membership data is unavailable', () => {
    expect(membershipProgressText(undefined, undefined)).toEqual({ level: 'Lv.—', next: '—', balance: '— điểm', percent: 0 });
  });
  it('clamps the displayed bar width', () => {
    expect(membershipProgressText({ ...progress, progressPercent: 101 }, 1400).percent).toBe(100);
    expect(membershipProgressText({ ...progress, progressPercent: -1 }, 1400).percent).toBe(0);
  });
});
