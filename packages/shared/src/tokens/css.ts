import type { ColorTokens } from './colors';
import { radius, shadow, space } from './layout';
import { fontFamilyFallback, fontSize } from './typography';

const kebab = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

/**
 * Erzeugt CSS-Custom-Properties aus den Tokens, z. B. für Tailwind 4 (`@theme`) im Web:
 * `--color-bg`, `--color-accent`, `--radius-md`, `--shadow-sm`, `--spacing`, `--text-md` …
 *
 * Reine Funktion ohne DOM-/Node-Zugriff – das Web-Projekt schreibt das Ergebnis selbst in eine CSS-Datei.
 */
export function toCssVariables(colors: ColorTokens): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [name, value] of Object.entries(colors)) vars[`--color-${kebab(name)}`] = value;
  for (const [name, value] of Object.entries(radius)) {
    vars[`--radius-${name}`] = name === 'full' ? '9999px' : `${value}px`;
  }
  for (const [name, value] of Object.entries(shadow)) vars[`--shadow-${name}`] = value;
  for (const [name, value] of Object.entries(fontSize)) vars[`--text-${name}`] = `${value / 16}rem`;
  // Tailwind 4 leitet alle Abstände aus einer Basiseinheit ab: p-4 = 4 × 4px = 16px.
  vars['--spacing'] = `${space[1] / 16}rem`;
  vars['--font-sans'] = fontFamilyFallback.sans;
  return vars;
}
