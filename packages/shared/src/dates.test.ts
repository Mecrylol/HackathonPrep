import { describe, expect, it } from 'vitest';

import {
  calendarDaysBetween,
  cancellationDeadline,
  formatDate,
  formatDateTime,
  formatOfferWhen,
  formatPeriod,
  formatTime,
  formatTimeRange,
  fromBerlinInputValue,
  offerTimeLabel,
  redeemWindowStart,
  relevantAt,
  seatsLabel,
  toBerlinInputValue,
} from './dates';

// Tests laufen mit TZ=UTC (vitest.config.ts) – die Ausgabe muss trotzdem Berliner Zeit sein.
// 2026-11-08 ist ein Sonntag, Winterzeit (UTC+1).
const NOW = new Date('2026-11-08T10:00:00Z'); // So., 11:00 Berlin

describe('Formatierung in Europe/Berlin', () => {
  it('formatiert Datum und Uhrzeit unabhängig von der Geräte-Zeitzone', () => {
    expect(formatTime('2026-11-08T17:30:00Z')).toBe('18:30');
    expect(formatDate('2026-11-08T17:30:00Z')).toBe('So., 8. Nov.');
    expect(formatDateTime('2026-11-08T17:30:00Z')).toBe('So., 8. Nov., 18:30');
  });
  it('berücksichtigt die Sommerzeit', () => {
    expect(formatTime('2026-07-01T16:30:00Z')).toBe('18:30');
  });
  it('kürzt Zeitspannen am selben Tag', () => {
    expect(formatTimeRange('2026-11-08T17:30:00Z', '2026-11-08T20:00:00Z')).toBe(
      'So., 8. Nov., 18:30–21:00',
    );
    expect(formatTimeRange('2026-11-08T22:00:00Z', '2026-11-09T01:00:00Z')).toBe(
      'So., 8. Nov., 23:00 – Mo., 9. Nov., 02:00',
    );
  });
  it('formatiert Zeiträume', () => {
    expect(formatPeriod('2026-11-08T00:00:00Z', '2026-11-30T22:00:00Z')).toBe('8. Nov. – 30. Nov.');
    expect(
      formatOfferWhen({
        type: 'period',
        startsAt: '2026-11-08T00:00:00Z',
        endsAt: '2026-11-30T22:00:00Z',
      }),
    ).toBe('8. Nov. – 30. Nov.');
  });
  it('zählt Berliner Kalendertage, nicht 24-Std.-Blöcke', () => {
    // 23:30 Berlin → 00:30 Berlin am Folgetag = 1 Tag
    expect(calendarDaysBetween('2026-11-08T22:30:00Z', '2026-11-08T23:30:00Z')).toBe(1);
    expect(calendarDaysBetween('2026-11-08T00:00:00Z', '2026-11-08T22:00:00Z')).toBe(0);
  });
});

describe('Eingabefelder (datetime-local)', () => {
  it('wandelt Berliner Ortszeit hin und zurück', () => {
    expect(toBerlinInputValue('2026-11-08T17:30:00Z')).toBe('2026-11-08T18:30');
    expect(fromBerlinInputValue('2026-11-08T18:30')?.toISOString()).toBe(
      '2026-11-08T17:30:00.000Z',
    );
    expect(fromBerlinInputValue('2026-07-01T18:30')?.toISOString()).toBe(
      '2026-07-01T16:30:00.000Z',
    );
  });
  it('funktioniert an den Umstellungstagen', () => {
    // 29.03.2026: 02:00 → 03:00 (Sommerzeit beginnt)
    expect(fromBerlinInputValue('2026-03-29T01:30')?.toISOString()).toBe(
      '2026-03-29T00:30:00.000Z',
    );
    expect(fromBerlinInputValue('2026-03-29T03:30')?.toISOString()).toBe(
      '2026-03-29T01:30:00.000Z',
    );
    // 25.10.2026: 03:00 → 02:00 (Winterzeit beginnt)
    expect(fromBerlinInputValue('2026-10-25T04:00')?.toISOString()).toBe(
      '2026-10-25T03:00:00.000Z',
    );
  });
  it('lehnt ungültige Eingaben ab', () => {
    expect(fromBerlinInputValue('08.11.2026 18:30')).toBeNull();
  });
});

describe('Fachliche Zeitlogik', () => {
  const single = {
    type: 'single' as const,
    startsAt: '2026-11-08T17:00:00Z',
    endsAt: '2026-11-08T19:00:00Z',
  };
  const period = {
    type: 'period' as const,
    startsAt: '2026-11-01T00:00:00Z',
    endsAt: '2026-11-20T22:59:00Z',
  };

  it('relevantAt: Einzeltermin → Start, Zeitraum → Ende', () => {
    expect(relevantAt(single).toISOString()).toBe('2026-11-08T17:00:00.000Z');
    expect(relevantAt(period).toISOString()).toBe('2026-11-20T22:59:00.000Z');
  });
  it('Stornofrist und Einlösebeginn', () => {
    expect(cancellationDeadline(single, 24).toISOString()).toBe('2026-11-07T17:00:00.000Z');
    expect(cancellationDeadline(period, 24).toISOString()).toBe('2026-11-20T22:59:00.000Z');
    expect(redeemWindowStart(single).toISOString()).toBe('2026-11-08T16:00:00.000Z');
    expect(redeemWindowStart(period).toISOString()).toBe('2026-11-01T00:00:00.000Z');
  });
});

describe('offerTimeLabel – Einzeltermin', () => {
  const at = (startIso: string, endIso = '2026-12-31T00:00:00Z') => ({
    type: 'single' as const,
    startsAt: startIso,
    endsAt: endIso,
  });

  it.each([
    ['2026-11-08T10:45:00Z', 'startet in 45 Min.', 'urgent'],
    ['2026-11-08T10:00:20Z', 'startet in 1 Min.', 'urgent'],
    ['2026-11-08T12:00:00Z', 'startet in 2 Std.', 'urgent'],
    ['2026-11-08T17:30:00Z', 'heute, 18:30', 'neutral'],
    ['2026-11-09T17:30:00Z', 'morgen, 18:30', 'neutral'],
    ['2026-11-12T17:30:00Z', 'Do., 18:30', 'neutral'],
    ['2026-11-20T17:30:00Z', 'Fr., 20. Nov., 18:30', 'neutral'],
  ])('Start %s → „%s“', (start, text, tone) => {
    expect(offerTimeLabel(at(start), NOW)).toEqual({ text, tone });
  });
  it('läuft gerade / beendet', () => {
    expect(offerTimeLabel(at('2026-11-08T09:00:00Z', '2026-11-08T11:00:00Z'), NOW).text).toBe(
      'läuft gerade',
    );
    expect(offerTimeLabel(at('2026-11-08T07:00:00Z', '2026-11-08T09:00:00Z'), NOW).text).toBe(
      'beendet',
    );
  });
});

describe('offerTimeLabel – Zeitraum', () => {
  const p = (start: string, end: string) => ({
    type: 'period' as const,
    startsAt: start,
    endsAt: end,
  });

  it.each([
    [p('2026-11-01T00:00:00Z', '2026-11-08T10:30:00Z'), 'endet in 30 Min.'],
    [p('2026-11-01T00:00:00Z', '2026-11-08T15:00:00Z'), 'endet in 5 Std.'],
    [p('2026-11-01T00:00:00Z', '2026-11-09T20:00:00Z'), 'endet morgen'],
    [p('2026-11-01T00:00:00Z', '2026-11-12T20:00:00Z'), 'noch 4 Tage'],
    [p('2026-11-01T00:00:00Z', '2026-11-30T20:00:00Z'), 'bis 30. Nov.'],
    [p('2026-11-08T13:00:00Z', '2026-11-30T20:00:00Z'), 'ab heute, 14:00'],
    [p('2026-11-09T08:00:00Z', '2026-11-30T20:00:00Z'), 'ab morgen'],
    [p('2026-11-14T08:00:00Z', '2026-11-30T20:00:00Z'), 'ab Sa., 14. Nov.'],
    [p('2026-11-01T00:00:00Z', '2026-11-08T09:00:00Z'), 'abgelaufen'],
  ])('%o → „%s“', (offer, text) => {
    expect(offerTimeLabel(offer, NOW).text).toBe(text);
  });
});

describe('seatsLabel', () => {
  it.each([
    [0, 'ausgebucht', 'muted'],
    [-1, 'ausgebucht', 'muted'],
    [1, 'noch 1 Platz', 'urgent'],
    [3, 'noch 3 Plätze', 'urgent'],
    [12, '12 Plätze frei', 'neutral'],
  ])('%i → „%s“', (free, text, tone) => {
    expect(seatsLabel(free)).toEqual({ text, tone });
  });
});
