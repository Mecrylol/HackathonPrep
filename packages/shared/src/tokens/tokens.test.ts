import { describe, expect, it } from 'vitest';

import { lightColors, palette, space, toCssVariables } from './index';

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((v) =>
    v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
  ) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m) as [number, number];
  return (x + 0.05) / (y + 0.05);
}

const AA = 4.5;

describe('Farbkontraste (WCAG AA, 4,5 : 1)', () => {
  const c = lightColors;
  it.each([
    ['fg auf bg', c.fg, c.bg],
    ['fg auf bgSubtle', c.fg, c.bgSubtle],
    ['fgMuted auf bg', c.fgMuted, c.bg],
    ['fgMuted auf bgSubtle', c.fgMuted, c.bgSubtle],
    ['fgSubtle auf bg', c.fgSubtle, c.bg],
    ['onAccent auf accent', c.onAccent, c.accent],
    ['onAccent auf accentPressed', c.onAccent, c.accentPressed],
    ['accentText auf bg', c.accentText, c.bg],
    ['accentText auf accentSubtle', c.accentText, c.accentSubtle],
    ['onPrimary auf primary', c.onPrimary, c.primary],
    ['fgInverse auf inverse', c.fgInverse, c.inverse],
    ['success auf bg', c.success, c.bg],
    ['success auf successSubtle', c.success, c.successSubtle],
    ['warning auf warningSubtle', c.warning, c.warningSubtle],
    ['danger auf dangerSubtle', c.danger, c.dangerSubtle],
    ['onDanger auf danger', c.onDanger, c.danger],
  ])('%s', (_name, fg, bg) => {
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(AA);
  });
});

describe('Token-Struktur', () => {
  it('hat genau eine Akzent-Farbfamilie', () => {
    const families = Object.keys(palette).filter((k) => !['white', 'black', 'gray'].includes(k));
    expect(families).toEqual(['ember', 'green', 'amber', 'red', 'blue']);
    expect(lightColors.accent).toBe(palette.ember[500]);
  });
  it('Abstände liegen auf dem 4-pt-Raster (außer 2px Halbschritt)', () => {
    for (const [key, value] of Object.entries(space)) {
      if (key === '0.5') continue;
      expect(value % 4).toBe(0);
    }
  });
  it('erzeugt CSS-Variablen für Tailwind', () => {
    const vars = toCssVariables(lightColors);
    expect(vars['--color-bg']).toBe('#FFFFFF');
    expect(vars['--color-accent-subtle']).toBe(palette.ember[50]);
    expect(vars['--radius-md']).toBe('10px');
    expect(vars['--spacing']).toBe('0.25rem');
  });
});
