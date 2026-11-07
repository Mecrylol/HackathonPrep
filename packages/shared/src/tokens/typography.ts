/**
 * Typografie: Inter (SIL Open Font License).
 * Schriftdateien binden die Apps selbst ein (Web: next/font/local, App: expo-font).
 * Größen in px (Web) bzw. dp/pt (React Native) – gleiche Zahlen auf beiden Plattformen.
 */

export const fontFamily = {
  sans: 'Inter',
  /** Für Kurzcodes und Zahlen in Tabellen: Inter mit `tabular-nums` statt eigener Mono-Schrift. */
  mono: 'Inter',
} as const;

/** Fallback-Stack für das Web. */
export const fontFamilyFallback = {
  sans: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;

export type FontWeight = keyof typeof fontWeight;

/** Größenskala (px) */
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

interface TextStyle {
  fontSize: number;
  /** absolute Zeilenhöhe in px */
  lineHeight: number;
  fontWeight: (typeof fontWeight)[FontWeight];
  /** in px (RN: direkt, Web: px) */
  letterSpacing: number;
}

/**
 * Fertige Textstile. Große Überschriften kräftig und eng gesetzt, Fließtext ruhig.
 */
export const textStyles = {
  display: { fontSize: 48, lineHeight: 52, fontWeight: fontWeight.extrabold, letterSpacing: -1.4 },
  h1: { fontSize: 36, lineHeight: 40, fontWeight: fontWeight.extrabold, letterSpacing: -1 },
  h2: { fontSize: 30, lineHeight: 36, fontWeight: fontWeight.bold, letterSpacing: -0.7 },
  h3: { fontSize: 24, lineHeight: 30, fontWeight: fontWeight.bold, letterSpacing: -0.4 },
  title: { fontSize: 20, lineHeight: 26, fontWeight: fontWeight.semibold, letterSpacing: -0.2 },
  bodyLarge: { fontSize: 18, lineHeight: 28, fontWeight: fontWeight.regular, letterSpacing: 0 },
  body: { fontSize: 16, lineHeight: 24, fontWeight: fontWeight.regular, letterSpacing: 0 },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontWeight: fontWeight.semibold, letterSpacing: 0 },
  label: { fontSize: 14, lineHeight: 20, fontWeight: fontWeight.medium, letterSpacing: 0 },
  small: { fontSize: 14, lineHeight: 20, fontWeight: fontWeight.regular, letterSpacing: 0 },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: fontWeight.medium, letterSpacing: 0.1 },
  /** Große Preisangabe (Detailseite) */
  price: { fontSize: 30, lineHeight: 34, fontWeight: fontWeight.extrabold, letterSpacing: -0.6 },
  /** Kurzcode `K7Q-4MX` */
  code: { fontSize: 24, lineHeight: 30, fontWeight: fontWeight.bold, letterSpacing: 2 },
} as const satisfies Record<string, TextStyle>;

export type TextStyleName = keyof typeof textStyles;
