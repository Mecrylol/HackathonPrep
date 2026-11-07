/**
 * Abstände (4/8-pt-Raster), Radien, Schatten, Bewegung.
 */

/** Abstandsskala: Schlüssel × 4 = px. `space[4]` = 16. */
export const space = {
  0: 0,
  0.5: 2,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

export type SpaceToken = keyof typeof space;

/** Radien: einheitlich weich, Bilder und Karten mit `lg`, Buttons/Inputs mit `md`. */
export const radius = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export type RadiusToken = keyof typeof radius;

/**
 * Schatten als CSS-`box-shadow`-Strings. Funktioniert im Web und in React Native
 * (Style-Prop `boxShadow`, New Architecture, RN ≥ 0.76).
 */
export const shadow = {
  none: 'none',
  /** Karten im Ruhezustand */
  sm: '0 1px 2px rgba(13, 13, 12, 0.06), 0 1px 1px rgba(13, 13, 12, 0.04)',
  /** Angehobene Karten, Pins auf der Karte */
  md: '0 4px 12px rgba(13, 13, 12, 0.08), 0 1px 3px rgba(13, 13, 12, 0.06)',
  /** Sheets, Dialoge, Toasts */
  lg: '0 12px 32px rgba(13, 13, 12, 0.12), 0 2px 6px rgba(13, 13, 12, 0.06)',
} as const;

export type ShadowToken = keyof typeof shadow;

/** Dauer von Animationen in ms. */
export const duration = {
  fast: 120,
  base: 200,
  slow: 320,
} as const;

/** Mindestgröße für Touch-Ziele (px/pt), gemäß Apple HIG und WCAG 2.5.8. */
export const touchTarget = 44;

/** Maximale Inhaltsbreite im Web (px). */
export const maxContentWidth = 1120;

/** Breakpoints (px, min-width) für das Web. */
export const breakpoint = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;
