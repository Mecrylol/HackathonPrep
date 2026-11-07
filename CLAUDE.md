# CLAUDE.md

Plattform für lokale, vergünstigte Kurzfrist-Angebote in Münster (Prototyp). Spezifikation und Annahmen: [docs/SPEC.md](docs/SPEC.md). Backend-Referenz (Tabellen, RPCs, Fehlercodes, RLS, Testzugänge): [docs/BACKEND.md](docs/BACKEND.md).

`apps/web` und `apps/mobile` haben eigene `CLAUDE.md`-Dateien mit app-spezifischen Regeln. Diese Datei gilt für das ganze Repo.

## Projektstruktur

```
apps/
  web/          Next.js – Website für Standorte + Admin (Kollege)
  mobile/       Expo – Nutzer-App iOS/Android (Ben)
packages/
  shared/       plattformneutral (kein DOM, kein Node): Supabase-Typen, Zod-Schemas,
                Konstanten, RPC-Fehlercodes, Design-Tokens, Hilfsfunktionen + Tests
supabase/
  migrations/   SQL-Migrationen (einzige Quelle für Schemaänderungen)
  functions/    Edge Functions (Deno)
  tests/        pgTAP-Tests
  seed.sql      Münster-Testdaten + Testzugänge
scripts/        Repo-Skripte (z. B. Paralleltest)
docs/           SPEC.md, BACKEND.md
.github/        CODEOWNERS, PR-Vorlage
```

## Befehle

```bash
pnpm install                         # Abhängigkeiten
pnpm typecheck                       # tsc in allen Paketen
pnpm lint                            # ESLint in allen Paketen
pnpm test                            # Vitest (packages/shared u. a.)
pnpm format                          # Prettier
pnpm supabase migration new <name>   # neue Migration anlegen
pnpm db:push:dry                     # zeigt, welche Migrationen eingespielt würden
pnpm db:push                         # Migrationen ins gehostete Dev-Projekt (siehe Regeln unten)
pnpm db:seed                         # Testdaten + Testkonten ins Dev-Projekt (idempotent)
pnpm test:db                         # pgTAP-Tests gegen das Dev-Projekt (Rollback, keine Datenreste)
pnpm test:concurrency                # Paralleltest „letzter Platz“ gegen das Dev-Projekt
pnpm gen:types                       # Typen aus dem Dev-Projekt → packages/shared/src/database.types.ts
```

## Zusammenarbeit (zwei Entwickler parallel)

- **Zuständigkeiten:** Ben → `apps/mobile`. Kollege → `apps/web`. Jeder auf seinem Rechner mit eigener Claude-Code-Session.
- **Git & GitHub:** `main` ist geschützt, Änderungen nur per Pull Request. Branches: `web/...`, `app/...`, `backend/...`. Kleine PRs, oft mergen. `main` mindestens täglich in den eigenen Branch holen.
- **Eigene Ordner** (`apps/web` bzw. `apps/mobile`): jeder ändert frei.
- **Gemeinsame Bereiche** (`supabase/`, `packages/shared/`, Root-Konfiguration):
  - nur in einem **eigenen, kleinen PR** (`backend/...`), den der andere kurz reviewt
  - **nie** nebenbei in einem Feature-PR verstecken. Braucht ein Feature eine Backend-Änderung: erst Backend-PR, mergen, dann Feature weiterbauen.
- **Migrationen:**
  - bestehende Migrationen **nie ändern**, nur neue hinzufügen
  - vor `supabase migration new` erst `main` pullen
  - nach jeder Migration `pnpm gen:types` und die Typen mitcommitten
- **Datenbank (ohne Docker, ein gemeinsames Dev-Projekt `syrdvvxtllgutvonuwzd`):**
  - beide entwickeln gegen das **gehostete Dev-Projekt** – es gibt kein lokales Supabase
  - **höchstens ein Migrations-PR gleichzeitig offen** (vorher kurz absprechen)
  - Ablauf: Migrations-PR → Review-Freigabe → Autor führt `pnpm db:push` und `pnpm test:db` aus → **sofort mergen**
  - nie Schema im Supabase-Dashboard oder per MCP ändern – nur über Migrationsdateien
  - Testdaten nur über `pnpm db:seed`; keine Produktivdaten im Dev-Projekt
- **Nach jedem Pull von `main`:** `pnpm install` (Typen liegen aktuell im Repo; bei Zweifel `pnpm gen:types`).
- **Claude-Sessions:** Arbeite nur im eigenen App-Ordner. Wenn eine Änderung an `supabase/` oder `packages/shared/` nötig ist, sag das dem Nutzer und schlage einen separaten `backend/...`-PR vor, statt sie im Feature-Branch mitzumachen.

## Konventionen

- **Sprache:** UI Deutsch; Code, Bezeichner und DB-Werte Englisch; deutsche Labels in `packages/shared`. RPC-Fehlercodes deutsch in Großbuchstaben (`AUSGEBUCHT`, `GESPERRT`, …), Liste in `packages/shared/src/errors.ts`.
- **Zeit:** `timestamptz`, Anzeige und Eingabe in Europe/Berlin über die Helfer aus `packages/shared`.
- **Geld:** Integer-Cent (EUR), Formatierung nur über `formatPrice` aus `packages/shared`.
- **Geschäftsregeln nur in Postgres-Funktionen.** Clients rufen RPCs auf; Client-Validierung (Zod) ist nur Komfort.
- **RLS auf jeder Tabelle.** Rollen `user`, `location`, `admin`. Security-Definer-Funktionen mit `set search_path = ''` und voll qualifizierten Namen; nicht benötigte `EXECUTE`-Rechte entziehen.
- **`packages/shared` bleibt plattformneutral:** kein `window`, `document`, `fs`, `process`; nur Abhängigkeiten, die in Browser, Node und React Native laufen (z. B. `zod`). Kein Build-Schritt – Apps importieren die TS-Quellen.
- **Eine React-Version im ganzen Repo** (die der Expo-SDK), sonst bricht die App (Expo-Monorepo-Doku).
- **Design:** nur Tokens aus `@app/shared/tokens`, keine Hex-/Pixelwerte im App- oder Web-Code. Eine Akzentfarbe, sonst Schwarz/Weiß/Grau.
- **Secrets** nur in `.env`-Dateien (gitignored); jede Variable steht in `.env.example`.
- Vor Arbeit mit Supabase, Expo oder Next.js die aktuelle offizielle Doku prüfen.

## Definition of Done (jeder PR)

`pnpm typecheck && pnpm lint && pnpm test` grün · bei DB-Änderungen `pnpm test:db` grün, Migration neu (nicht geändert), Typen generiert · Doku (`docs/BACKEND.md`) aktualisiert, wenn sich Tabellen/RPCs ändern.
