/**
 * Design-Tokens – gemeinsame Basis für Web (Tailwind) und App (StyleSheet).
 * Import: `import { tokens } from '@app/shared/tokens'`.
 */
import { lightColors, palette, themes } from './colors';
import {
  breakpoint,
  duration,
  maxContentWidth,
  radius,
  shadow,
  space,
  touchTarget,
} from './layout';
import { fontFamily, fontFamilyFallback, fontSize, fontWeight, textStyles } from './typography';

export * from './colors';
export * from './layout';
export * from './typography';
export { toCssVariables } from './css';

export const tokens = {
  palette,
  themes,
  colors: lightColors,
  fontFamily,
  fontFamilyFallback,
  fontWeight,
  fontSize,
  textStyles,
  space,
  radius,
  shadow,
  duration,
  touchTarget,
  maxContentWidth,
  breakpoint,
} as const;

export type Tokens = typeof tokens;
