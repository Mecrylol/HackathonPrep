# apps/web – Website für Standorte + Admin

**Zuständig:** @arwedc · **Status:** Platzhalter – wird in einer eigenen Claude-Code-Session gebaut.

Geplanter Stack (siehe [docs/SPEC.md](../../docs/SPEC.md)):

- Next.js (App Router), TypeScript strict, Tailwind CSS – Theme aus `@app/shared/tokens` (`toCssVariables`)
- Supabase-Auth über `@supabase/ssr` (Standorte: E-Mail + Passwort)
- `lucide-react` für Icons, MapLibre + OpenFreeMap für Karten, `qr-scanner` für den Scanner
- Geschäftsregeln **nur** über die RPCs aus [docs/BACKEND.md](../../docs/BACKEND.md)

## Start der Web-Session

1. Repo nach [README](../../README.md) einrichten.
2. Next.js hier anlegen (`pnpm create next-app@latest .` mit TypeScript, Tailwind, App Router, `src/`).
3. Paketname `@app/web`, Abhängigkeit `"@app/shared": "workspace:*"`.
4. **React-Version = die der Expo-SDK der App** (eine React-Version im ganzen Repo).
5. Eigene `apps/web/CLAUDE.md` mit web-spezifischen Regeln anlegen.
