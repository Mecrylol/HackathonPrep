// Platzhalter – wird in Phase 2 mit `pnpm gen:types` aus der Datenbank erzeugt. Nicht von Hand bearbeiten.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
