import type { MembershipProgress } from '../../types/api';

export const guestMembershipProgress: MembershipProgress = {
  level: 1,
  minPoints: 0,
  nextLevel: 2,
  nextLevelMinPoints: 100,
  pointsToNextLevel: 100,
  progressPercent: 0,
  benefits: [],
};

export function membershipProgressText(progress?: MembershipProgress | null, points?: number) {
  return {
    level: progress ? `Lv.${progress.level}` : 'Lv.—',
    next: progress ? progress.nextLevel === null ? 'Đã đạt level cao nhất' : `Còn ${progress.pointsToNextLevel.toLocaleString('vi-VN')} điểm lên Lv.${progress.nextLevel}` : '—',
    balance: points === undefined ? '— điểm' : `${points.toLocaleString('vi-VN')} điểm`,
    percent: progress ? Math.max(0, Math.min(100, progress.progressPercent)) : 0,
  };
}
