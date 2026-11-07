import { describe, expect, it } from 'vitest';

import {
  discountPercent,
  formatDiscount,
  formatPrice,
  maxDealPriceCents,
  meetsMinDiscount,
  parseEuroToCents,
  savingsCents,
} from './pricing';

const NBSP = ' ';

describe('discountPercent', () => {
  it('rundet ab, damit nie zu viel Rabatt angezeigt wird', () => {
    expect(discountPercent(4900, 3400)).toBe(30); // 30,6 %
    expect(discountPercent(10000, 8000)).toBe(20);
    expect(discountPercent(999, 1)).toBe(99);
  });
  it('gibt 0 bei ungültigen Werten', () => {
    expect(discountPercent(0, 0)).toBe(0);
    expect(discountPercent(1000, 1000)).toBe(0);
    expect(discountPercent(1000, 1200)).toBe(0);
    expect(discountPercent(Number.NaN, 10)).toBe(0);
  });
});

describe('meetsMinDiscount', () => {
  it('prüft exakt mit Integer-Rechnung wie die DB', () => {
    expect(meetsMinDiscount(10000, 8000, 20)).toBe(true);
    expect(meetsMinDiscount(10000, 8001, 20)).toBe(false);
    expect(meetsMinDiscount(4900, 3920, 20)).toBe(true);
    expect(meetsMinDiscount(4900, 3921, 20)).toBe(false);
  });
  it('lehnt 0- und Negativpreise ab', () => {
    expect(meetsMinDiscount(1000, 0, 20)).toBe(false);
    expect(meetsMinDiscount(0, 0, 0)).toBe(false);
  });
  it('maxDealPriceCents passt zu meetsMinDiscount', () => {
    for (const original of [999, 1000, 4900, 12345]) {
      const max = maxDealPriceCents(original, 20);
      expect(meetsMinDiscount(original, max, 20)).toBe(true);
      expect(meetsMinDiscount(original, max + 1, 20)).toBe(false);
    }
  });
});

describe('formatPrice', () => {
  it('zeigt ganze Euro ohne Nachkommastellen', () => {
    expect(formatPrice(4900)).toBe(`49${NBSP}€`);
  });
  it('zeigt Cent mit deutschem Komma', () => {
    expect(formatPrice(4950)).toBe(`49,50${NBSP}€`);
    expect(formatPrice(5)).toBe(`0,05${NBSP}€`);
    expect(formatPrice(123456)).toBe(`1.234,56${NBSP}€`);
  });
  it('alwaysCents erzwingt zwei Stellen', () => {
    expect(formatPrice(4900, { alwaysCents: true })).toBe(`49,00${NBSP}€`);
  });
});

describe('formatDiscount / savingsCents', () => {
  it('formatiert das Rabatt-Badge', () => {
    expect(formatDiscount(30)).toBe(`−30${NBSP}%`);
  });
  it('berechnet die Ersparnis', () => {
    expect(savingsCents(4900, 3400)).toBe(1500);
    expect(savingsCents(1000, 1200)).toBe(0);
  });
});

describe('parseEuroToCents', () => {
  it.each([
    ['49', 4900],
    ['49,5', 4950],
    ['49,50', 4950],
    ['49.50', 4950],
    [' 49,50 € ', 4950],
    ['1.234,00', 123400],
    ['0,05', 5],
  ])('%s → %i', (input, cents) => {
    expect(parseEuroToCents(input)).toBe(cents);
  });
  it.each(['', 'abc', '49,505', '-5', '4,9,0'])('lehnt %s ab', (input) => {
    expect(parseEuroToCents(input)).toBeNull();
  });
});
