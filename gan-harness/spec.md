# Spec — HeimDesk (Matrix42-ESM-Klon, Heimgebrauch)

Vereinfachter, aber strukturell originalgetreuer Klon des **Matrix42 ESM Service Desk** als **React-SPA** (Vite + TypeScript), komplett clientseitig, Persistenz via `localStorage`. Zielgruppe: privater Haushalt/Familie.

Basis-Verzeichnis: `heimdesk-react/` · Design-Richtung: **edel & Matrix42-nah** (Enterprise-Klarheit, keine experimentelle Optik).

## Rollen (Umschalter, kein Login)
- **Endnutzer** (Self-Service): erstellen, kommentieren, bewerten, zurückziehen, wiedereröffnen; sieht nur eigene/zugewiesene Vorgänge.
- **Agent**: bearbeiten, zuweisen, **übernehmen**, Status ändern, transformieren; sieht alles.

## Ticket-Typen & Lifecycle
Ticket · Incident · Service Request · Problem · Task · Change. Agent kann per **Transform** umwandeln (Ticket → Incident/Service Request → ggf. Problem → ggf. Change).

## Status (Farbcodierung)
Neu (hellblau) · In Bearbeitung (blau) · Zugewiesen (hellgrün) · Pausiert (amber, Auto-Reaktivierung nach X Tagen) · Gelöst (violett, Auto-Close nach X Tagen ohne Rückmeldung) · Geschlossen (grün).

## Felder
Zusammenfassung, Beschreibung, Kategorie, Status, Priorität/SLA (Reaktions-/Lösungszeit), Verantw. Nutzer, Verantw. Rolle, Betroffener, Asset, Erstell-/Änderungsdatum, Anhänge, Journal (chronologisch inkl. Statuswechsel), Lösung, Bewertung (1–5 Sterne + Kommentar, nur Ersteller nach Abschluss).

## Aktionen (alle MÜSSEN real mutieren & persistieren)
erstellen (mit Datei-Upload) · aus Asset/Service vorbefüllt erstellen · kommentieren (**fett**/*kursiv*/Links) · **übernehmen (Take-over)** · zuweisen (→ Zugewiesen) · Status ändern · pausieren · abschließen (Pflichtfeld Lösung → Gelöst) · Lösung bestätigen (→ Geschlossen) · zurückziehen (Begründung → Geschlossen) · wiedereröffnen (Begründung → Neu, sperrbar) · bewerten · transformieren · alle Felder nachträglich editierbar.

## Listen/Filter/Suche
Farbcodierte Listenansicht; Filter (Status, Typ, Priorität, Kategorie, Verantw. Nutzer/Rolle, Asset, Betroffener, Zeitraum) UND-kombinierbar; Schnellfilter (Nur offene, Mir zugewiesen, Diese Woche, Eskaliert, Unbewertet); sortierbare Spalten; Filter merkbar. Volltextsuche über alle Typen + Wissensdatenbank.

## Module
Wissensdatenbank (Versionierung, Auto-Vorschläge bei Erstellung) · Service-Katalog (→ Service Request) · Asset-Verwaltung · simulierte E-Mail-Benachrichtigung · Eskalations-Hinweis · Dashboard · Export/Import (JSON).

## Vollständigkeit (WICHTIG)
Kein Mockup, keine Platzhalter. Tickets persistent über Reload/Sitzungen. Jede Aktion funktioniert real. Filter/Suche real auf gespeicherten Daten.
