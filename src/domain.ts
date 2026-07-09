/* ============================================================
   HeimDesk — Domänenmodell, Konstanten & Seed-Daten
   Portiert aus der verifizierten Vanilla-Version, typisiert.
   ============================================================ */

export type TicketType = 'ticket' | 'incident' | 'service_request' | 'problem' | 'task' | 'change'
export type Status = 'new' | 'in_progress' | 'assigned' | 'paused' | 'resolved' | 'closed'
export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type Role = 'user' | 'agent'
export type JournalKind = 'system' | 'status' | 'comment'

export interface Attachment { name: string; size: number; type: string; dataUrl: string }
export interface JournalEntry {
  ts: number
  author: string
  kind: JournalKind
  text: string
  from?: Status
  to?: Status
}
export interface Rating { stars: number; comment: string }

export interface Ticket {
  uid: string
  number: number
  type: TicketType
  status: Status
  summary: string
  description: string
  category: string
  priority: Priority
  responsibleUser: string | null
  responsibleRole: string | null
  affectedUser: string
  assetId: string | null
  createdAt: number
  updatedAt: number
  attachments: Attachment[]
  journal: JournalEntry[]
  solution: string | null
  resolvedAt: number | null
  closedAt: number | null
  rating: Rating | null
  pausedUntil: number | null
  withdrawReason: string | null
  reopenReason: string | null
}

export interface Asset { id: string; name: string; type: string; location: string; category: string }
export interface ServiceItem { id: string; name: string; icon: string; desc: string; category: string; priority: Priority }
export interface KBVersion { v: number; date: number; author: string; body: string }
export interface KBArticle { id: string; title: string; category: string; versions: KBVersion[] }

export interface Settings {
  pauseReactivationDays: number
  resolvedAutoCloseDays: number
  reopenLocked: boolean
  escalationDays: number
  emailNotify: boolean
}

export interface DB {
  counter: number
  settings: Settings
  users: string[]
  roles: string[]
  categories: string[]
  assets: Asset[]
  services: ServiceItem[]
  kb: KBArticle[]
  tickets: Ticket[]
}

export interface Filters {
  status?: Status
  type?: TicketType
  priority?: Priority
  category?: string
  responsibleUser?: string
  responsibleRole?: string
  asset?: string
  affectedUser?: string
  from?: string
  to?: string
}
export type QuickFilter = 'open' | 'mine' | 'week' | 'escalated' | 'unrated' | null
export type View = 'list' | 'detail' | 'create' | 'edit' | 'kb' | 'kbArticle' | 'catalog' | 'assets' | 'settings' | 'search' | 'dashboard'

export interface CreatePrefill {
  summary?: string
  description?: string
  category?: string
  priority?: Priority
  type?: TicketType
  assetId?: string | null
  responsibleUser?: string | null
  responsibleRole?: string | null
}

export interface UIState {
  view: View
  role: Role
  user: string
  current?: string
  filters: Filters
  quick: QuickFilter
  sort: { key: string; dir: number }
  remember: boolean
  searchQuery?: string
  createPrefill?: CreatePrefill | null
}

/* ---------- Konstanten ---------- */
export interface StatusMeta { label: string; color: string; bg: string; border: string; open: boolean }
export const STATUS: Record<Status, StatusMeta> = {
  new:         { label: 'Neu',            color: '#0369a1', bg: '#e0f2fe', border: '#38bdf8', open: true },
  in_progress: { label: 'In Bearbeitung', color: '#1e40af', bg: '#dbeafe', border: '#3b82f6', open: true },
  assigned:    { label: 'Zugewiesen',     color: '#15803d', bg: '#dcfce7', border: '#4ade80', open: true },
  paused:      { label: 'Pausiert',       color: '#92400e', bg: '#fef3c7', border: '#f59e0b', open: true },
  resolved:    { label: 'Gelöst',         color: '#6d28d9', bg: '#ede9fe', border: '#8b5cf6', open: true },
  closed:      { label: 'Geschlossen',    color: '#166534', bg: '#bbf7d0', border: '#22c55e', open: false },
}
export const STATUS_ORDER: Status[] = ['new', 'in_progress', 'assigned', 'paused', 'resolved', 'closed']

export interface TypeMeta { label: string; prefix: string; icon: string }
export const TYPES: Record<TicketType, TypeMeta> = {
  ticket:          { label: 'Ticket',          prefix: 'TIC', icon: '🎫' },
  incident:        { label: 'Incident',        prefix: 'INC', icon: '⚠️' },
  service_request: { label: 'Service Request', prefix: 'SR',  icon: '🛎️' },
  problem:         { label: 'Problem',         prefix: 'PRB', icon: '🔍' },
  task:            { label: 'Task',            prefix: 'TSK', icon: '✅' },
  change:          { label: 'Change',          prefix: 'CHG', icon: '🔧' },
}
export const TYPE_ORDER: TicketType[] = ['ticket', 'incident', 'service_request', 'problem', 'task', 'change']

export interface PriorityMeta { label: string; reaction: number; resolution: number; rank: number; color: string }
export const PRIORITY: Record<Priority, PriorityMeta> = {
  low:      { label: 'Niedrig',  reaction: 24, resolution: 72, rank: 1, color: '#64748b' },
  medium:   { label: 'Mittel',   reaction: 8,  resolution: 24, rank: 2, color: '#0891b2' },
  high:     { label: 'Hoch',     reaction: 4,  resolution: 8,  rank: 3, color: '#ea580c' },
  critical: { label: 'Kritisch', reaction: 1,  resolution: 4,  rank: 4, color: '#dc2626' },
}
export const PRIORITY_ORDER: Priority[] = ['low', 'medium', 'high', 'critical']

export const TRANSFORM: Record<TicketType, TicketType[]> = {
  ticket:          ['incident', 'service_request', 'problem', 'change', 'task'],
  incident:        ['problem', 'change', 'task', 'service_request'],
  service_request: ['task', 'change', 'incident'],
  problem:         ['change', 'task', 'incident'],
  task:            ['incident', 'change'],
  change:          ['task', 'problem'],
}

export const DB_KEY = 'heimdesk_db_v1'
export const UI_KEY = 'heimdesk_ui_v1'

/* ---------- Seed ---------- */
function mkSeed(
  num: number, type: TicketType, status: Status, summary: string, description: string,
  category: string, priority: Priority, respUser: string | null, respRole: string | null,
  affected: string, assetId: string | null, created: number, updated: number,
  extra: { solution?: string; resolvedAt?: number; closedAt?: number; rating?: Rating } = {},
): Ticket {
  const j: JournalEntry[] = [{ ts: created, author: affected || 'System', kind: 'system', text: 'Ticket erstellt' }]
  if (status !== 'new') j.push({ ts: updated, author: respUser || 'System', kind: 'status', text: '', from: 'new', to: status })
  if (extra.solution) j.push({ ts: extra.resolvedAt || updated, author: respUser || 'System', kind: 'status', text: 'Lösung: ' + extra.solution, from: 'in_progress', to: 'resolved' })
  if (extra.closedAt) j.push({ ts: extra.closedAt, author: 'System', kind: 'status', text: '', from: 'resolved', to: 'closed' })
  return {
    uid: 't' + num, number: num, type, status, summary, description, category, priority,
    responsibleUser: respUser, responsibleRole: respRole, affectedUser: affected || 'Niklas',
    assetId, createdAt: created, updatedAt: extra.closedAt || updated,
    attachments: [], journal: j, solution: extra.solution || null, resolvedAt: extra.resolvedAt || null,
    closedAt: extra.closedAt || null, rating: extra.rating || null, pausedUntil: null,
    withdrawReason: null, reopenReason: null,
  }
}

export function seed(now: number): DB {
  const d = (days: number) => now - days * 86400000
  return {
    counter: 6,
    settings: { pauseReactivationDays: 3, resolvedAutoCloseDays: 5, reopenLocked: false, escalationDays: 4, emailNotify: true },
    users: ['Niklas', 'Anna', 'Papa', 'Mama'],
    roles: ['1st Level Support', '2nd Level Support', 'Haustechnik', 'Einkauf'],
    categories: ['Haushalt', 'Reparatur', 'IT / Netzwerk', 'Familie / Anfrage', 'Sonstiges'],
    assets: [
      { id: 'A1', name: 'Waschmaschine (Bosch)', type: 'Haushaltsgerät', location: 'Keller', category: 'Reparatur' },
      { id: 'A2', name: 'WLAN-Router (Fritz!Box)', type: 'Netzwerk', location: 'Flur', category: 'IT / Netzwerk' },
      { id: 'A3', name: 'Drucker (HP)', type: 'IT', location: 'Arbeitszimmer', category: 'IT / Netzwerk' },
      { id: 'A4', name: 'Geschirrspüler', type: 'Haushaltsgerät', location: 'Küche', category: 'Reparatur' },
    ],
    services: [
      { id: 'S1', name: 'Neues Gerät einrichten', icon: '🖥️', desc: 'Ein neues Gerät im Heimnetz einbinden und konfigurieren.', category: 'IT / Netzwerk', priority: 'medium' },
      { id: 'S2', name: 'WLAN-Passwort ändern', icon: '🔑', desc: 'Neues WLAN-Passwort setzen und an alle Geräte verteilen.', category: 'IT / Netzwerk', priority: 'low' },
      { id: 'S3', name: 'Möbel aufbauen', icon: '🪑', desc: 'Neues Möbelstück aufbauen (Werkzeug & Zeit einplanen).', category: 'Haushalt', priority: 'low' },
      { id: 'S4', name: 'Großeinkauf organisieren', icon: '🛒', desc: 'Wocheneinkauf planen und durchführen.', category: 'Familie / Anfrage', priority: 'medium' },
    ],
    kb: [
      { id: 'K1', title: 'WLAN neu verbinden nach Passwortwechsel', category: 'IT / Netzwerk', versions: [
        { v: 1, date: d(40), author: 'Niklas', body: 'Am Gerät die WLAN-Einstellungen öffnen, altes Netz „vergessen", neues Passwort eingeben.' },
        { v: 2, date: d(10), author: 'Niklas', body: '1. WLAN-Einstellungen öffnen\n2. Bestehendes Netz **vergessen/entfernen**\n3. Netz erneut wählen und *neues* Passwort eingeben\n4. Bei Problemen: Router 30 Sek. vom Strom trennen.' },
      ] },
      { id: 'K2', title: 'Waschmaschine pumpt nicht ab', category: 'Reparatur', versions: [
        { v: 1, date: d(22), author: 'Papa', body: 'Flusensieb unten vorne prüfen und reinigen. Ablaufschlauch auf Knick kontrollieren. Danach Testlauf starten.' },
      ] },
    ],
    tickets: [
      mkSeed(1, 'incident', 'in_progress', 'Drucker druckt nur leere Seiten', 'Der HP-Drucker zieht Papier ein, gibt aber komplett weiße Blätter aus. Reinigungslauf schon versucht.', 'IT / Netzwerk', 'high', 'Niklas', '2nd Level Support', 'Papa', 'A3', d(2), d(1)),
      mkSeed(2, 'service_request', 'assigned', 'Neues WLAN-Passwort für Gäste', 'Bitte ein separates Gäste-WLAN mit einfachem Passwort einrichten.', 'IT / Netzwerk', 'low', 'Niklas', '1st Level Support', 'Mama', null, d(4), d(3)),
      mkSeed(3, 'ticket', 'new', 'Geschirrspüler macht komische Geräusche', 'Beim Spülgang ein lautes Brummen, riecht leicht verschmort.', 'Reparatur', 'medium', null, 'Haustechnik', 'Anna', 'A4', d(0.3), d(0.3)),
      mkSeed(4, 'incident', 'resolved', 'WLAN im Schlafzimmer sehr langsam', 'Download bricht ständig ab, Streaming ruckelt nur in diesem Raum.', 'IT / Netzwerk', 'medium', 'Niklas', '2nd Level Support', 'Anna', 'A2', d(9), d(2), { solution: 'Repeater umgestellt und 5-GHz-Kanal fixiert. Durchsatz nun stabil bei ~90 Mbit/s.', resolvedAt: d(2) }),
      mkSeed(5, 'task', 'closed', 'Rauchmelder Batterien tauschen', 'Alle 4 Rauchmelder mit neuen Batterien versehen.', 'Haushalt', 'low', 'Papa', 'Haustechnik', 'Papa', null, d(20), d(14), { solution: 'Alle Batterien getauscht und Funktion getestet.', resolvedAt: d(15), closedAt: d(14), rating: { stars: 5, comment: 'Schnell erledigt, danke!' } }),
    ],
  }
}
