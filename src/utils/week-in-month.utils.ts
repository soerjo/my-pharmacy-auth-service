/**
 * Calculates the number of Sundays in a given month.
 * @param year - The full year (e.g., 2024)
 * @param month - The month number (1-12)
 * @returns The number of Sundays in the specified month
 */
export function getWeeksInMonth(year: number, month: number): number {
  let weeks: number = 0;
  const date = new Date();
  date.setFullYear(year);
  date.setMonth(month - 1);

  for (let index = 1; index < 31; index++) {
    date.setDate(index);

    if (date.getDay() == 0) {
      weeks++;
    }
  }

  return weeks;
}
