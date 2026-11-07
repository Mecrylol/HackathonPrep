import { CURRENCY, LOCALE } from './constants';

/**
 * Rabatt in ganzen Prozent, **abgerundet** – wir zeigen nie mehr Rabatt an, als es wirklich gibt.
 * Beispiel: 4900 → 3400 Cent = 30,6 % → 30.
 */
export function discountPercent(originalCents: number, dealCents: number): number {
  if (!Number.isFinite(originalCents) || !Number.isFinite(dealCents) || originalCents <= 0) {
    return 0;
  }
  if (dealCents >= originalCents) return 0;
  const clampedDeal = Math.max(0, dealCents);
  return Math.floor(((originalCents - clampedDeal) * 100) / originalCents);
}

/**
 * Erfüllt der Preis den Mindestrabatt? Gleiche Integer-Rechnung wie in der DB
 * (`deal * 100 <= original * (100 - min)`), damit Client und Server nie abweichen.
 */
export function meetsMinDiscount(
  originalCents: number,
  dealCents: number,
  minDiscountPercent: number,
): boolean {
  if (originalCents <= 0 || dealCents <= 0) return false;
  return dealCents * 100 <= originalCents * (100 - minDiscountPercent);
}

/** Höchster Deal-Preis (Cent), der den Mindestrabatt gerade noch erfüllt. */
export function maxDealPriceCents(originalCents: number, minDiscountPercent: number): number {
  return Math.floor((originalCents * (100 - minDiscountPercent)) / 100);
}

/** Ersparnis in Cent. */
export function savingsCents(originalCents: number, dealCents: number): number {
  return Math.max(0, originalCents - dealCents);
}

const priceFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const priceFormatterWhole = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/**
 * Preis aus Cent formatieren: `4900 → "49 €"`, `4950 → "49,50 €"`.
 * Mit `{ alwaysCents: true }` immer zwei Nachkommastellen (`"49,00 €"`).
 * Hinweis: Intl setzt ein geschütztes Leerzeichen (U+00A0) vor das €-Zeichen.
 */
export function formatPrice(cents: number, options: { alwaysCents?: boolean } = {}): string {
  const euros = cents / 100;
  if (!options.alwaysCents && cents % 100 === 0) return priceFormatterWhole.format(euros);
  return priceFormatter.format(euros);
}

/** Rabatt-Badge-Text: `"−30 %"`. */
export function formatDiscount(percent: number): string {
  return `−${percent}\u00A0%`;
}

/**
 * Euro-Eingabe ("49", "49,5", "49,50", "1.234,00") in Cent umwandeln.
 * Gibt `null` zurück, wenn die Eingabe kein gültiger Preis ist.
 */
export function parseEuroToCents(input: string): number | null {
  const normalized = input
    .trim()
    .replace(/\s|€/g, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '');
  if (!/^\d+([.,]\d{1,2})?$/.test(normalized)) return null;
  const [whole = '0', fraction = ''] = normalized.replace(',', '.').split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
}
