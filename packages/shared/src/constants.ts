/**
 * Fachliche Konstanten. Werte (`id`) entsprechen 1:1 den Postgres-Enums,
 * `label` ist der deutsche Anzeigetext für App und Web.
 */

export const TIME_ZONE = 'Europe/Berlin';
export const LOCALE = 'de-DE';
export const CURRENCY = 'EUR';

// ---------------------------------------------------------------------------
// Kategorien (Enum `offer_category`)
// ---------------------------------------------------------------------------
export const CATEGORIES = [
  { id: 'food', label: 'Kochen & Essen' },
  { id: 'sport', label: 'Sport & Bewegung' },
  { id: 'creative', label: 'Kreativ & Workshops' },
  { id: 'wellness', label: 'Wellness & Beauty' },
  { id: 'culture', label: 'Kultur & Events' },
  { id: 'other', label: 'Sonstiges' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];
export const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as [CategoryId, ...CategoryId[]];
export const CATEGORY_LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label])) as Record<
  CategoryId,
  string
>;

// ---------------------------------------------------------------------------
// Angebotsart (Enum `offer_type`)
// ---------------------------------------------------------------------------
export const OFFER_TYPES = ['single', 'period'] as const;
export type OfferType = (typeof OFFER_TYPES)[number];
export const OFFER_TYPE_LABELS: Record<OfferType, string> = {
  single: 'Einzeltermin',
  period: 'Zeitraum',
};

// ---------------------------------------------------------------------------
// Angebotsstatus (Enum `offer_status`). „Vergangen“ ist kein Status, sondern ends_at < jetzt.
// ---------------------------------------------------------------------------
export const OFFER_STATUSES = ['active', 'cancelled', 'removed'] as const;
export type OfferStatus = (typeof OFFER_STATUSES)[number];
export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  active: 'Aktiv',
  cancelled: 'Abgesagt',
  removed: 'Entfernt',
};

// ---------------------------------------------------------------------------
// Gutscheincode-Status (Enum `voucher_status`)
// ---------------------------------------------------------------------------
export const VOUCHER_STATUSES = ['active', 'cancelled', 'redeemed', 'no_show', 'expired'] as const;
export type VoucherStatus = (typeof VOUCHER_STATUSES)[number];
export const VOUCHER_STATUS_LABELS: Record<VoucherStatus, string> = {
  active: 'Aktiv',
  cancelled: 'Storniert',
  redeemed: 'Eingelöst',
  no_show: 'Nicht erschienen',
  expired: 'Abgelaufen',
};

// ---------------------------------------------------------------------------
// Freischaltungsstatus eines Standorts (Enum `location_status`)
// ---------------------------------------------------------------------------
export const LOCATION_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type LocationStatus = (typeof LOCATION_STATUSES)[number];
export const LOCATION_STATUS_LABELS: Record<LocationStatus, string> = {
  pending: 'Wartet auf Freischaltung',
  approved: 'Freigeschaltet',
  rejected: 'Abgelehnt',
};

// ---------------------------------------------------------------------------
// Rollen (Enum `app_role`)
// ---------------------------------------------------------------------------
export const ROLES = ['user', 'location', 'admin'] as const;
export type Role = (typeof ROLES)[number];
export const ROLE_LABELS: Record<Role, string> = {
  user: 'Nutzer',
  location: 'Standort',
  admin: 'Admin',
};

// ---------------------------------------------------------------------------
// Kennzahlen-Events (Enum `event_type`)
// ---------------------------------------------------------------------------
export const EVENT_TYPES = [
  'offer_viewed',
  'voucher_claimed',
  'voucher_cancelled',
  'voucher_redeemed',
  'voucher_no_show',
] as const;
export type EventType = (typeof EVENT_TYPES)[number];
export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  offer_viewed: 'Angebot angesehen',
  voucher_claimed: 'Code geholt',
  voucher_cancelled: 'Storniert',
  voucher_redeemed: 'Eingelöst',
  voucher_no_show: 'Nicht erschienen',
};

// ---------------------------------------------------------------------------
// Benachrichtigungen (Enums `notification_type`, `notification_status`)
// ---------------------------------------------------------------------------
export const NOTIFICATION_TYPES = ['offer_cancelled', 'offer_new', 'reminder'] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
export const NOTIFICATION_STATUSES = ['pending', 'sent', 'failed'] as const;
export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];

// ---------------------------------------------------------------------------
// Push-Plattformen (Enum `push_platform`)
// ---------------------------------------------------------------------------
export const PUSH_PLATFORMS = ['ios', 'android'] as const;
export type PushPlatform = (typeof PUSH_PLATFORMS)[number];

// ---------------------------------------------------------------------------
// Globale Einstellungen – Startwerte (Tabelle `app_settings`)
// ---------------------------------------------------------------------------
export const DEFAULT_SETTINGS = {
  /** Mindestrabatt in Prozent */
  minDiscountPercent: 20,
  /** Storno bei Einzelterminen bis so viele Stunden vor Start */
  cancellationDeadlineHours: 24,
  /** Ab so vielen No-Shows wird gesperrt */
  noShowLimit: 2,
  /** Sperrdauer in Tagen */
  banDurationDays: 30,
  /** Erinnerung so viele Stunden vor Start (nutzt die App) */
  reminderHoursBefore: 2,
} as const;

/** Einzeltermin: Einlösung ab so vielen Minuten vor Start möglich. */
export const REDEEM_EARLY_MINUTES = 60;

// ---------------------------------------------------------------------------
// Eingabegrenzen – identisch mit den CHECK-Constraints in der Datenbank
// ---------------------------------------------------------------------------
export const LIMITS = {
  offerTitle: { min: 3, max: 80 },
  offerDescription: { min: 10, max: 2000 },
  offerImages: { min: 1, max: 5 },
  capacity: { min: 1, max: 500 },
  maxSeatsPerUser: { min: 1, max: 20 },
  priceCents: { min: 1, max: 1_000_000 },
  companyName: { min: 2, max: 80 },
  companyDescription: { max: 1000 },
  locationName: { min: 2, max: 80 },
  address: { min: 5, max: 200 },
  personName: { min: 1, max: 60 },
  password: { min: 8, max: 72 },
  imageBytes: 5 * 1024 * 1024,
} as const;

export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

/** Storage-Buckets */
export const STORAGE_BUCKETS = {
  offerImages: 'offer-images',
  companyLogos: 'company-logos',
} as const;

/** Alphabet der Kurzcodes (ohne 0/O/1/I/L) – identisch mit der DB-Funktion. */
export const SHORT_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
