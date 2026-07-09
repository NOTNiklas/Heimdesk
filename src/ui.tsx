/* ============================================================
   HeimDesk — Gemeinsame UI-Bausteine
   ============================================================ */
import React, { useEffect, useRef, useState } from 'react'
import { STATUS, TYPES, PRIORITY, type Status, type TicketType, type Priority } from './domain'

const FOCUSABLE = 'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'

export function StatusBadge({ s }: { s: Status }) {
  const m = STATUS[s]
  return (
    <span className="badge" style={{ background: m.bg, color: m.color, borderColor: m.border }}>
      <span className="dot" style={{ background: m.color }} />{m.label}
    </span>
  )
}
export function TypeBadge({ t }: { t: TicketType }) {
  const m = TYPES[t]
  return <span className="type-badge">{m.icon} {m.label}</span>
}
export function PriorityBadge({ p }: { p: Priority }) {
  const m = PRIORITY[p]
  return <span className="prio"><span className="pd" style={{ background: m.color }} />{m.label}</span>
}
export function StarsDisplay({ n }: { n: number }) {
  return <span className="stars">{[1, 2, 3, 4, 5].map(i => <span key={i}>{i <= n ? '★' : '☆'}</span>)}</span>
}
export function StarsInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <span className="stars input" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= (hover || value) ? 'on' : ''}
          onMouseEnter={() => setHover(i)} onClick={() => onChange(i)}>★</span>
      ))}
    </span>
  )
}

/* ---------- Modal-Shell ---------- */
export function Modal({ title, children, footer, onClose }:
  { title: string; children: React.ReactNode; footer: React.ReactNode; onClose: () => void }) {
  const modalRef = useRef<HTMLDivElement>(null)
  const restoreRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    // Auslösendes Element merken, um den Fokus beim Schließen zurückzugeben
    restoreRef.current = document.activeElement as HTMLElement | null
    const node = modalRef.current
    const focusables = (): HTMLElement[] =>
      node ? Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(el => el.getClientRects().length > 0) : []

    // Initialfokus: erstes Feld im Dialog-Body (.mb), sonst erstes fokussierbares, sonst der Dialog
    const body = node?.querySelector('.mb')
    const bodyFirst = body
      ? Array.from(body.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(el => el.getClientRects().length > 0)[0]
      : undefined
    const first = bodyFirst ?? focusables()[0]
    if (first) first.focus(); else node?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      const els = focusables()
      if (els.length === 0) { e.preventDefault(); node?.focus(); return }
      const firstEl = els[0], lastEl = els[els.length - 1]
      const active = document.activeElement as HTMLElement | null
      const inside = !!(node && active && node.contains(active))
      if (e.shiftKey) {
        if (!inside || active === firstEl) { e.preventDefault(); lastEl.focus() }
      } else {
        if (!inside || active === lastEl) { e.preventDefault(); firstEl.focus() }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      const r = restoreRef.current
      if (r && typeof r.focus === 'function' && document.contains(r)) r.focus()
    }
  }, [onClose])

  return (
    <div className="overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" ref={modalRef} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1}>
        <div className="mh"><h3>{title}</h3><button className="x" aria-label="Schließen" onClick={onClose}>×</button></div>
        <div className="mb">{children}</div>
        <div className="mf">{footer}</div>
      </div>
    </div>
  )
}

/* ---------- Feld-Controls ---------- */
export function Field({ label, required, hint, children }:
  { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <label>{label}{required && <span className="req"> *</span>}{hint && <span className="hint"> {hint}</span>}</label>
      {children}
    </div>
  )
}
export function Select({ value, onChange, options, allowEmpty, emptyLabel }:
  { value: string; onChange: (v: string) => void; options: { v: string; l: string }[]; allowEmpty?: boolean; emptyLabel?: string }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}>
      {allowEmpty && <option value="">{emptyLabel ?? 'Alle'}</option>}
      {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  )
}

export function EscalatedTag() { return <span className="esc" title="Eskaliert">⏱ Eskaliert</span> }
