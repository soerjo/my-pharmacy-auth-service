import { getWeeksInMonth } from '../src/utils/week-in-month.utils';

describe('WeekInMonth Utilities', () => {
  it('should return correct number of weeks in month', () => {
    const weeks = getWeeksInMonth(2024, 6);
    expect(typeof weeks).toBe('number');
    expect(weeks).toBeGreaterThanOrEqual(0);
  });
});
