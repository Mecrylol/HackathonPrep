# Spezifikation – Lokale Kurzfrist-Angebote (Prototyp Münster)

> Stand: 2026-11-07 · **Session 0 von 3: Fundament (Monorepo + Backend).**
> Danach parallel: Website (`apps/web`, Kollege) und Mobile App (`apps/mobile`, Ben) in eigenen Sessions.
> Getroffene Annahmen: siehe [Annahmen](#annahmen).

## Auftrag

Fundament einer Plattform, über die lokale Unternehmen kurzfristige, vergünstigte Angebote (z. B. Kochkurse) einstellen. Nutzer sichern sich diese Angebote per Gutscheincode. Ziel ist ein echter, nutzbarer MVP, mit dem wir in **Münster mit 5–15 Partnern** die Nachfrage testen. Kein Payment, keine Gebühren.

Teile:

1. **Backend:** Supabase – _diese Session_
2. **Website** für Unternehmen und Admin (Next.js, `apps/web`) – _danach, Session des Kollegen_
3. **Mobile App** für Nutzer (Expo, `apps/mobile`) – _gleichzeitig mit der Website, Session von Ben_

Diese Session schafft die Grundlage für paralleles Arbeiten ohne gegenseitiges Blockieren: Monorepo, komplette Datenbank mit allen Geschäftsregeln, gemeinsames Paket, Seed-Daten, Doku, Spielregeln für die Zusammenarbeit. **Website und App werden nicht gebaut.**

---

## Arbeitsweise

- Phase für Phase. Am Ende jeder Phase: Typecheck, Lint, Tests → git-Commit → kurze Zusammenfassung → auf OK warten.
- Aktuelle offizielle Doku (Supabase, Expo, Next.js) prüfen, nicht aus dem Gedächtnis.
- Nur nachfragen, wenn eine Entscheidung blockiert oder der PO etwas anlegen muss; sonst Annahme treffen und unten dokumentieren.
- Skills `supabase` und `postgres-best-practices` für Schema, RLS und Funktionen.
- Migrationen als Dateien über die Supabase CLI. Supabase-MCP nur lesend. Kein Expo-MCP.
- Secrets nur in `.env`-Dateien (nicht committen), `.env.example` pflegen.
- Zeitzone Europe/Berlin, Preise als Cent (EUR), Oberfläche Deutsch.

---

## Zusammenarbeit (zwei Entwickler parallel)

Wird in die Root-`CLAUDE.md` übernommen.

- **Zuständigkeiten:** Ben → `apps/mobile`; Kollege → `apps/web`. Jeder auf eigenem Rechner mit eigener Claude-Code-Session.
- **Git & GitHub:** Repo auf GitHub, `main` geschützt, Änderungen nur per Pull Request. Feature-Branches `web/...`, `app/...`, `backend/...`. Kleine PRs, oft mergen, `main` mindestens täglich in den eigenen Branch holen.
- **Eigene Ordner** (`apps/web` bzw. `apps/mobile`) darf jeder frei ändern.
- **Gemeinsame Bereiche** (`supabase/`, `packages/shared/`, Root-Konfiguration): Änderungen nur in einem eigenen, kleinen PR, den der andere kurz reviewt; keine gemeinsamen Änderungen nebenbei in einem Feature-PR.
- **Migrationen:** bestehende nie ändern, nur neue hinzufügen; vor dem Anlegen `main` pullen; nach jeder Migration Typen neu generieren und mitcommitten.
- **Datenbanken:** ~~jeder entwickelt gegen ein lokales Supabase (CLI + Docker)~~ → **geändert (A22): ohne Docker, ein gemeinsames gehostetes Dev-Projekt.** Migrationen werden nach Review-Freigabe eingespielt (`pnpm db:push`) und sofort gemergt.
- **Nach jedem Pull von `main`:** `pnpm install`, Typen generieren (`pnpm gen:types`, sollten bereits aktuell im Repo sein).
- `.github/CODEOWNERS` und PR-Vorlage mit Checkliste (Typecheck, Tests, Migration, Typen, Doku).

---

## Tech-Stack & Struktur

- **Monorepo** mit pnpm-Workspaces nach den Anforderungen der Expo-Monorepo-Doku.
  - `apps/web`, `apps/mobile`: nur leere Platzhalter mit README.
  - `packages/shared` (beide nutzen es; plattformneutral, ohne DOM- oder Node-Code): generierte Supabase-Typen; Zod-Schemas für alle Eingaben (Angebot, Registrierung, Profil …); Konstanten (Kategorien, Statuswerte, RPC-Fehlercodes); **Design-Tokens**; Hilfsfunktionen (Rabatt, Preis- und Datumsformat, Zeitlabels wie „startet in 2 Std.“); Tests.
  - `supabase/`: Migrations, Seed, Edge Functions, SQL-Tests.
- **Supabase:** Postgres; Auth (E-Mail-OTP, Apple, Google für Nutzer; E-Mail + Passwort für Standorte); Storage (Angebotsbilder, Logos); Edge Functions; pg_cron. Region EU (Frankfurt). Lokal mit Supabase CLI + Docker.
- **Alle Geschäftsregeln serverseitig in Postgres-Funktionen**, nie nur im Client.
- **RLS auf allen Tabellen.** Rollen: Nutzer (App), Standort-Account (Web), Admin (Web).
- **RPC-Fehler** mit festen, maschinenlesbaren Codes (z. B. `AUSGEBUCHT`, `GESPERRT`, `FRIST_ABGELAUFEN`), definiert in `packages/shared`, damit App und Web gleich übersetzen.

---

## Design-Tokens (Grundlage für App und Web)

- Minimalistisch und modern nach den Designprinzipien von Uber, Wise und Airbnb – ohne deren Logos, Farben oder Markenelemente.
- **Farben:** Schwarz, Weiß, fein abgestufte Grauskala, **genau eine Akzentfarbe** (Rabatte, Haupt-Buttons), Statusfarben (Erfolg, Warnung, Fehler). 2–3 Akzentfarben werden vorgeschlagen.
- **Typografie:** Open-Source-Schrift (Inter) mit Größenskala und Gewichten.
- **Abstände/Radien:** 4/8-pt-Raster, Radien-Skala, Schatten-Stufen.
- **Farbmodus:** Hellmodus jetzt, Struktur für späteren Dunkelmodus.
- **Format:** TypeScript-Objekt, nutzbar für Tailwind (Web) und App.

---

## Fachliche Regeln (vollständig, das Backend setzt alle um)

### Rollen & Accounts

- **Nutzer (App):** Stöbern ohne Konto, Code-Holen nur mit Login. Profil mit Vor- und Nachname. Konto löschbar (eigene RPC, entfernt bzw. anonymisiert die Daten).
- **Unternehmen → Standorte (Web):** Ein Unternehmen (Name, Logo, Beschreibung) hat einen oder mehrere Standorte. **Genau ein Login pro Standort.** Ein Standort sieht und verwaltet nur seine eigenen Angebote und Codes.
- **Selbstregistrierung + Freischaltung:** Registrierung legt Unternehmen, ersten Standort und Login an, Status `pending`. Erst nach Freischaltung durch Admin kann der Standort Angebote erstellen. Status `rejected` vorhanden.
- **Admin:** eigene Rolle, per SQL oder Seed gesetzt.

### Angebote

- Gehört zu einem Standort, nach dem Speichern **sofort live**. Admin kann Angebote entfernen.
- **Felder:** Titel, Beschreibung, Kategorie; 1–5 Bilder (erstes = Titelbild); Original- und Deal-Preis; Kontingent (Plätze), max. Plätze pro Nutzer; Adresse + lat/lng (Pflicht pro Angebot); Art.
- **Art:** `einzeltermin` (Start- und Endzeit) oder `zeitraum` (einlösbar von–bis). Zeitpunkt frei wählbar.
- **Rabatt:** Mindestrabatt = globale Admin-Einstellung (Start 20 %), serverseitig geprüft.
- **Kategorien:** Kochen & Essen · Sport & Bewegung · Kreativ & Workshops · Wellness & Beauty · Kultur & Events · Sonstiges
- **Änderungen nach Code-Vergabe:** Titel, Beschreibung, Bilder immer änderbar. Kontingent darf erhöht werden, nicht unter vergebene Plätze sinken. Zeit, Adresse, Preise gesperrt, sobald Codes existieren.
- **Absage (`cancel_offer`):** jederzeit; alle aktiven Codes storniert, keine No-Shows; je betroffenem Code-Inhaber ein Eintrag in `notification_outbox` (die App-Session verschickt daraus Pushes).

### Gutscheincodes

- **`claim_voucher`** (atomar, Row-Lock auf dem Angebot, nie überbuchen) prüft: Nutzer eingeloggt und nicht gesperrt; Angebot aktiv und (Einzeltermin) noch nicht begonnen bzw. (Zeitraum) noch nicht abgelaufen; Plätze ≤ max. pro Nutzer und genug frei; höchstens ein aktiver Code pro Nutzer und Angebot.
- **Code:** zufälliger, nicht erratbarer QR-Token plus kurzer lesbarer Code (z. B. `K7Q-4MX`).
- **Status:** `aktiv`, `storniert`, `eingelöst`, `no_show`, `abgelaufen`
- **`redeem_voucher`:** per Token oder Kurzcode; nur der eigene Standort; Einzeltermin ab 1 Std. vor Start bis Ende, Zeitraum innerhalb des Zeitraums.
- **Einzeltermin:** `cancel_voucher` bis X Std. vor Start (Admin-Einstellung), Plätze zurück ins Kontingent. `mark_no_show` nur durch den Standort, ab Startzeit. Nach N No-Shows Sperre für D Tage (Start 2 → 30 Tage), danach Zähler zurückgesetzt.
- **Zeitraum:** jederzeit stornierbar, kein No-Show. Nicht eingelöste Codes nach Ende `abgelaufen`.

### Weitere Daten

- **Einstellungen:** Mindestrabatt, Storno-Frist, No-Show-Limit, Sperrdauer, Erinnerungszeit vor Start (Standard 2 Std.)
- **Favoriten:** Standorte und Kategorien
- **Push-Tokens:** mehrere Geräte pro Nutzer
- **`notification_outbox`:** ausstehende Benachrichtigungen (Typ, Empfänger, Bezug, Status)
- **Events für Kennzahlen:** Angebot angesehen, Code geholt, storniert, eingelöst, No-Show
- **Geocoding-Cache:** Adresse → lat/lng
- **Öffentliche Lese-Sicht** (View oder RPC) auf aktive Angebote: mit freien Plätzen, Standortinfo, Koordinaten; sortierbar nach „als Nächstes relevant“ (Einzeltermin: Startzeit, Zeitraum: Ende); filterbar nach Kategorie und Standort.
- **Teilnehmerliste für Standorte:** RPC/View mit Vorname, Initial Nachname, Plätzen, Kurzcode, Status – ohne E-Mail.
- **Admin-Kennzahlen:** RPC mit Summen pro Woche, Standort und Kategorie sowie Einlösequote.

---

## Phasen

0. **Setup:** git + GitHub-Repo verbinden; Monorepo + Tooling (TS strict, ESLint, Prettier, gemeinsame Configs); Platzhalter `apps/web`, `apps/mobile`; `packages/shared` mit Design-Tokens; `CODEOWNERS`, PR-Vorlage, `.env.example`, Root-`CLAUDE.md`; Anleitung Branch-Schutz.
1. **Datenbank:** komplettes Schema mit RLS; RPCs `claim_voucher`, `cancel_voucher`, `redeem_voucher`, `mark_no_show`, `cancel_offer`, Konto löschen, Freischalten/Ablehnen, Einstellungen, Kennzahlen; Storage-Buckets mit Policies.
2. **Seed & Tests:** ca. 8 Münster-Standorte (realistische Adressen/Koordinaten), ca. 15 Angebote beider Arten mit Platzhalterbildern, Testnutzer pro Rolle, Codes in allen Status; SQL-Tests für alle RPCs inkl. paralleler Anfragen auf den letzten Platz; Typgenerierung nach `packages/shared`.
3. **Übergabe:** `docs/BACKEND.md` (Tabellen, Views, RPCs mit Parametern, Rückgaben, Fehlercodes; RLS pro Rolle; Auth; Storage; Testzugänge; Befehle); README zur Einrichtung beim Kollegen (Klonen, Supabase CLI, `pnpm install`, Link zum Dev-Projekt, `.env`).

---

## Annahmen

Ohne Rückfrage getroffene Entscheidungen. Bei Widerspruch bitte melden.

| # | Thema | Annahme / Entscheidung | Begründung |
| --- | ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| A1 | Vorhandener Code | Im Repo lag nur die unveränderte Expo-Vorlage (SDK 58) plus ein frisches Next.js-Gerüst aus einem früheren Anlauf. Beides wird entfernt; `apps/web` und `apps/mobile` werden leere Platzhalter mit README. Die Expo-Vorlage bleibt im Initial-Commit abrufbar. Root-`AGENTS.md` (Expo-Regeln) wandert nach `apps/mobile/AGENTS.md`. | Spec: nur Platzhalter. |
| A2 | Paketmanager & Expo-Kompatibilität | pnpm 12 Workspaces (`apps/*`, `packages/*`). Laut Expo-Monorepo-Doku (Stand Okt. 2026): pnpm offiziell unterstützt, isolierte Installs ab SDK 54, keine Metro-Sonderkonfiguration, Autolinking im Monorepo ab SDK 55 automatisch; doppelte `react`/`react-native`-Versionen brechen die App. Daher: `packages/shared` ohne Build-Schritt (TS-Quellen, `exports` auf `src`), React nur als optionale Peer-Abhängigkeit – `shared` hängt nicht von React ab. Fallback bei Problemen: `nodeLinker: hoisted`. Zielversion für die App: Expo SDK 58 (React 19.3, RN 0.88). | Expo-Doku. |
| A3 | Supabase-Projekt & Region | Verknüpft ist `syrdvvxtllgutvonuwzd` („Hackathon prep“), Region **eu-west-1 (Irland)** statt Frankfurt. Für den Prototyp akzeptiert (EU, DSGVO). Da das Projekt leer ist, kann jederzeit vor dem Livegang auf ein eu-central-1-Projekt gewechselt werden (nur `project_ref` ändern + `db push`). | Abweichung von der Spec, kein Blocker. |
| A4 | Supabase CLI | devDependency im Root (`pnpm supabase …`). Homebrew scheitert lokal an veralteten Xcode Command Line Tools. | Offizieller Installationsweg. |
| A5 | Bezeichner | DB-Werte und Code englisch, deutsche Anzeige-Labels in `packages/shared`. Code-Status: `active`, `cancelled`, `redeemed`, `no_show`, `expired` (= aktiv, storniert, eingelöst, no_show, abgelaufen). Angebotsart: `single` (= einzeltermin), `period` (= zeitraum). **Fehlercodes dagegen deutsch in Großbuchstaben**, wie in der Spec vorgegeben (`AUSGEBUCHT`, `GESPERRT`, …). | Keine Umlaute in Enums; Fehlercodes nach Vorgabe. |
| A6 | Rollenmodell | `profiles` (1:1 zu `auth.users`) mit `role` ∈ {`user`, `location`, `admin`}. Standort-Login = Auth-User mit Rolle `location`, genau ein Standort (`locations.account_id` unique). Rolle zusätzlich per **Custom Access Token Hook** im JWT; RLS-Helfer lesen sie aus dem JWT, Rollenwechsel nur per Security-Definer-Funktion/Seed. | Performante RLS. |
| A7 | Registrierung | Standort registriert sich per E-Mail + Passwort; die Registrierungsdaten (Unternehmen, Standort) kommen als `options.data` beim Sign-up mit, ein Trigger auf `auth.users` legt Profil, Unternehmen und Standort (`pending`) an. Alternativ RPC `register_location` nach Login. Nutzer aus der App bekommen per Trigger ein Profil mit Rolle `user`. Freischaltungsstatus liegt am **Standort**; weitere Standorte eines Unternehmens legt im Prototyp der Admin an. | Ein Login pro Standort, kein zweiter Schritt nötig. |
| A8 | Angebotsstatus | `offers.status` ∈ {`active`, `cancelled`, `removed`}. „Vergangen“ ergibt sich aus `ends_at < now()`. Einheitliche Felder `starts_at`/`ends_at` für beide Arten. | Einfache Abfragen. |
| A9 | Ablauf & Sperren | pg_cron-Job (alle 10 Min.): abgelaufene Codes → `expired`, abgelaufene Sperren aufheben (Zähler 0). Zusätzlich prüft jede Funktion die Zeit selbst, und die Lese-Sichten berechnen den effektiven Status (`expired`, wenn `ends_at < now()`), sodass Regeln zwischen Cron-Läufen stimmen. Einzeltermin-Codes ohne Einlösung und ohne No-Show-Markierung → `expired` (kein No-Show). | Spec. |
| A10 | Kurzcode / Token | Kurzcode 6 Zeichen aus `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (ohne 0/O/1/I/L), Format `XXX-XXX`, eindeutig unter aktiven Codes; Eingabe tolerant (Kleinbuchstaben, ohne Bindestrich). QR-Token 128 Bit (`gen_random_bytes`), Base64url, global eindeutig. | Lesbar, nicht erratbar. |
| A11 | Plätze | `offers.capacity` (Kontingent) und `offers.seats_taken` (Summe aktiver + eingelöster + No-Show-Plätze) werden nur in den RPCs unter Row-Lock gepflegt; freie Plätze = `capacity − seats_taken`. Storno (Nutzer oder Absage) gibt Plätze frei. | Atomar, schnell lesbar. |
| A12 | Öffentliche Lese-Sicht | RPCs `list_public_offers(p_category, p_location_id, p_limit, p_offset)` und `get_public_offer(p_offer_id)` (Security Definer): nur `active`, nicht abgelaufene Angebote freigegebener Standorte, mit freien Plätzen, Rabatt, Standort, Koordinaten, Bildern; sortiert nach `relevant_at` (single: `starts_at`, period: `ends_at`). Für anonyme Nutzer kein direkter Zugriff auf Basistabellen. | Datenschutz, stabile API. |
| A13 | Benachrichtigungen | `notification_outbox` (Typ `offer_cancelled` | `offer_new` | `reminder`, Empfänger, Angebot/Code, Payload, Status `pending`/`sent`/`failed`, Zeitstempel). In dieser Session schreibt nur `cancel_offer` Einträge; Versand und weitere Typen baut die App-Session. | Spec. |
| A14 | Geocoding | Tabelle `geocode_cache` jetzt; die Edge Function `geocode` (Nominatim, User-Agent mit App-Name + Kontakt, 1 Anfrage/s, nur serverseitig) wird als Grundgerüst angelegt und von der Website-Session fertig angebunden. User-Agent-Kontakt als Secret `NOMINATIM_CONTACT_EMAIL`, Platzhalter `kontakt@example.com`. | Website nutzt Geocoding zuerst. |
| A15 | Storage | Buckets `offer-images` und `company-logos`, öffentlich lesbar, max. 5 MB, nur `image/jpeg`, `image/png`, `image/webp`. Schreiben nur in den Ordner des eigenen Standorts (`{location_id}/…`) bzw. Unternehmens (`{company_id}/…`), Admin überall. | Spec. |
| A16 | Konto löschen | `delete_account()` für Nutzer: aktive Codes stornieren (Plätze frei), Favoriten/Push-Tokens löschen, Events anonymisieren (`user_id = null`), vergangene Codes behalten den Platzbezug, aber Profil wird anonymisiert, danach Auth-User löschen. Standort-Accounts löscht im Prototyp nur der Admin. | App-Store-Pflicht, Kennzahlen bleiben korrekt. |
| A17 | Akzentfarbe | Vorschläge (WCAG-Kontrast weißer Text): **Glutorange `#D63D1F` (4,6 : 1, empfohlen)**, Indigo `#4F3BE8` (6,7 : 1), Himbeere `#C4245C` (5,6 : 1). Bis zur Entscheidung: Glutorange. | Keine Markenfarbe von Uber/Wise/Airbnb. |
| A18 | Schrift | Inter (SIL OFL). Tokens nennen nur die Familie und Gewichte; die Schriftdateien binden Web (`next/font/local`) und App (`expo-font`) selbst ein. | Plattformneutrales `shared`. |
| A19 | Tests | pgTAP über `supabase test db` für alle RPCs und RLS pro Rolle. Paralleltest: Node-Skript (`scripts/`) mit vielen gleichzeitigen Anfragen gegen das Dev-Projekt, da pgTAP in einer einzigen Transaktion läuft und echte Parallelität nicht abbilden kann. Vitest für `packages/shared`. | Supabase-Standard. |
| A20 | App-Name | Arbeitstitel **„AppHackathon“**. | PO-Vorgabe. |
| A21 | Auth | Auth-Mails verschickt im Dev-Projekt der Supabase-Standardversand (stark limitiert, nur für Tests); für echte Partner ist ein SMTP-Anbieter nötig. Seed-Testkonten sind bereits bestätigt. Apple/Google-Login werden in `config.toml` vorbereitet (deaktiviert, Secrets über `.env`); einrichten muss die App-Session mit echten Keys. | Kein Blocker. |
| A22 | Ohne Docker: gemeinsames Dev-Projekt | Auf Wunsch des PO **kein lokales Supabase**. Beide entwickeln gegen das gehostete Dev-Projekt `syrdvvxtllgutvonuwzd`. Damit sich die Regel „Dev-Projekt nur aus `main`“ und „Migration vor dem Merge testen“ nicht widersprechen: (1) Migrations-PR (`backend/...`) wird reviewt, (2) nach Freigabe spielt der Autor die Migration mit `pnpm db:push` ein und lässt `pnpm test:db` laufen, (3) dann sofort mergen. **Es ist immer höchstens ein Migrations-PR gleichzeitig offen.** pgTAP-Tests laufen in Transaktionen mit Rollback und hinterlassen keine Daten. Docker/lokales Supabase kann später jederzeit ergänzt werden (die Migrationen sind dieselben). | PO-Entscheidung; vermeidet Drift ohne Branching (kostenpflichtig). |
| A23 | Stornofrist-Startwert | Die Spec nennt keinen Startwert für X: **24 Std.** vor Start (Admin-Einstellung). | Üblich für Kurse, änderbar. |
| A24 | Seed im Dev-Projekt | Der Seed ist idempotent und wird mit `pnpm db:seed` eingespielt (Skript, das Testkonten über die Auth-Admin-API anlegt und danach `supabase/seed.sql` ausführt). Testdaten sind klar markiert (E-Mails `*@test.apphackathon.de`) und lassen sich gezielt entfernen. | Auth-User sauber anlegen statt per SQL in `auth.users`. |
| A25 | TypeScript | TypeScript 6.0 (wie Expo SDK 58), nicht 7.x – typescript-eslint unterstützt aktuell nur < 6.1. | Kompatibilität. |
