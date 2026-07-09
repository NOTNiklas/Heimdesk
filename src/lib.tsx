/* ============================================================
   HeimDesk — Hilfsfunktionen (Format, SLA, Suche, Dateien)
   ============================================================ */
import React from 'react'
import { PRIORITY, STATUS, TYPES, type Ticket, type Attachment, type DB } from './domain'

export function displayId(t: Ticket): string {
  return TYPES[t.type].prefix + '-' + String(t.number).padStart(4, '0')
}
export function fmtDate(ts: number | null): string {
  if (!ts) return '—'
  const d = new Date(ts)
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' }) +
    ' ' + d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}
export function fmtDateShort(ts: number | null): string {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' })
}
export function relTime(ts: number): string {
  const s = (Date.now() - ts) / 1000
  if (s < 60) return 'gerade eben'
  if (s < 3600) return Math.floor(s / 60) + ' Min.'
  if (s < 86400) return Math.floor(s / 3600) + ' Std.'
  const dd = Math.floor(s / 86400)
  return 'vor ' + dd + ' Tag' + (dd > 1 ? 'en' : '')
}
export function initials(name: string): string {
  return (name || '?').split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

/* Mini-Formatierung: **fett**, *kursiv*, Links, Zeilenumbrüche → React-Nodes */
export function fmtText(s: string | null): React.ReactNode {
  if (!s) return null
  const lines = s.split('\n')
  return lines.map((line, li) => (
    <React.Fragment key={li}>
      {parseInline(line)}
      {li < lines.length - 1 ? <br /> : null}
    </React.Fragment>
  ))
}
function parseInline(line: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = []
  const re = /(\*\*([^*]+)\*\*)|(\*([^*\n]+)\*)|(https?:\/\/[^\s]+)/g
  let last = 0, m: RegExpExecArray | null, key = 0
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) tokens.push(line.slice(last, m.index))
    if (m[2] !== undefined) tokens.push(<strong key={key++}>{m[2]}</strong>)
    else if (m[4] !== undefined) tokens.push(<em key={key++}>{m[4]}</em>)
    else if (m[5] !== undefined) tokens.push(<a key={key++} href={m[5]} target="_blank" rel="noopener noreferrer">{m[5]}</a>)
    last = m.index + m[0].length
  }
  if (last < line.length) tokens.push(line.slice(last))
  return tokens
}

/* ---------- SLA ---------- */
export interface SlaResult { cls: string; txt: string }
export function slaState(t: Ticket, kind: 'reaction' | 'resolution'): SlaResult {
  const limit = PRIORITY[t.priority][kind] * 3600000
  if (kind === 'reaction') {
    const reacted = t.journal.find(j => j.kind === 'status' && j.from === 'new')
    if (reacted) {
      const dt = reacted.ts - t.createdAt
      return dt <= limit ? { cls: 'sla-ok', txt: '· eingehalten' } : { cls: 'sla-bad', txt: '· überschritten' }
    }
    if (!STATUS[t.status].open) return { cls: '', txt: '' }
    const dt = Date.now() - t.createdAt
    return dt <= limit
      ? { cls: 'sla-ok', txt: '· ' + Math.max(0, Math.round((limit - dt) / 3600000)) + ' h übrig' }
      : { cls: 'sla-bad', txt: '· überfällig' }
  } else {
    if (t.resolvedAt || !STATUS[t.status].open) {
      const end = t.resolvedAt || t.closedAt || t.updatedAt
      const dt = end - t.createdAt
      return dt <= limit ? { cls: 'sla-ok', txt: '· eingehalten' } : { cls: 'sla-bad', txt: '· überschritten' }
    }
    const dt = Date.now() - t.createdAt
    if (dt > limit) return { cls: 'sla-bad', txt: '· überfällig' }
    const left = (limit - dt) / 3600000
    return { cls: left < (limit * 0.25 / 3600000) ? 'sla-warn' : 'sla-ok', txt: '· ' + Math.round(left) + ' h übrig' }
  }
}

/* ---------- Eskalation ---------- */
export function isEscalated(t: Ticket, escalationDays: number): boolean {
  if (!STATUS[t.status].open) return false
  return (Date.now() - t.updatedAt) / 86400000 >= escalationDays
}

/* ---------- Dateien ---------- */
export interface ReadResult { attachments: Attachment[]; skipped: string[] }
export const MAX_ATTACH_BYTES = 3 * 1024 * 1024
export function readFiles(files: FileList | File[]): Promise<ReadResult> {
  const arr = Array.from(files)
  const skipped: string[] = []
  return Promise.all(arr.map(f => new Promise<Attachment | null>(res => {
    if (f.size > MAX_ATTACH_BYTES) { skipped.push(f.name); res(null); return }
    const r = new FileReader()
    r.onload = () => res({ name: f.name, size: f.size, type: f.type, dataUrl: r.result as string })
    r.readAsDataURL(f)
  }))).then(a => ({ attachments: a.filter((x): x is Attachment => x !== null), skipped }))
}

/* ---------- Suche ---------- */
export function ticketMatches(t: Ticket, q: string): boolean {
  const ql = q.toLowerCase()
  const hit = (txt?: string | null) => (txt || '').toLowerCase().includes(ql)
  return hit(t.summary) || hit(t.description) || hit(t.solution) || hit(displayId(t)) ||
    hit(t.category) || t.journal.some(j => hit(j.text))
}
export function assetName(db: DB, id: string | null): string | null {
  if (!id) return null
  const a = db.assets.find(x => x.id === id)
  return a ? a.name : null
}
