# apps/mobile – Nutzer-App (iOS + Android)

**Zuständig:** @Mecrylol (Ben) · **Status:** Platzhalter – wird in einer eigenen Claude-Code-Session gebaut.

Geplanter Stack (siehe [docs/SPEC.md](../../docs/SPEC.md)):

- Expo (SDK 58) mit TypeScript und Expo Router, Development Build über EAS
- Supabase-Auth (E-Mail-OTP, Sign in with Apple, Google)
- Design-Tokens aus `@app/shared/tokens`, Fehlertexte über `getErrorMessage()` aus `@app/shared`
- Geschäftsregeln **nur** über die RPCs aus [docs/BACKEND.md](../../docs/BACKEND.md)

## Start der App-Session

1. Repo nach [README](../../README.md) einrichten.
2. Expo-App hier anlegen (`npx create-expo-app@latest .`), Paketname `@app/mobile`, `"@app/shared": "workspace:*"`.
3. Monorepo-Hinweise der Expo-Doku beachten: keine Metro-Sonderkonfiguration nötig, eine React-Version im Repo,
   bei Problemen mit isolierten Installs `nodeLinker: hoisted` in `pnpm-workspace.yaml` (gemeinsamer PR).
4. Expo-Regeln: [AGENTS.md](./AGENTS.md). Eigene `apps/mobile/CLAUDE.md` ausbauen.
