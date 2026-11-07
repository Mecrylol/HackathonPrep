/**
 * Farben in zwei Ebenen:
 * 1. `palette` – rohe Farbskalen. Nicht direkt in Komponenten verwenden.
 * 2. `themes.light` – semantische Rollen (`bg`, `fg`, `accent` …). Nur diese in UI-Code nutzen.
 *
 * Dunkelmodus später: `themes.dark` mit denselben Schlüsseln ergänzen (Typ `ColorTokens`
 * erzwingt Vollständigkeit). Komponenten müssen dafür nicht geändert werden.
 *
 * Kontraste (WCAG 2.x) sind in `tokens.test.ts` abgesichert.
 */

export const palette = {
  white: '#FFFFFF',
  black: '#0D0D0C',
  /** Leicht warme Grauskala – ruhiger als neutrales Grau, wirkt „städtisch“ statt technisch. */
  gray: {
    50: '#F7F7F5',
    100: '#EFEFEC',
    200: '#E3E3DF',
    300: '#CFCFCA',
    400: '#A3A39D',
    500: '#6E6E69',
    600: '#55554F',
    700: '#3D3D39',
    800: '#292926',
    900: '#1A1A18',
    950: '#0D0D0C',
  },
  /** Akzent „Glutorange“ – einzige Markenfarbe: Rabatte und Haupt-Buttons. */
  ember: {
    50: '#FDF0EC',
    100: '#FBDDD4',
    200: '#F6B6A5',
    300: '#EE8A70',
    400: '#E4613F',
    500: '#D63D1F',
    600: '#B4321A',
    700: '#8F2715',
  },
  green: { 50: '#E9F5EE', 600: '#1E7A46', 700: '#16603A' },
  amber: { 50: '#FDF4E3', 600: '#9A5B00', 700: '#8A5000' },
  red: { 50: '#FCEDEE', 600: '#B8232F', 700: '#951C26' },
  blue: { 600: '#2B59C3' },
} as const;

export const lightColors = {
  // Flächen
  /** Seitenhintergrund */
  bg: palette.white,
  /** Leicht abgesetzte Flächen (Sektionen, Eingabefelder) */
  bgSubtle: palette.gray[50],
  /** Deutlicher abgesetzt (Skeleton, Chips inaktiv) */
  bgMuted: palette.gray[100],
  /** Karten, Sheets, Dialoge */
  surface: palette.white,
  /** Dunkle Fläche mit hellem Text (z. B. Tab-Bar aktiv, Toasts) */
  inverse: palette.gray[950],
  /** Abdunklung hinter Sheets/Dialogen */
  overlay: 'rgba(13, 13, 12, 0.48)',

  // Text & Icons
  /** Haupttext, Überschriften, Preise */
  fg: palette.gray[950],
  /** Sekundärtext (Metadaten) – AA auf bg und bgSubtle */
  fgMuted: palette.gray[600],
  /** Hilfstext, Platzhalter – AA auf bg */
  fgSubtle: palette.gray[500],
  /** Deaktiviert (dekorativ, kein Fließtext) */
  fgDisabled: palette.gray[400],
  /** Text auf `inverse` */
  fgInverse: palette.white,

  // Linien
  border: palette.gray[200],
  borderStrong: palette.gray[300],
  /** Fokusring (Tastatur/Barrierefreiheit) */
  focus: palette.blue[600],

  // Akzent – NUR für Rabatte und Haupt-Buttons
  accent: palette.ember[500],
  accentPressed: palette.ember[600],
  /** Akzent als Text/Icon auf hellen Flächen (bessere Lesbarkeit als `accent`) */
  accentText: palette.ember[600],
  /** Zarter Akzent-Hintergrund (Rabatt-Badge hell) */
  accentSubtle: palette.ember[50],
  /** Text/Icon auf `accent` */
  onAccent: palette.white,

  // Haupt-Button ohne Akzent (sekundäre Hauptaktion, „Uber-Schwarz“)
  primary: palette.gray[950],
  primaryPressed: palette.gray[800],
  onPrimary: palette.white,

  // Status
  success: palette.green[600],
  successSubtle: palette.green[50],
  onSuccess: palette.white,
  warning: palette.amber[600],
  warningSubtle: palette.amber[50],
  onWarning: palette.white,
  danger: palette.red[600],
  dangerSubtle: palette.red[50],
  onDanger: palette.white,
} as const;

export type ColorToken = keyof typeof lightColors;
export type ColorTokens = Record<ColorToken, string>;

export const themes = {
  light: lightColors,
  // dark: { ... } satisfies ColorTokens  ← später ergänzen
} as const satisfies Record<string, ColorTokens>;

export type ThemeName = keyof typeof themes;
