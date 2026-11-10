export function checkInProgress(streakDays: number, checkedInToday: boolean) {
  const streak = Math.max(0, Math.trunc(streakDays));
  const completed = checkedInToday && streak > 0 ? (streak - 1) % 7 + 1 : streak % 7;
  return { today: checkedInToday ? Math.max(0, completed - 1) : completed, completed };
}
