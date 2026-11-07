import { SHORT_CODE_ALPHABET } from './constants';

const SHORT_CODE_PATTERN = new RegExp(`^[${SHORT_CODE_ALPHABET}]{6}$`);

/**
 * Normalisiert eine Kurzcode-Eingabe: `"k7q 4mx"`, `"K7Q4MX"`, `"k7q-4mx"` → `"K7Q-4MX"`.
 * Gibt `null` zurück, wenn es kein gültiger Kurzcode ist.
 */
export function parseShortCode(input: string): string | null {
  const compact = input.toUpperCase().replace(/[\s-]/g, '');
  if (!SHORT_CODE_PATTERN.test(compact)) return null;
  return `${compact.slice(0, 3)}-${compact.slice(3)}`;
}

/** Anzeigeformat eines (bereits gültigen) Kurzcodes. */
export function formatShortCode(code: string): string {
  return parseShortCode(code) ?? code;
}

/** Datenschutz: Standorte sehen nur Vorname + Initial des Nachnamens. */
export function displayNameForLocation(firstName: string, lastName: string): string {
  const initial = lastName.trim().charAt(0).toUpperCase();
  return initial ? `${firstName.trim()} ${initial}.` : firstName.trim();
}
