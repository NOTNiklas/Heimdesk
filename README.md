# HeimDesk — Service Desk

Clientseitiger Service-Desk (React + Vite + TypeScript). Tickets werden lokal
im `localStorage` gehalten; optional lässt sich die App als PWA installieren und
über Supabase geräteübergreifend synchronisieren.

## Entwicklung

```bash
npm install
npm run dev      # http://localhost:4602
npm run build    # Typecheck + Produktions-Build nach dist/
```

Der Deploy nach GitHub Pages läuft automatisch über
`.github/workflows/deploy.yml` (Source in den Repo-Einstellungen muss auf
**GitHub Actions** stehen).

## Als App aufs Handy (PWA)

Nach dem Deploy die Seite im Browser öffnen:

- **Android (Chrome):** Menü → „App installieren"
- **iPhone (Safari):** Teilen → „Zum Home-Bildschirm"

Die App läuft dann im Vollbild und offline.

## Cloud-Sync über Supabase (optional, kostenlos)

Standardmäßig bleiben alle Daten nur lokal im Browser. Für Synchronisation
zwischen mehreren Geräten:

1. Kostenloses Projekt auf [supabase.com](https://supabase.com) anlegen.
2. In Supabase → **SQL Editor** das Setup-SQL ausführen (findet sich auch
   direkt in der App unter **Einstellungen → Cloud-Sync → „SQL für Supabase"**).
   Es legt eine Tabelle sowie zwei RPC-Funktionen (`heimdesk_get` / `heimdesk_set`)
   an; die Tabelle selbst ist per Row-Level-Security gegen Auflisten geschützt.
3. In der App unter **Einstellungen → Cloud-Sync** eintragen:
   - **Project-URL** und **Anon Public Key** (Supabase → Project Settings → API)
   - einen selbst gewählten **Sync-Code** (geheim, auf allen Geräten gleich –
     per „🎲 Neu" lässt sich ein zufälliger erzeugen)
4. „Verbinden & synchronisieren". Auf weiteren Geräten dieselben drei Werte
   eintragen.

### Wie die Synchronisation arbeitet

- Die komplette Datenbank wird als **ein JSON-Dokument** gespeichert, adressiert
  über den **SHA-256-Hash** des Sync-Codes – der Klartext-Code verlässt das Gerät nie.
- Änderungen werden **debounced hochgeladen**, sobald Internet verfügbar ist;
  offline wird weitergearbeitet und beim nächsten Online-Ereignis übertragen.
- Konfliktstrategie: **letzte Änderung gewinnt** (Zeitstempel auf Dokumentebene).
  Für den privaten Ein-Personen-Betrieb auf eigenen Geräten ausreichend; bei
  parallelen Offline-Änderungen an mehreren Geräten kann die zuletzt
  synchronisierte Version die andere überschreiben.

> Hinweis: Der Anon-Key ist ein öffentlicher Client-Schlüssel und darf im
> Browser liegen. Der Zugriff wird über den geheimen Sync-Code abgesichert –
> daher einen ausreichend langen, zufälligen Code verwenden.
