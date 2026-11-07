/**
 * Maschinenlesbare Fehlercodes der RPCs.
 *
 * Die Postgres-Funktionen werfen `raise exception '<CODE>' using errcode = 'P0001'`.
 * supabase-js liefert den Code dann in `error.message`. Mit `getRpcErrorCode()`
 * und `getErrorMessage()` übersetzen App und Web identisch.
 *
 * Neue Codes immer hier UND in der Migration ergänzen (eigener backend/-PR).
 */
export const RPC_ERROR_MESSAGES = {
  // Auth & Rollen
  NICHT_ANGEMELDET: 'Bitte melde dich an.',
  KEINE_BERECHTIGUNG: 'Dafür fehlt dir die Berechtigung.',
  GESPERRT: 'Dein Konto ist vorübergehend gesperrt, weil du mehrfach nicht erschienen bist.',
  STANDORT_NICHT_FREIGESCHALTET: 'Dein Standort ist noch nicht freigeschaltet.',
  STANDORT_NICHT_GEFUNDEN: 'Standort nicht gefunden.',
  STATUS_UNGUELTIG: 'Diese Aktion ist im aktuellen Status nicht möglich.',

  // Angebote
  ANGEBOT_NICHT_GEFUNDEN: 'Dieses Angebot gibt es nicht (mehr).',
  ANGEBOT_NICHT_AKTIV: 'Dieses Angebot ist nicht mehr verfügbar.',
  ANGEBOT_BEGONNEN: 'Der Termin hat bereits begonnen.',
  ANGEBOT_ABGELAUFEN: 'Dieses Angebot ist abgelaufen.',
  RABATT_ZU_GERING: 'Der Rabatt ist kleiner als der Mindestrabatt.',
  UNGUELTIGER_ZEITRAUM: 'Das Ende muss nach dem Start liegen.',
  BILDER_ANZAHL: 'Ein Angebot braucht 1 bis 5 Bilder.',
  FELD_GESPERRT: 'Zeit, Adresse und Preise sind gesperrt, weil schon Codes vergeben wurden.',
  KONTINGENT_ZU_KLEIN: 'Das Kontingent darf nicht kleiner sein als die bereits vergebenen Plätze.',

  // Codes holen & stornieren
  AUSGEBUCHT: 'Leider sind nicht mehr genug Plätze frei.',
  ZU_VIELE_PLAETZE: 'So viele Plätze kannst du für dieses Angebot nicht holen.',
  BEREITS_AKTIVER_CODE: 'Du hast für dieses Angebot schon einen aktiven Code.',
  CODE_NICHT_GEFUNDEN: 'Dieser Code ist ungültig.',
  CODE_NICHT_AKTIV: 'Dieser Code ist nicht mehr aktiv.',
  FRIST_ABGELAUFEN: 'Die Stornofrist ist abgelaufen.',

  // Einlösen & No-Show
  FALSCHER_STANDORT: 'Dieser Code gehört zu einem anderen Standort.',
  EINLOESUNG_ZU_FRUEH: 'Einlösen ist erst ab 1 Stunde vor Beginn möglich.',
  EINLOESUNG_ZU_SPAET: 'Der Einlösezeitraum ist vorbei.',
  BEREITS_EINGELOEST: 'Dieser Code wurde bereits eingelöst.',
  NO_SHOW_ZU_FRUEH: '„Nicht erschienen“ kann erst ab Beginn markiert werden.',
  NO_SHOW_NICHT_MOEGLICH: 'Bei Zeitraum-Angeboten gibt es kein „Nicht erschienen“.',

  // Allgemein
  UNGUELTIGE_EINGABE: 'Bitte prüfe deine Eingaben.',
} as const;

export type RpcErrorCode = keyof typeof RPC_ERROR_MESSAGES;
export const RPC_ERROR_CODES = Object.keys(RPC_ERROR_MESSAGES) as RpcErrorCode[];

const FALLBACK_MESSAGE = 'Etwas ist schiefgelaufen. Bitte versuch es noch einmal.';

export function isRpcErrorCode(value: unknown): value is RpcErrorCode {
  return (
    typeof value === 'string' && Object.prototype.hasOwnProperty.call(RPC_ERROR_MESSAGES, value)
  );
}

/** Liest den Fehlercode aus einem supabase-js-Fehler (oder `null`, wenn es kein RPC-Code ist). */
export function getRpcErrorCode(error: unknown): RpcErrorCode | null {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message: unknown }).message;
    if (isRpcErrorCode(message)) return message;
  }
  return null;
}

/** Deutscher Text für einen RPC-Fehler, mit Fallback für unbekannte Fehler. */
export function getErrorMessage(error: unknown): string {
  const code = getRpcErrorCode(error);
  return code ? RPC_ERROR_MESSAGES[code] : FALLBACK_MESSAGE;
}
