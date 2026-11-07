# CLAUDE.md – apps/web

Gilt zusätzlich zur Root-[CLAUDE.md](../../CLAUDE.md). Wird von der Web-Session ausgebaut.

- Zuständig: Kollege (@arwedc). Arbeit in Branches `web/...`.
- Nur in `apps/web/` frei ändern. Änderungen an `supabase/` oder `packages/shared/` → eigener `backend/...`-PR.
- Backend-Schnittstelle: [docs/BACKEND.md](../../docs/BACKEND.md). Fehler über `getErrorMessage()` aus `@app/shared` übersetzen.
- Design: nur Tokens aus `@app/shared/tokens`; Komponentenbibliothek in `apps/web/src/components/ui`.
