/* ============================================================
   HeimDesk — Aktions-Dialoge (Modals)
   ============================================================ */
import React, { createContext, useContext, useState } from 'react'
import { Modal, Field, Select, StarsInput } from './ui'
import { useStore } from './store'
import { STATUS, STATUS_ORDER, TYPES, TRANSFORM, type Ticket, type Status, type TicketType } from './domain'
import { fmtDateShort, displayId } from './lib'

export type ModalKind = 'assign' | 'status' | 'pause' | 'transform' | 'withdraw' | 'reopen' | 'close' | 'rate' | 'delete'

export const ModalContext = createContext<{ open: (k: ModalKind, uid: string) => void }>({ open: () => {} })
export function useModals() { return useContext(ModalContext) }

function Footer({ onClose, onSubmit, label, danger }:
  { onClose: () => void; onSubmit: () => void; label: string; danger?: boolean }) {
  return (
    <>
      <button className="btn" onClick={onClose}>Abbrechen</button>
      <button className={'btn ' + (danger ? 'danger' : 'primary')} onClick={onSubmit}>{label}</button>
    </>
  )
}

export function ModalHost({ kind, uid, onClose }: { kind: ModalKind; uid: string; onClose: () => void }) {
  const { db } = useStore()
  const t = db.tickets.find(x => x.uid === uid)
  if (!t) return null
  switch (kind) {
    case 'assign': return <AssignModal t={t} onClose={onClose} />
    case 'status': return <StatusModal t={t} onClose={onClose} />
    case 'pause': return <PauseModal t={t} onClose={onClose} />
    case 'transform': return <TransformModal t={t} onClose={onClose} />
    case 'withdraw': return <WithdrawModal t={t} onClose={onClose} />
    case 'reopen': return <ReopenModal t={t} onClose={onClose} />
    case 'close': return <CloseModal t={t} onClose={onClose} />
    case 'rate': return <RateModal t={t} onClose={onClose} />
    case 'delete': return <DeleteModal t={t} onClose={onClose} />
  }
}

function AssignModal({ t, onClose }: { t: Ticket; onClose: () => void }) {
  const { db, actions, toast } = useStore()
  const [ru, setRu] = useState(t.responsibleUser || '')
  const [rr, setRr] = useState(t.responsibleRole || '')
  const [note, setNote] = useState('')
  const submit = () => { actions.assign(t.uid, { responsibleUser: ru || null, responsibleRole: rr || null, note }); toast('Zugewiesen.', 'ok'); onClose() }
  return (
    <Modal title="Ticket zuweisen" onClose={onClose} footer={<Footer onClose={onClose} onSubmit={submit} label="Zuweisen" />}>
      <Field label="Verantwortlicher Nutzer">
        <Select value={ru} onChange={setRu} allowEmpty emptyLabel="— keiner —" options={db.users.map(u => ({ v: u, l: u }))} />
      </Field>
      <Field label="Verantwortliche Rolle">
        <Select value={rr} onChange={setRr} allowEmpty emptyLabel="—" options={db.roles.map(r => ({ v: r, l: r }))} />
      </Field>
      <Field label="Notiz (optional)"><textarea value={note} onChange={e => setNote(e.target.value)} /></Field>
    </Modal>
  )
}

function StatusModal({ t, onClose }: { t: Ticket; onClose: () => void }) {
  const { actions, toast } = useStore()
  const [status, setStatus] = useState<Status>(t.status)
  const [note, setNote] = useState('')
  // 'resolved' & 'closed' bewusst ausgeschlossen: Gelöst nur über „Abschließen" (Pflicht-Lösung),
  // Geschlossen nur über Bestätigen/Zurückziehen.
  const options = STATUS_ORDER.filter(s => s !== 'closed' && s !== 'resolved').map(s => ({ v: s, l: STATUS[s].label }))
  const submit = () => { actions.changeStatus(t.uid, { status, note }); toast('Status aktualisiert.', 'ok'); onClose() }
  return (
    <Modal title="Status ändern" onClose={onClose} footer={<Footer onClose={onClose} onSubmit={submit} label="Übernehmen" />}>
      <Field label="Neuer Status"><Select value={status} onChange={v => setStatus(v as Status)} options={options} /></Field>
      <Field label="Kommentar (optional)"><textarea value={note} onChange={e => setNote(e.target.value)} /></Field>
    </Modal>
  )
}

function PauseModal({ t, onClose }: { t: Ticket; onClose: () => void }) {
  const { db, actions, toast } = useStore()
  const [days, setDays] = useState(String(db.settings.pauseReactivationDays))
  const [note, setNote] = useState('')
  const submit = () => {
    const d = parseInt(days) || db.settings.pauseReactivationDays
    actions.pause(t.uid, { days: d, note })
    toast('Pausiert bis ' + fmtDateShort(Date.now() + d * 86400000) + '.', 'ok'); onClose()
  }
  return (
    <Modal title="Ticket pausieren" onClose={onClose} footer={<Footer onClose={onClose} onSubmit={submit} label="Pausieren" />}>
      <Field label="Automatische Reaktivierung nach (Tagen)" required><input type="number" min={0} value={days} onChange={e => setDays(e.target.value)} /></Field>
      <Field label="Grund (optional)"><textarea value={note} onChange={e => setNote(e.target.value)} /></Field>
    </Modal>
  )
}

function TransformModal({ t, onClose }: { t: Ticket; onClose: () => void }) {
  const { actions, toast } = useStore()
  const targets = TRANSFORM[t.type]
  const [type, setType] = useState<TicketType>(targets[0])
  const [note, setNote] = useState('')
  const submit = () => { actions.transform(t.uid, { type, note }); toast('Umgewandelt in ' + TYPES[type].label + '.', 'ok'); onClose() }
  return (
    <Modal title="Ticket transformieren" onClose={onClose} footer={<Footer onClose={onClose} onSubmit={submit} label="Transformieren" />}>
      <Field label="Umwandeln in" required>
        <Select value={type} onChange={v => setType(v as TicketType)} options={targets.map(k => ({ v: k, l: TYPES[k].icon + ' ' + TYPES[k].label }))} />
      </Field>
      <Field label="Begründung (optional)"><textarea value={note} onChange={e => setNote(e.target.value)} /></Field>
    </Modal>
  )
}

function WithdrawModal({ t, onClose }: { t: Ticket; onClose: () => void }) {
  const { actions, toast } = useStore()
  const [reason, setReason] = useState('')
  const submit = () => { if (!reason.trim()) { toast('Bitte eine Begründung angeben.', 'err'); return } actions.withdraw(t.uid, reason); toast('Zurückgezogen & geschlossen.', 'ok'); onClose() }
  return (
    <Modal title="Ticket zurückziehen" onClose={onClose} footer={<Footer onClose={onClose} onSubmit={submit} label="Zurückziehen" danger />}>
      <Field label="Begründung" required><textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Warum wird das Ticket zurückgezogen?" /></Field>
    </Modal>
  )
}

function ReopenModal({ t, onClose }: { t: Ticket; onClose: () => void }) {
  const { db, actions, toast } = useStore()
  const [reason, setReason] = useState('')
  const locked = db.settings.reopenLocked && t.status === 'closed'
  const submit = () => {
    if (locked) { toast('Wiedereröffnung ist gesperrt (Einstellungen).', 'err'); return }
    if (!reason.trim()) { toast('Bitte eine Begründung angeben.', 'err'); return }
    actions.reopen(t.uid, reason); toast('Wiedereröffnet.', 'ok'); onClose()
  }
  return (
    <Modal title="Ticket wiedereröffnen" onClose={onClose} footer={<Footer onClose={onClose} onSubmit={submit} label="Wiedereröffnen" />}>
      {locked && <div className="hint" style={{ color: 'var(--danger)' }}>Wiedereröffnung ist in den Einstellungen gesperrt.</div>}
      <Field label="Begründung" required><textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Warum muss das Ticket wieder geöffnet werden?" /></Field>
    </Modal>
  )
}

function CloseModal({ t, onClose }: { t: Ticket; onClose: () => void }) {
  const { actions, toast } = useStore()
  const [solution, setSolution] = useState(t.solution || '')
  const submit = () => { if (!solution.trim()) { toast('Die Lösung ist ein Pflichtfeld.', 'err'); return } actions.solveClose(t.uid, solution); toast('Als gelöst markiert – wartet auf Bestätigung.', 'ok'); onClose() }
  return (
    <Modal title="Ticket abschließen" onClose={onClose} footer={<Footer onClose={onClose} onSubmit={submit} label="Als gelöst markieren" />}>
      <Field label="Lösung" required><textarea value={solution} onChange={e => setSolution(e.target.value)} placeholder="Wie wurde das Anliegen gelöst? (Pflichtfeld)" style={{ minHeight: 120 }} /></Field>
    </Modal>
  )
}

function RateModal({ t, onClose }: { t: Ticket; onClose: () => void }) {
  const { actions, toast } = useStore()
  const [stars, setStars] = useState(5)
  const [comment, setComment] = useState('')
  const submit = () => { actions.rate(t.uid, { stars, comment }); toast('Danke für deine Bewertung!', 'ok'); onClose() }
  return (
    <Modal title={'Ticket bewerten — ' + displayId(t)} onClose={onClose} footer={<Footer onClose={onClose} onSubmit={submit} label="Bewertung senden" />}>
      <Field label="Wie zufrieden bist du?" required><StarsInput value={stars} onChange={setStars} /></Field>
      <Field label="Kommentar (optional)"><textarea value={comment} onChange={e => setComment(e.target.value)} /></Field>
    </Modal>
  )
}

function DeleteModal({ t, onClose }: { t: Ticket; onClose: () => void }) {
  const { actions, toast, go } = useStore()
  const submit = () => {
    actions.deleteTicket(t.uid)
    toast('Ticket ' + displayId(t) + ' gelöscht.', 'ok')
    onClose()
    go('list')
  }
  return (
    <Modal title="Ticket löschen" onClose={onClose} footer={<Footer onClose={onClose} onSubmit={submit} label="Endgültig löschen" danger />}>
      <p style={{ margin: 0 }}>
        Ticket <b>{displayId(t)}</b> – „{t.summary}" wird <b>unwiderruflich</b> gelöscht,
        inklusive Verlauf, Kommentaren und Anhängen.
      </p>
      <div className="hint" style={{ color: 'var(--danger)' }}>
        Diese Aktion kann nicht rückgängig gemacht werden. Zum bloßen Beenden eines Vorgangs
        besser „Zurückziehen" oder „Abschließen" verwenden.
      </div>
    </Modal>
  )
}

/* Kleine, eigenständige Anlege-Dialoge für KB / Service / Asset */
export function SimpleFormModal({ title, fields, submitLabel, onSubmit, onClose }: {
  title: string
  fields: { name: string; label: string; type?: 'text' | 'textarea' | 'select'; options?: { v: string; l: string }[]; value?: string; required?: boolean }[]
  submitLabel: string
  onSubmit: (vals: Record<string, string>) => void
  onClose: () => void
}) {
  const { toast } = useStore()
  const [vals, setVals] = useState<Record<string, string>>(() => {
    const o: Record<string, string> = {}
    fields.forEach(f => { o[f.name] = f.value ?? (f.type === 'select' && f.options ? f.options[0].v : '') })
    return o
  })
  const set = (n: string, v: string) => setVals(s => ({ ...s, [n]: v }))
  const submit = () => {
    for (const f of fields) if (f.required && !vals[f.name].trim()) { toast('Bitte „' + f.label + '" ausfüllen.', 'err'); return }
    onSubmit(vals); onClose()
  }
  return (
    <Modal title={title} onClose={onClose} footer={<Footer onClose={onClose} onSubmit={submit} label={submitLabel} />}>
      {fields.map(f => (
        <Field key={f.name} label={f.label} required={f.required}>
          {f.type === 'textarea'
            ? <textarea value={vals[f.name]} onChange={e => set(f.name, e.target.value)} />
            : f.type === 'select'
              ? <Select value={vals[f.name]} onChange={v => set(f.name, v)} options={f.options!} />
              : <input type="text" value={vals[f.name]} onChange={e => set(f.name, e.target.value)} />}
        </Field>
      ))}
    </Modal>
  )
}
