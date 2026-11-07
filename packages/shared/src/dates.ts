import { LOCALE, REDEEM_EARLY_MINUTES, TIME_ZONE, type OfferType } from './constants';

/**
 * Datums- und Zeithelfer. Alles wird in Europe/Berlin angezeigt – unabhängig
 * von der Zeitzone des Geräts oder Servers. Nur `Intl` (läuft in Browser, Node und Hermes).
 */

export type DateInput = Date | string | number;

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function toDate(value: DateInput): Date {
  return value instanceof Date ? value : new Date(value);
}

const fmt = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(LOCALE, { timeZone: TIME_ZONE, ...options });

const dateFmt = fmt({ weekday: 'short', day: 'numeric', month: 'short' });
const dateShortFmt = fmt({ day: 'numeric', month: 'short' });
const dateLongFmt = fmt({ weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const timeFmt = fmt({ hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
const partsFmt = fmt({
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

interface ZonedParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

/** Kalenderbestandteile eines Zeitpunkts in Berlin. */
export function berlinParts(value: DateInput): ZonedParts {
  const parts: Record<string, number> = {};
  for (const p of partsFmt.formatToParts(toDate(value))) {
    if (p.type !== 'literal') parts[p.type] = Number(p.value);
  }
  return {
    year: parts.year ?? 0,
    month: parts.month ?? 0,
    day: parts.day ?? 0,
    hour: (parts.hour ?? 0) % 24,
    minute: parts.minute ?? 0,
    second: parts.second ?? 0,
  };
}

/** Fortlaufende Tagesnummer des Berliner Kalendertags (für „heute“/„morgen“-Vergleiche). */
function berlinDayNumber(value: DateInput): number {
  const { year, month, day } = berlinParts(value);
  return Math.round(Date.UTC(year, month - 1, day) / DAY);
}

const WEEKDAYS_SHORT = ['So.', 'Mo.', 'Di.', 'Mi.', 'Do.', 'Fr.', 'Sa.'] as const;

/** Kurzer Wochentag in Berlin: `"Do."` (feste Kürzel – ICU-Ausgaben unterscheiden sich je Plattform). */
export function formatWeekday(value: DateInput): string {
  const { year, month, day } = berlinParts(value);
  return WEEKDAYS_SHORT[new Date(Date.UTC(year, month - 1, day)).getUTCDay()] ?? '';
}

/** Wie viele Berliner Kalendertage liegt `b` nach `a`? (0 = gleicher Tag) */
export function calendarDaysBetween(a: DateInput, b: DateInput): number {
  return berlinDayNumber(b) - berlinDayNumber(a);
}

// ---------------------------------------------------------------------------
// Formatierung
// ---------------------------------------------------------------------------

/** `"Sa., 8. Nov."` */
export const formatDate = (value: DateInput) => dateFmt.format(toDate(value));
/** `"8. Nov."` */
export const formatDateShort = (value: DateInput) => dateShortFmt.format(toDate(value));
/** `"Samstag, 8. November 2026"` */
export const formatDateLong = (value: DateInput) => dateLongFmt.format(toDate(value));
/** `"18:30"` */
export const formatTime = (value: DateInput) => timeFmt.format(toDate(value));
/** `"Sa., 8. Nov., 18:30"` */
export const formatDateTime = (value: DateInput) => `${formatDate(value)}, ${formatTime(value)}`;

/**
 * Zeitspanne eines Einzeltermins:
 * gleicher Tag → `"Sa., 8. Nov., 18:30–21:00"`, sonst `"Sa., 8. Nov., 18:30 – So., 9. Nov., 02:00"`.
 */
export function formatTimeRange(start: DateInput, end: DateInput): string {
  if (calendarDaysBetween(start, end) === 0) {
    return `${formatDateTime(start)}–${formatTime(end)}`;
  }
  return `${formatDateTime(start)} – ${formatDateTime(end)}`;
}

/** Einlösezeitraum eines Zeitraum-Angebots: `"8. Nov. – 30. Nov."` */
export function formatPeriod(start: DateInput, end: DateInput): string {
  return `${formatDateShort(start)} – ${formatDateShort(end)}`;
}

/** Zeitangabe passend zur Angebotsart. */
export function formatOfferWhen(offer: OfferTiming): string {
  return offer.type === 'single'
    ? formatTimeRange(offer.startsAt, offer.endsAt)
    : formatPeriod(offer.startsAt, offer.endsAt);
}

// ---------------------------------------------------------------------------
// Eingaben (z. B. <input type="datetime-local">) ↔ Zeitpunkt
// ---------------------------------------------------------------------------

/** Zeitpunkt → `"2026-11-08T18:30"` in Berliner Ortszeit. */
export function toBerlinInputValue(value: DateInput): string {
  const p = berlinParts(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}

/**
 * Berliner Ortszeit `"2026-11-08T18:30"` → `Date` (UTC-Zeitpunkt).
 * Berücksichtigt Sommer-/Winterzeit. Gibt `null` bei ungültiger Eingabe zurück.
 */
export function fromBerlinInputValue(input: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(input.trim());
  if (!m) return null;
  const [, y, mo, d, h, mi, s] = m.map(Number) as [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ];
  const wallClockAsUtc = Date.UTC(y, mo - 1, d, h, mi, Number.isNaN(s) ? 0 : s);
  const offsetAt = (ts: number) => {
    const p = berlinParts(ts);
    return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - ts;
  };
  let ts = wallClockAsUtc - offsetAt(wallClockAsUtc);
  const corrected = wallClockAsUtc - offsetAt(ts);
  if (corrected !== ts) ts = corrected;
  return new Date(ts);
}

// ---------------------------------------------------------------------------
// Fachliche Zeitlogik (nur Anzeige – verbindlich prüft die Datenbank)
// ---------------------------------------------------------------------------

export interface OfferTiming {
  type: OfferType;
  startsAt: DateInput;
  endsAt: DateInput;
}

/** Sortierschlüssel „als Nächstes relevant“: Einzeltermin → Start, Zeitraum → Ende. */
export function relevantAt(offer: OfferTiming): Date {
  return toDate(offer.type === 'single' ? offer.startsAt : offer.endsAt);
}

/** Bis wann darf ein Einzeltermin-Code storniert werden? (Zeitraum: bis zum Ende) */
export function cancellationDeadline(offer: OfferTiming, deadlineHours: number): Date {
  return offer.type === 'single'
    ? new Date(toDate(offer.startsAt).getTime() - deadlineHours * HOUR)
    : toDate(offer.endsAt);
}

/** Ab wann darf eingelöst werden? Einzeltermin: 1 Std. vor Start, Zeitraum: ab Start. */
export function redeemWindowStart(offer: OfferTiming): Date {
  const start = toDate(offer.startsAt).getTime();
  return new Date(offer.type === 'single' ? start - REDEEM_EARLY_MINUTES * MINUTE : start);
}

export type LabelTone = 'urgent' | 'neutral' | 'muted';
export interface Label {
  text: string;
  tone: LabelTone;
}

/**
 * Kurzes Zeitlabel für Karten und Badges, z. B.
 * „startet in 45 Min.“, „startet in 2 Std.“, „heute, 18:30“, „morgen, 18:30“,
 * „läuft gerade“, „endet in 5 Std.“, „noch 4 Tage“, „bis 30. Nov.“, „abgelaufen“.
 */
export function offerTimeLabel(offer: OfferTiming, now: DateInput = new Date()): Label {
  const nowMs = toDate(now).getTime();
  const start = toDate(offer.startsAt);
  const end = toDate(offer.endsAt);
  const toStart = start.getTime() - nowMs;
  const toEnd = end.getTime() - nowMs;

  if (offer.type === 'single') {
    if (toEnd <= 0) return { text: 'beendet', tone: 'muted' };
    if (toStart <= 0) return { text: 'läuft gerade', tone: 'urgent' };
    if (toStart < HOUR) {
      return {
        text: `startet in ${Math.max(1, Math.ceil(toStart / MINUTE))} Min.`,
        tone: 'urgent',
      };
    }
    if (toStart < 6 * HOUR) {
      return { text: `startet in ${Math.round(toStart / HOUR)} Std.`, tone: 'urgent' };
    }
    const days = calendarDaysBetween(now, start);
    if (days === 0) return { text: `heute, ${formatTime(start)}`, tone: 'neutral' };
    if (days === 1) return { text: `morgen, ${formatTime(start)}`, tone: 'neutral' };
    if (days < 7) {
      return { text: `${formatWeekday(start)}, ${formatTime(start)}`, tone: 'neutral' };
    }
    return { text: formatDateTime(start), tone: 'neutral' };
  }

  // Zeitraum
  if (toEnd <= 0) return { text: 'abgelaufen', tone: 'muted' };
  if (toStart > 0) {
    const days = calendarDaysBetween(now, start);
    if (days === 0) return { text: `ab heute, ${formatTime(start)}`, tone: 'neutral' };
    if (days === 1) return { text: 'ab morgen', tone: 'neutral' };
    return { text: `ab ${formatDate(start)}`, tone: 'neutral' };
  }
  if (toEnd < HOUR) {
    return { text: `endet in ${Math.max(1, Math.ceil(toEnd / MINUTE))} Min.`, tone: 'urgent' };
  }
  if (toEnd < DAY) return { text: `endet in ${Math.round(toEnd / HOUR)} Std.`, tone: 'urgent' };
  const daysLeft = calendarDaysBetween(now, end);
  if (daysLeft === 1) return { text: 'endet morgen', tone: 'urgent' };
  if (daysLeft <= 7) return { text: `noch ${daysLeft} Tage`, tone: 'neutral' };
  return { text: `bis ${formatDateShort(end)}`, tone: 'neutral' };
}

/** Label für freie Plätze: „ausgebucht“, „noch 1 Platz“, „noch 3 Plätze“, „12 Plätze frei“. */
export function seatsLabel(freeSeats: number): Label {
  if (freeSeats <= 0) return { text: 'ausgebucht', tone: 'muted' };
  if (freeSeats === 1) return { text: 'noch 1 Platz', tone: 'urgent' };
  if (freeSeats <= 5) return { text: `noch ${freeSeats} Plätze`, tone: 'urgent' };
  return { text: `${freeSeats} Plätze frei`, tone: 'neutral' };
}
