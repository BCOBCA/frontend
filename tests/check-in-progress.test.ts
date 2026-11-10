import { describe, expect, it } from 'vitest';
import { checkInProgress } from '../src/components/promotions/check-in-progress';

describe('seven-day check-in progress', () => {
  it('starts guests or a reset streak at the first day', () => {
    expect(checkInProgress(0, false)).toEqual({ today: 0, completed: 0 });
  });
  it('keeps today on the claimed day after check-in', () => {
    expect(checkInProgress(3, true)).toEqual({ today: 2, completed: 3 });
    expect(checkInProgress(7, true)).toEqual({ today: 6, completed: 7 });
  });
  it('advances to the next unclaimed day and starts a new week after day seven', () => {
    expect(checkInProgress(3, false)).toEqual({ today: 3, completed: 3 });
    expect(checkInProgress(7, false)).toEqual({ today: 0, completed: 0 });
    expect(checkInProgress(8, true)).toEqual({ today: 0, completed: 1 });
  });
});
