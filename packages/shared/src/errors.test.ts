import { describe, expect, it } from 'vitest';

import { getErrorMessage, getRpcErrorCode, RPC_ERROR_CODES, RPC_ERROR_MESSAGES } from './errors';

describe('RPC-Fehlercodes', () => {
  it('erkennt Codes aus supabase-js-Fehlern', () => {
    expect(getRpcErrorCode({ message: 'AUSGEBUCHT', code: 'P0001' })).toBe('AUSGEBUCHT');
    expect(getErrorMessage({ message: 'GESPERRT' })).toBe(RPC_ERROR_MESSAGES.GESPERRT);
  });
  it('fällt bei unbekannten Fehlern auf einen Standardtext zurück', () => {
    expect(getRpcErrorCode({ message: 'duplicate key' })).toBeNull();
    expect(getRpcErrorCode(null)).toBeNull();
    expect(getRpcErrorCode({ message: 'toString' })).toBeNull();
    expect(getErrorMessage(new Error('boom'))).toMatch(/schiefgelaufen/);
  });
  it('Codes sind GROSS_MIT_UNTERSTRICH', () => {
    for (const code of RPC_ERROR_CODES) expect(code).toMatch(/^[A-Z_]+$/);
  });
});
