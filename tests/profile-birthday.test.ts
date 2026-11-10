import { describe, expect, it } from 'vitest';
import { birthdayDisplay, birthdayInput } from '../src/components/profile/birthday-input';
import { profileSchema } from '../src/components/profile/profile-data';

describe('birthday entry', () => {
  it('displays and round trips date-only API values without timezones', () => {
    expect(birthdayDisplay('2000-02-29')).toBe('29/02/2000');
    expect(birthdayInput('29/02/2000')).toBe('2000-02-29');
    expect(birthdayDisplay(birthdayInput('31/12/2000'))).toBe('31/12/2000');
  });

  it('keeps empty, partial and invalid input available for correction', () => {
    for (const value of ['', '2', '29/', '29/02/20', 'bad']) {
      expect(birthdayInput(value)).toBe(value);
      expect(birthdayDisplay(value)).toBe(value);
    }
  });

  it('uses the existing validation for typed birthdays and leap years', () => {
    for (const value of ['29/02/2001', '31/04/2000', '01/01/1899', '01/01/2099', '29/02/20']) {
      expect(profileSchema.shape.dateOfBirth.safeParse(birthdayInput(value)).success).toBe(false);
    }
    for (const value of ['', '29/02/2000', '31/12/2000']) {
      expect(profileSchema.shape.dateOfBirth.safeParse(birthdayInput(value)).success).toBe(true);
    }
  });
});
