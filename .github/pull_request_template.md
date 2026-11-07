## Was ändert sich?

<!-- 1–3 Sätze. Bei UI-Änderungen: Screenshot. -->

## Bereich

- [ ] `apps/mobile` (App)
- [ ] `apps/web` (Website)
- [ ] **Gemeinsam:** `supabase/`, `packages/shared/` oder Root-Konfiguration → eigener PR, Review durch den anderen

## Checkliste

- [ ] `pnpm typecheck` grün
- [ ] `pnpm lint` grün
- [ ] `pnpm test` grün
- [ ] **Migration:** nur neue Datei(en), keine bestehende geändert; vorher `main` gepullt
- [ ] **Typen:** nach Migration `pnpm gen:types` ausgeführt und mitcommittet
- [ ] **DB-Tests:** `pnpm test:db` grün (bei Änderungen an `supabase/`)
- [ ] **Doku:** `docs/BACKEND.md` aktualisiert (neue/geänderte Tabellen, RPCs, Fehlercodes)
- [ ] Keine Secrets im Diff (`.env` bleibt lokal)

## Nach dem Merge

- [ ] Migration enthalten? → `pnpm db:push` ausführen (gehostetes Dev-Projekt nur aus `main`)
