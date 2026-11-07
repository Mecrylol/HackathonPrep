import { describe, expect, it } from 'vitest';

import { displayNameForLocation, parseShortCode } from './vouchers';

describe('parseShortCode', () => {
  it.each([
    ['K7Q-4MX', 'K7Q-4MX'],
    ['k7q4mx', 'K7Q-4MX'],
    [' k7q 4mx ', 'K7Q-4MX'],
  ])('%s → %s', (input, out) => {
    expect(parseShortCode(input)).toBe(out);
  });
  it.each(['K7Q-4M', 'K0Q-4MX', 'KIQ-4MX', 'K7Q-4MXX', ''])('lehnt %s ab', (input) => {
    expect(parseShortCode(input)).toBeNull();
  });
});

describe('displayNameForLocation', () => {
  it('zeigt nur Vorname und Initial', () => {
    expect(displayNameForLocation('Lena', 'Schulte')).toBe('Lena S.');
    expect(displayNameForLocation(' Lena ', ' ')).toBe('Lena');
  });
});
