# CLAUDE.md – apps/mobile

Gilt zusätzlich zur Root-[CLAUDE.md](../../CLAUDE.md). Expo-Regeln: @AGENTS.md. Wird von der App-Session ausgebaut.

- Zuständig: Ben (@Mecrylol). Arbeit in Branches `app/...`.
- Nur in `apps/mobile/` frei ändern. Änderungen an `supabase/` oder `packages/shared/` → eigener `backend/...`-PR.
- Backend-Schnittstelle: [docs/BACKEND.md](../../docs/BACKEND.md). Push-Versand liest `notification_outbox`.
- Design: nur Tokens aus `@app/shared/tokens`.
