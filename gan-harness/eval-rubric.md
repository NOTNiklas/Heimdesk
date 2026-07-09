# Eval-Rubrik — HeimDesk (angepasste gan-design-Rubrik)

Bewusste Abweichung von der gan-design-Default (Functionality 0.10): Der Auftrag fordert ausdrücklich ein **vollständig funktionsfähiges** System („kein Mockup"). Funktionalität ist daher ein **hartes Gate**.

| Dimension | Gewicht | Worauf achten |
|---|---|---|
| **Design Quality & Polish** | 0.30 | Visuelle Klarheit, Typo-Hierarchie, Abstände, Farbcodierung der Status, Konsistenz, Micro-Interaktionen, Light/Dark-Mode. |
| **Matrix42-Authentizität** | 0.20 | Struktur/Workflow/Look nah am ESM Service Desk: Self-Service vs. Agent-Sicht, Ticket-Lifecycle, Journal, Detail-Layout, Badges. |
| **Craft** | 0.20 | Code-Sauberkeit, Responsive (Mobile/Tablet/Desktop), Zugänglichkeit (Fokus, ARIA, Tastatur), keine Konsolen-Fehler. |
| **Functionality (HARTES GATE)** | 0.30 | Jede Aktion mutiert real & persistiert (Reload-fest). Siehe Checkliste. |

## Score & Bestehen
- Gewichteter Score 1–10. **Pass-Schwelle: 7.5.**
- **Hartes Gate:** Ist eine Kern-Aktion kaputt ODER gehen Daten nach Reload verloren → **automatischer Fail**, egal wie hoch der Score. Dann `gate_failed: true` und konkrete Reproduktion.

## Functionality-Checkliste (alle müssen bestehen)
1. Ticket erstellen → nach **Reload** noch vorhanden (Persistenz).
2. Ticket per Klick öffnen → Detailansicht mit allen Feldern + komplettem Journal.
3. **Übernehmen**: Verantwortlicher = aktueller Agent, Status passt sich an, Journal-Eintrag.
4. Zuweisen → Status „Zugewiesen".
5. Status ändern / Pausieren / Abschließen (Pflicht-Lösung) / Lösung bestätigen (→ Geschlossen).
6. Zurückziehen (Begründung → Geschlossen) / Wiedereröffnen (→ Neu).
7. Bewerten (Sterne + Kommentar) / Transformieren (Typwechsel).
8. Alle Felder editierbar (Bearbeiten-Formular).
9. Filter (kombiniert) + Schnellfilter + Sortierung + Volltextsuche real auf gespeicherten Daten.
10. Rollen-Umschalter + Sichtbarkeits-Scoping; KB-Versionierung; Katalog→SR; Asset→Ticket.

## Ausgabeformat (JSON)
```json
{
  "scores": { "design": 0-10, "authenticity": 0-10, "craft": 0-10, "functionality": 0-10 },
  "weighted": 0-10,
  "gate_failed": false,
  "pass": true,
  "strengths": ["…"],
  "issues": [{ "severity": "high|med|low", "area": "…", "detail": "…", "fix": "…" }],
  "next_actions": ["priorisierte, konkrete Verbesserungen für die nächste Runde"]
}
```
