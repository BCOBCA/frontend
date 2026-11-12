import { expect, it } from 'vitest';
import { gridItemWidth } from '../src/components/common/grid-layout';

it.each([
  [393.6 - 16, 2, 8], // Product grid at iPhone 16 width with browser scaling.
  [393.6 - 24, 2, 8], // Brand covers.
  [393.6 - 24, 2, 10], // Categories.
  [393.6 - 24, 2, 12], // Offers.
  [393.6 - 56, 3, 8], // Brand directory.
  [1179.6 - 16, 6, 12],
])('keeps every card on the intended row at fractional width %s', (available, columns, gap) => {
  const width = gridItemWidth(available, columns, gap);
  expect(Math.round(width) * columns + gap * (columns - 1)).toBeLessThanOrEqual(available);
  expect(available - (width * columns + gap * (columns - 1))).toBeLessThan(columns + 1);
});

it.each([[378, 377.6, 8], [370, 369.6, 8], [370, 369.6, 10], [370, 369.6, 12]])(
  'handles rounded layout reports of %s for an actual width of %s', (reported, actual, gap) => {
    const width = gridItemWidth(reported, 2, gap);
    expect(width * 2 + gap).toBeLessThanOrEqual(actual);
  },
);

it('does not produce negative widths before the grid is measured', () => {
  expect(gridItemWidth(0, 2, 12)).toBe(0);
});
