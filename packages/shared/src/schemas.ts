import { z } from 'zod';

import { CATEGORY_IDS, LIMITS, OFFER_TYPES } from './constants';
import { parseShortCode } from './vouchers';

/**
 * Zod-Schemas für alle Eingaben. Sie dienen der **Formular-Validierung** in App und Web.
 * Verbindlich prüft immer die Datenbank (RPCs + CHECK-Constraints) – die Grenzen hier
 * sind identisch mit denen in der DB (`LIMITS`).
 */

const text = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, { error: `${label}: mindestens ${min} Zeichen.` })
    .max(max, { error: `${label}: höchstens ${max} Zeichen.` });

const int = (min: number, max: number, label: string) =>
  z
    .int({ error: `${label} muss eine ganze Zahl sein.` })
    .min(min, { error: `${label}: mindestens ${min}.` })
    .max(max, { error: `${label}: höchstens ${max}.` });

const priceCents = (label: string) => int(LIMITS.priceCents.min, LIMITS.priceCents.max, label);

export const isoDateTime = z.iso.datetime({ offset: true, error: 'Ungültiges Datum.' });

export const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const addressSchema = z.object({
  address: text(LIMITS.address.min, LIMITS.address.max, 'Adresse'),
  ...coordinatesSchema.shape,
});

// ---------------------------------------------------------------------------
// Angebot
// ---------------------------------------------------------------------------

export const offerFieldsSchema = z.object({
  title: text(LIMITS.offerTitle.min, LIMITS.offerTitle.max, 'Titel'),
  description: text(LIMITS.offerDescription.min, LIMITS.offerDescription.max, 'Beschreibung'),
  category: z.enum(CATEGORY_IDS, { error: 'Bitte wähle eine Kategorie.' }),
  type: z.enum(OFFER_TYPES, { error: 'Bitte wähle eine Art.' }),
  startsAt: isoDateTime,
  endsAt: isoDateTime,
  originalPriceCents: priceCents('Originalpreis'),
  dealPriceCents: priceCents('Deal-Preis'),
  capacity: int(LIMITS.capacity.min, LIMITS.capacity.max, 'Kontingent'),
  maxSeatsPerUser: int(LIMITS.maxSeatsPerUser.min, LIMITS.maxSeatsPerUser.max, 'Plätze pro Person'),
  ...addressSchema.shape,
  /** Storage-Pfade im Bucket `offer-images`, erstes Bild = Titelbild */
  imagePaths: z
    .array(z.string().min(1))
    .min(LIMITS.offerImages.min, { error: 'Mindestens 1 Bild.' })
    .max(LIMITS.offerImages.max, { error: 'Höchstens 5 Bilder.' }),
});

type OfferFields = z.infer<typeof offerFieldsSchema>;

const offerRules = <T extends z.ZodType<Partial<OfferFields>>>(schema: T) =>
  schema
    .refine((o) => !o.startsAt || !o.endsAt || new Date(o.endsAt) > new Date(o.startsAt), {
      error: 'Das Ende muss nach dem Start liegen.',
      path: ['endsAt'],
    })
    .refine(
      (o) =>
        o.originalPriceCents === undefined ||
        o.dealPriceCents === undefined ||
        o.dealPriceCents < o.originalPriceCents,
      { error: 'Der Deal-Preis muss unter dem Originalpreis liegen.', path: ['dealPriceCents'] },
    )
    .refine(
      (o) =>
        o.capacity === undefined ||
        o.maxSeatsPerUser === undefined ||
        o.maxSeatsPerUser <= o.capacity,
      {
        error: 'Plätze pro Person dürfen das Kontingent nicht übersteigen.',
        path: ['maxSeatsPerUser'],
      },
    );

/** Neues Angebot anlegen. Mindestrabatt prüft zusätzlich `meetsMinDiscount()` mit dem DB-Wert. */
export const offerCreateSchema = offerRules(offerFieldsSchema);
export type OfferCreateInput = z.infer<typeof offerCreateSchema>;

/** Angebot ändern: alle Felder optional; gesperrte Felder lehnt die DB mit `FELD_GESPERRT` ab. */
export const offerUpdateSchema = offerRules(offerFieldsSchema.partial());
export type OfferUpdateInput = z.infer<typeof offerUpdateSchema>;

// ---------------------------------------------------------------------------
// Registrierung & Profile
// ---------------------------------------------------------------------------

export const emailSchema = z.email({ error: 'Bitte gib eine gültige E-Mail-Adresse ein.' });

export const passwordSchema = z
  .string()
  .min(LIMITS.password.min, { error: `Mindestens ${LIMITS.password.min} Zeichen.` })
  .max(LIMITS.password.max, { error: `Höchstens ${LIMITS.password.max} Zeichen.` });

const companyFields = {
  companyName: text(LIMITS.companyName.min, LIMITS.companyName.max, 'Name des Unternehmens'),
  companyDescription: z.string().trim().max(LIMITS.companyDescription.max).optional(),
};

const locationFields = {
  locationName: text(LIMITS.locationName.min, LIMITS.locationName.max, 'Name des Standorts'),
  address: text(LIMITS.address.min, LIMITS.address.max, 'Adresse'),
  /** Optional bei der Registrierung, Pin wird später im Profil bestätigt. */
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
};

/** Selbstregistrierung eines Standorts (Website). Wird als `options.data` an `signUp` übergeben. */
export const locationRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  ...companyFields,
  ...locationFields,
});
export type LocationRegistrationInput = z.infer<typeof locationRegistrationSchema>;

export const companyUpdateSchema = z.object({
  name: companyFields.companyName,
  description: companyFields.companyDescription,
  logoPath: z.string().min(1).nullable().optional(),
});
export type CompanyUpdateInput = z.infer<typeof companyUpdateSchema>;

export const locationUpdateSchema = z.object({
  name: locationFields.locationName,
  address: locationFields.address,
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
export type LocationUpdateInput = z.infer<typeof locationUpdateSchema>;

/** Nutzerprofil (App). */
export const profileSchema = z.object({
  firstName: text(LIMITS.personName.min, LIMITS.personName.max, 'Vorname'),
  lastName: text(LIMITS.personName.min, LIMITS.personName.max, 'Nachname'),
});
export type ProfileInput = z.infer<typeof profileSchema>;

// ---------------------------------------------------------------------------
// Gutscheincodes
// ---------------------------------------------------------------------------

export const claimVoucherSchema = z.object({
  offerId: z.uuid(),
  seats: int(1, LIMITS.maxSeatsPerUser.max, 'Plätze'),
});
export type ClaimVoucherInput = z.infer<typeof claimVoucherSchema>;

/** Einlösen per QR-Token oder Kurzcode (tolerant: Kleinbuchstaben, ohne Bindestrich). */
export const redeemCodeSchema = z
  .string()
  .trim()
  .min(6, { error: 'Bitte gib einen Code ein.' })
  .refine((v) => v.length >= 16 || parseShortCode(v) !== null, { error: 'Ungültiger Code.' });

// ---------------------------------------------------------------------------
// Admin-Einstellungen
// ---------------------------------------------------------------------------

export const settingsSchema = z.object({
  minDiscountPercent: int(0, 90, 'Mindestrabatt'),
  cancellationDeadlineHours: int(0, 168, 'Stornofrist'),
  noShowLimit: int(1, 10, 'No-Show-Limit'),
  banDurationDays: int(1, 365, 'Sperrdauer'),
  reminderHoursBefore: int(0, 48, 'Erinnerungszeit'),
});
export type SettingsInput = z.infer<typeof settingsSchema>;
