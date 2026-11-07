import { describe, expect, it } from 'vitest';

import {
  locationRegistrationSchema,
  offerCreateSchema,
  offerUpdateSchema,
  redeemCodeSchema,
} from './schemas';

const validOffer = {
  title: 'Pasta-Kochkurs',
  description: 'Frische Pasta von Hand – mit Weinbegleitung.',
  category: 'food',
  type: 'single',
  startsAt: '2026-11-12T17:00:00+01:00',
  endsAt: '2026-11-12T20:00:00+01:00',
  originalPriceCents: 4900,
  dealPriceCents: 3400,
  capacity: 12,
  maxSeatsPerUser: 2,
  address: 'Ludgeristraße 1, 48143 Münster',
  lat: 51.9606,
  lng: 7.6261,
  imagePaths: ['loc-1/a.webp'],
};

describe('offerCreateSchema', () => {
  it('akzeptiert ein gültiges Angebot', () => {
    expect(offerCreateSchema.safeParse(validOffer).success).toBe(true);
  });
  it.each([
    ['Ende vor Start', { endsAt: '2026-11-12T16:00:00+01:00' }, 'endsAt'],
    ['Deal ≥ Original', { dealPriceCents: 4900 }, 'dealPriceCents'],
    ['zu viele Plätze pro Person', { maxSeatsPerUser: 20, capacity: 5 }, 'maxSeatsPerUser'],
    ['keine Bilder', { imagePaths: [] }, 'imagePaths'],
    ['6 Bilder', { imagePaths: ['1', '2', '3', '4', '5', '6'] }, 'imagePaths'],
    ['unbekannte Kategorie', { category: 'bowling' }, 'category'],
    ['Kommapreis', { dealPriceCents: 33.5 }, 'dealPriceCents'],
  ])('lehnt ab: %s', (_name, patch, path) => {
    const result = offerCreateSchema.safeParse({ ...validOffer, ...patch });
    expect(result.success).toBe(false);
    expect(result.error?.issues.some((i) => i.path[0] === path)).toBe(true);
  });
  it('Update erlaubt Teilmengen', () => {
    expect(offerUpdateSchema.safeParse({ title: 'Neuer Titel' }).success).toBe(true);
    expect(offerUpdateSchema.safeParse({ capacity: 0 }).success).toBe(false);
  });
});

describe('locationRegistrationSchema', () => {
  it('validiert E-Mail und Passwort', () => {
    const base = {
      email: 'kontakt@pastaria.de',
      password: 'sehrgeheim',
      companyName: 'Pastaria',
      locationName: 'Pastaria Kreuzviertel',
      address: 'Hoyastraße 5, 48147 Münster',
    };
    expect(locationRegistrationSchema.safeParse(base).success).toBe(true);
    expect(locationRegistrationSchema.safeParse({ ...base, email: 'x' }).success).toBe(false);
    expect(locationRegistrationSchema.safeParse({ ...base, password: 'kurz' }).success).toBe(false);
  });
});

describe('redeemCodeSchema', () => {
  it('akzeptiert Kurzcode und Token', () => {
    expect(redeemCodeSchema.safeParse('k7q4mx').success).toBe(true);
    expect(redeemCodeSchema.safeParse('aZ3_k9-Lm2pQ8xYw1Tb7Vc').success).toBe(true);
    expect(redeemCodeSchema.safeParse('ABC').success).toBe(false);
  });
});
