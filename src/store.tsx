/* ============================================================
   HeimDesk — Store (Context + Persistenz + Automatik + Aktionen)
   ============================================================ */
import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import {
  DB_KEY, UI_KEY, STATUS, TYPES, seed,
  type DB, type UIState, type Ticket, type Status, type Filters,
  type Priority, type TicketType, type Rating, type Attachment,
} from './domain'
import { displayId, isEscalated, readFiles } from './lib'

/* ---------- Laden / Speichern ---------- */
function loadDB(): DB {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) { const d = JSON.parse(raw); if (d && d.tickets) return d as DB }
  } catch { /* ignore */ }
  return seed(Date.now())
}
function loadUI(): UIState {
  try {
    const raw = localStorage.getItem(UI_KEY)
    if (raw) { const u = JSON.parse(raw); if (u && u.view) return { ...defaultUI(), ...u } }
  } catch { /* ignore */ }
  return defaultUI()
}
function defaultUI(): UIState {
  return { view: 'list', role: 'agent', user: 'Niklas', filters: {}, quick: null, sort: { key: 'createdAt', dir: -1 }, remember: true, createPrefill: null }
}
function persistDB(db: DB) { try { localStorage.setItem(DB_KEY, JSON.stringify(db)) } catch { /* Speicher nicht verfügbar (z. B. Sandbox/Privatmodus) */ } }
function persistUI(ui: UIState) { try { localStorage.setItem(UI_KEY, JSON.stringify(ui)) } catch { /* ignore */ } }

/* ---------- Journal-Helfer ---------- */
function logChange(t: Ticket, author: string, from: Status, to: Status, text = '') {
  t.journal.push({ ts: Date.now(), author, kind: 'status', from, to, text })
}
function logComment(t: Ticket, author: string, text: string) {
  t.journal.push({ ts: Date.now(), author, kind: 'comment', text })
}
function logSystem(t: Ticket, author: string, text: string) {
  t.journal.push({ ts: Date.now(), author, kind: 'system', text })
}
function notifyEmail(db: DB, t: Ticket, subject: string) {
  if (!db.settings.emailNotify) return
  const to = [t.affectedUser, t.responsibleUser].filter(Boolean).join(', ')
  console.log('[E-Mail] an ' + to + ': ' + subject + ' — ' + displayId(t))
}

/* ---------- Automatik ---------- */
function runAutomation(db: DB): boolean {
  const now = Date.now(); let changed = false
  db.tickets.forEach(t => {
    if (t.status === 'paused' && t.pausedUntil && t.pausedUntil <= now) {
      logChange(t, 'System', 'paused', 'in_progress', 'Automatisch reaktiviert nach Pause.')
      t.status = 'in_progress'; t.pausedUntil = null; t.updatedAt = now; changed = true
    }
    if (t.status === 'resolved' && t.resolvedAt) {
      const days = (now - t.resolvedAt) / 86400000
      if (days >= db.settings.resolvedAutoCloseDays) {
        t.journal.push({ ts: now, author: 'System', kind: 'status', from: 'resolved', to: 'closed',
          text: 'Automatisch geschlossen (keine Rückmeldung innerhalb ' + db.settings.resolvedAutoCloseDays + ' Tagen).' })
        t.status = 'closed'; t.closedAt = now; t.updatedAt = now; changed = true
      }
    }
  })
  return changed
}

/* ---------- Sichtbarkeit / Rechte ---------- */
export function canSee(ui: UIState, t: Ticket): boolean {
  return ui.role === 'agent' || t.affectedUser === ui.user || t.responsibleUser === ui.user
}
export function isOwner(ui: UIState, t: Ticket): boolean { return t.affectedUser === ui.user }
export function isAgent(ui: UIState): boolean { return ui.role === 'agent' }

/* ---------- Selektoren ---------- */
export function selectVisible(db: DB, ui: UIState): Ticket[] { return db.tickets.filter(t => canSee(ui, t)) }
export function applyQuick(list: Ticket[], ui: UIState, escalationDays: number): Ticket[] {
  switch (ui.quick) {
    case 'open': return list.filter(t => STATUS[t.status].open)
    case 'mine': return list.filter(t => t.responsibleUser === ui.user)
    case 'week': { const wk = Date.now() - 7 * 86400000; return list.filter(t => t.createdAt >= wk) }
    case 'escalated': return list.filter(t => isEscalated(t, escalationDays))
    case 'unrated': return list.filter(t => t.status === 'closed' && !t.rating)
    default: return list
  }
}
export function applyFilters(list: Ticket[], f: Filters): Ticket[] {
  return list.filter(t => {
    if (f.status && t.status !== f.status) return false
    if (f.type && t.type !== f.type) return false
    if (f.priority && t.priority !== f.priority) return false
    if (f.category && t.category !== f.category) return false
    if (f.responsibleUser && t.responsibleUser !== f.responsibleUser) return false
    if (f.responsibleRole && t.responsibleRole !== f.responsibleRole) return false
    if (f.asset && t.assetId !== f.asset) return false
    if (f.affectedUser && t.affectedUser !== f.affectedUser) return false
    if (f.from && t.createdAt < new Date(f.from).getTime()) return false
    if (f.to && t.createdAt > new Date(f.to).getTime() + 86400000) return false
    return true
  })
}
export function sortList(list: Ticket[], sort: { key: string; dir: number }): Ticket[] {
  const { key, dir } = sort
  const rank = (t: Ticket): number | string => {
    if (key === 'priority') return { low: 1, medium: 2, high: 3, critical: 4 }[t.priority]
    if (key === 'status') return ['new', 'in_progress', 'assigned', 'paused', 'resolved', 'closed'].indexOf(t.status)
    if (key === 'id') return t.number
    if (key === 'summary') return t.summary.toLowerCase()
    return (t as any)[key] || 0
  }
  return [...list].sort((a, b) => {
    const av = rank(a), bv = rank(b)
    if (av < bv) return -1 * dir
    if (av > bv) return 1 * dir
    return 0
  })
}

/* ---------- Toasts ---------- */
export interface Toast { id: number; msg: string; type?: 'ok' | 'err' }

/* ---------- Context-Typ ---------- */
export interface Actions {
  createTicket: (data: Partial<Ticket>, files?: FileList | File[]) => Promise<string>
  addComment: (uid: string, text: string) => void
  attach: (uid: string, files: FileList | File[]) => Promise<void>
  takeOver: (uid: string) => void
  assign: (uid: string, v: { responsibleUser: string | null; responsibleRole: string | null; note?: string }) => void
  changeStatus: (uid: string, v: { status: Status; note?: string }) => void
  pause: (uid: string, v: { days: number; note?: string }) => void
  transform: (uid: string, v: { type: TicketType; note?: string }) => void
  editTicket: (uid: string, patch: Partial<Ticket>) => void
  deleteTicket: (uid: string) => void
  withdraw: (uid: string, reason: string) => void
  reopen: (uid: string, reason: string) => void
  solveClose: (uid: string, solution: string) => void
  confirmResolved: (uid: string) => void
  rate: (uid: string, r: Rating) => void
  addKB: (title: string, category: string, body: string) => string
  addKBVersion: (id: string, body: string) => void
  addService: (s: { name: string; icon: string; desc: string; category: string; priority: Priority }) => void
  addAsset: (a: { name: string; type: string; location: string; category: string }) => void
  setSetting: <K extends keyof DB['settings']>(k: K, v: DB['settings'][K]) => void
  addToList: (key: 'users' | 'roles' | 'categories', val: string) => void
  removeFromList: (key: 'users' | 'roles' | 'categories', idx: number) => void
  runAutomationNow: () => void
  exportData: () => void
  importData: (file: File) => void
  resetAll: () => void
}
export interface StoreCtx {
  db: DB
  ui: UIState
  toasts: Toast[]
  setUi: (patch: Partial<UIState>) => void
  go: (view: UIState['view'], current?: string) => void
  openTicket: (uid: string) => void
  toast: (msg: string, type?: 'ok' | 'err') => void
  actions: Actions
}

const Ctx = createContext<StoreCtx | null>(null)
export function useStore(): StoreCtx {
  const c = useContext(Ctx)
  if (!c) throw new Error('useStore außerhalb des Providers')
  return c
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<DB>(loadDB)
  const [ui, setUiState] = useState<UIState>(loadUI)
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastId = useRef(0)

  // Automatik einmalig beim Start
  useEffect(() => {
    setDb(prev => {
      const next = structuredClone(prev)
      if (runAutomation(next)) { persistDB(next); return next }
      return prev
    })
    if (!ui.remember) setUiState(u => ({ ...u, filters: {} }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toast(msg: string, type?: 'ok' | 'err') {
    const id = ++toastId.current
    setToasts(ts => [...ts, { id, msg, type }])
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 3200)
  }
  function setUi(patch: Partial<UIState>) {
    setUiState(prev => { const next = { ...prev, ...patch }; persistUI(next); return next })
  }
  function go(view: UIState['view'], current?: string) {
    setUi({ view, ...(current ? { current } : {}) })
  }
  function openTicket(uid: string) { setUi({ view: 'detail', current: uid }) }

  // zentrale Mutation
  function update(mut: (d: DB, findT: (uid: string) => Ticket | undefined) => void) {
    setDb(prev => {
      const next = structuredClone(prev)
      const findT = (uid: string) => next.tickets.find(t => t.uid === uid)
      mut(next, findT)
      persistDB(next)
      return next
    })
  }

  const actions: Actions = {
    async createTicket(data, files) {
      let attachments: Attachment[] = []
      if (files) {
        const r = await readFiles(files)
        attachments = r.attachments
        if (r.skipped.length) toast('Zu groß (>3 MB), übersprungen: ' + r.skipped.join(', '), 'err')
      }
      const now = Date.now()
      // uid/number VOR dem setState-Updater ableiten, damit der Rückgabewert zuverlässig ist
      const number = db.counter + 1
      const uid = 't' + number + '_' + now.toString(36)
      const affected = (data.affectedUser as string) || ui.user
      const t: Ticket = {
        uid, number,
        type: (data.type as TicketType) || 'ticket',
        status: 'new',
        summary: data.summary || '', description: data.description || '',
        category: data.category || db.categories[0],
        priority: (data.priority as Priority) || 'medium',
        responsibleUser: (data.responsibleUser as string | null) ?? null,
        responsibleRole: (data.responsibleRole as string | null) ?? null,
        affectedUser: affected, assetId: (data.assetId as string | null) ?? null,
        createdAt: now, updatedAt: now, attachments,
        journal: [{ ts: now, author: affected, kind: 'system', text: 'Ticket erstellt' }],
        solution: null, resolvedAt: null, closedAt: null, rating: null,
        pausedUntil: null, withdrawReason: null, reopenReason: null,
      }
      if (t.responsibleUser) { t.status = 'assigned'; logChange(t, ui.user, 'new', 'assigned', 'Direkt zugewiesen.') }
      update(next => {
        next.counter = number
        const nt = structuredClone(t)
        next.tickets.push(nt)
        notifyEmail(next, nt, 'Neues Ticket angelegt')
      })
      return uid
    },
    addComment(uid, text) {
      update((next, findT) => { const t = findT(uid); if (!t) return
        logComment(t, ui.user, text); t.updatedAt = Date.now(); notifyEmail(next, t, 'Neuer Kommentar') })
    },
    async attach(uid, files) {
      const { attachments: add, skipped } = await readFiles(files)
      if (skipped.length) toast('Zu groß (>3 MB), übersprungen: ' + skipped.join(', '), 'err')
      if (add.length === 0) return
      update((_next, findT) => { const t = findT(uid); if (!t) return
        t.attachments.push(...add); t.updatedAt = Date.now()
        logComment(t, ui.user, add.length + ' Anhang/Anhänge hinzugefügt: ' + add.map(a => a.name).join(', ')) })
      toast(add.length + ' Anhang/Anhänge hinzugefügt.', 'ok')
    },
    takeOver(uid) {
      update((next, findT) => { const t = findT(uid); if (!t) return
        t.responsibleUser = ui.user
        const from = t.status
        if (t.status === 'new' || t.status === 'assigned') { logChange(t, ui.user, from, 'in_progress', ui.user + ' hat das Ticket übernommen.'); t.status = 'in_progress' }
        else logSystem(t, ui.user, ui.user + ' hat das Ticket übernommen.')
        t.updatedAt = Date.now(); notifyEmail(next, t, 'Ticket übernommen') })
    },
    assign(uid, v) {
      update((next, findT) => { const t = findT(uid); if (!t) return
        t.responsibleUser = v.responsibleUser; t.responsibleRole = v.responsibleRole
        if (t.responsibleUser && t.status === 'new') { logChange(t, ui.user, 'new', 'assigned', v.note || 'Zugewiesen an ' + t.responsibleUser); t.status = 'assigned' }
        else logComment(t, ui.user, 'Zuweisung geändert: ' + (t.responsibleUser || '—') + (t.responsibleRole ? ' / ' + t.responsibleRole : '') + (v.note ? '\n' + v.note : ''))
        t.updatedAt = Date.now(); notifyEmail(next, t, 'Ticket zugewiesen') })
    },
    changeStatus(uid, v) {
      update((next, findT) => { const t = findT(uid); if (!t) return
        if (v.status === t.status) { if (v.note) logComment(t, ui.user, v.note) }
        else { logChange(t, ui.user, t.status, v.status, v.note); t.status = v.status
          if (v.status === 'resolved') t.resolvedAt = Date.now()
          if (v.status !== 'paused') t.pausedUntil = null
          notifyEmail(next, t, 'Status geändert zu ' + STATUS[v.status].label) }
        t.updatedAt = Date.now() })
    },
    pause(uid, v) {
      update((next, findT) => { const t = findT(uid); if (!t) return
        const days = v.days || next.settings.pauseReactivationDays
        t.pausedUntil = Date.now() + days * 86400000
        logChange(t, ui.user, t.status, 'paused', (v.note ? v.note + '\n' : '') + 'Reaktivierung geplant.')
        t.status = 'paused'; t.updatedAt = Date.now() })
    },
    transform(uid, v) {
      update((next, findT) => { const t = findT(uid); if (!t) return
        const from = t.type; t.type = v.type
        t.journal.push({ ts: Date.now(), author: ui.user, kind: 'status', text: 'Transformiert: ' + TYPES[from].label + ' → ' + TYPES[v.type].label + (v.note ? '\n' + v.note : '') })
        t.updatedAt = Date.now(); notifyEmail(next, t, 'Ticket transformiert') })
    },
    editTicket(uid, patch) {
      update((_next, findT) => { const t = findT(uid); if (!t) return
        Object.assign(t, patch); t.updatedAt = Date.now(); logComment(t, ui.user, 'Ticket-Details bearbeitet.') })
    },
    deleteTicket(uid) {
      update(next => {
        const i = next.tickets.findIndex(t => t.uid === uid)
        if (i === -1) return
        next.tickets.splice(i, 1)
      })
    },
    withdraw(uid, reason) {
      update((next, findT) => { const t = findT(uid); if (!t) return
        t.withdrawReason = reason; logChange(t, ui.user, t.status, 'closed', 'Zurückgezogen: ' + reason)
        t.status = 'closed'; t.closedAt = Date.now(); t.updatedAt = Date.now(); notifyEmail(next, t, 'Ticket zurückgezogen') })
    },
    reopen(uid, reason) {
      update((next, findT) => { const t = findT(uid); if (!t) return
        t.reopenReason = reason; logChange(t, ui.user, t.status, 'new', 'Wiedereröffnet: ' + reason)
        t.status = 'new'; t.closedAt = null; t.resolvedAt = null; t.updatedAt = Date.now(); notifyEmail(next, t, 'Ticket wiedereröffnet') })
    },
    solveClose(uid, solution) {
      update((next, findT) => { const t = findT(uid); if (!t) return
        t.solution = solution; logChange(t, ui.user, t.status, 'resolved', 'Lösung dokumentiert:\n' + solution)
        t.status = 'resolved'; t.resolvedAt = Date.now(); t.updatedAt = Date.now(); notifyEmail(next, t, 'Ticket gelöst – bitte Rückmeldung geben') })
    },
    confirmResolved(uid) {
      update((next, findT) => { const t = findT(uid); if (!t) return
        logChange(t, ui.user, 'resolved', 'closed', 'Lösung vom Nutzer bestätigt.')
        t.status = 'closed'; t.closedAt = Date.now(); t.updatedAt = Date.now(); notifyEmail(next, t, 'Ticket geschlossen') })
    },
    rate(uid, r) {
      update((_next, findT) => { const t = findT(uid); if (!t) return
        t.rating = r; logComment(t, ui.user, 'Bewertung abgegeben: ' + r.stars + '/5' + (r.comment ? ' – ' + r.comment : ''))
        t.updatedAt = Date.now() })
    },
    addKB(title, category, body) {
      const id = 'K' + Date.now().toString(36)
      update(next => { next.kb.push({ id, title, category, versions: [{ v: 1, date: Date.now(), author: ui.user, body }] }) })
      return id
    },
    addKBVersion(id, body) {
      update(next => { const a = next.kb.find(x => x.id === id); if (!a) return
        const last = a.versions[a.versions.length - 1]
        a.versions.push({ v: last.v + 1, date: Date.now(), author: ui.user, body }) })
    },
    addService(s) { update(next => { next.services.push({ id: 'S' + Date.now().toString(36), ...s }) }) },
    addAsset(a) { update(next => { next.assets.push({ id: 'A' + Date.now().toString(36), ...a }) }) },
    setSetting(k, v) { update(next => { (next.settings as any)[k] = v }) },
    addToList(key, val) { update(next => { if (!next[key].includes(val)) next[key].push(val) }) },
    removeFromList(key, idx) { update(next => { next[key].splice(idx, 1) }) },
    runAutomationNow() { update(next => { runAutomation(next) }) },
    exportData() {
      const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' })
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'heimdesk-export.json'; a.click()
    },
    importData(file) {
      const r = new FileReader()
      r.onload = () => { try { const d = JSON.parse(r.result as string); if (!d.tickets) throw new Error('invalid')
        persistDB(d); setDb(d); toast('Import erfolgreich.', 'ok'); go('list') } catch { toast('Ungültige Datei.', 'err') } }
      r.readAsText(file)
    },
    resetAll() {
      if (!confirm('Wirklich ALLE Daten löschen und Beispieldaten wiederherstellen?')) return
      const fresh = seed(Date.now()); persistDB(fresh); setDb(fresh); toast('Zurückgesetzt.', 'ok'); go('list')
    },
  }

  const value: StoreCtx = { db, ui, toasts, setUi, go, openTicket, toast, actions }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
