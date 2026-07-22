/* ============================================================
   HeimDesk — Ansichten (Views)
   ============================================================ */
import React, { useMemo, useState } from 'react'
import { useStore, selectVisible, applyQuick, applyFilters, sortList, isAgent, isOwner } from './store'
import { useModals, SimpleFormModal } from './modals'
import { StatusBadge, TypeBadge, PriorityBadge, StarsDisplay, Field, Select } from './ui'
import {
  STATUS, STATUS_ORDER, TYPES, TYPE_ORDER, PRIORITY, PRIORITY_ORDER, TRANSFORM,
  type Ticket, type TicketType, type Priority, type QuickFilter, type Filters, type Asset, type ServiceItem,
} from './domain'
import {
  displayId, fmtDate, fmtDateShort, relTime, fmtText, slaState, isEscalated, assetName, ticketMatches,
} from './lib'
import { generateSyncCode, loadSyncConfig, SUPABASE_SQL } from './sync'

/* ============================================================ LISTE */
export function TicketListView() {
  const { db, ui, setUi, openTicket, go } = useStore()
  const escDays = db.settings.escalationDays
  const all = useMemo(() => selectVisible(db, ui), [db, ui])
  const list = useMemo(
    () => sortList(applyFilters(applyQuick(all, ui, escDays), ui.filters), ui.sort),
    [all, ui, escDays],
  )
  const openCount = all.filter(t => STATUS[t.status].open).length
  const escCount = all.filter(t => isEscalated(t, escDays)).length
  const resolvedCount = all.filter(t => t.status === 'resolved').length

  const setFilter = (k: keyof Filters, v: string) => {
    const f = { ...ui.filters }
    if (v === '') delete f[k]; else (f as any)[k] = v
    setUi({ filters: f })
  }
  const setQuick = (q: QuickFilter) => setUi({ quick: ui.quick === q ? null : q })
  const setSort = (key: string) =>
    setUi({ sort: ui.sort.key === key ? { key, dir: ui.sort.dir * -1 } : { key, dir: key === 'createdAt' ? -1 : 1 } })
  const arrow = (key: string) => ui.sort.key === key ? (ui.sort.dir === 1 ? '▲' : '▼') : ''

  const Th = ({ k, label }: { k: string; label: string }) => {
    const sorted = ui.sort.key === k
    return (
      <th aria-sort={sorted ? (ui.sort.dir === 1 ? 'ascending' : 'descending') : 'none'}>
        <button type="button" onClick={() => setSort(k)}
          style={{ all: 'unset', cursor: 'pointer', display: 'inline-flex', gap: 4, alignItems: 'center' }}>
          {label} <span className="arr">{arrow(k)}</span>
        </button>
      </th>
    )
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h2>{isAgent(ui) ? 'Service-Desk' : 'Meine Anliegen'}</h2>
          <p>{isAgent(ui) ? 'Alle Vorgänge im Überblick' : 'Deine gemeldeten und dir zugewiesenen Vorgänge'} · {list.length} von {all.length} angezeigt</p>
        </div>
        <button className="btn primary" onClick={() => go('create')}>➕ Neues Ticket</button>
      </div>

      <div className="stats">
        <StatCard n={openCount} l="Offene Vorgänge" c="var(--brand)" />
        <StatCard n={resolvedCount} l="Gelöst · wartet auf Feedback" c="#8b5cf6" />
        <StatCard n={escCount} l={`Eskaliert (>${escDays} Tage inaktiv)`} c={escCount ? 'var(--danger)' : 'var(--border)'} danger={!!escCount} />
        <StatCard n={all.length} l="Sichtbare Vorgänge gesamt" c="var(--ok)" />
      </div>

      <div className="filters">
        <div className="quickfilters">
          <button className={'chip ' + (!ui.quick ? 'on' : '')} onClick={() => setUi({ quick: null })}>Alle</button>
          <Chip on={ui.quick === 'open'} onClick={() => setQuick('open')}>Nur offene</Chip>
          <Chip on={ui.quick === 'mine'} onClick={() => setQuick('mine')}>Mir zugewiesen</Chip>
          <Chip on={ui.quick === 'week'} onClick={() => setQuick('week')}>Diese Woche erstellt</Chip>
          <Chip on={ui.quick === 'escalated'} onClick={() => setQuick('escalated')}>⏱ Eskaliert</Chip>
          <Chip on={ui.quick === 'unrated'} onClick={() => setQuick('unrated')}>Unbewertet</Chip>
        </div>
        <div className="filter-grid">
          <Field label="Status"><Select value={ui.filters.status ?? ''} onChange={v => setFilter('status', v)} allowEmpty options={STATUS_ORDER.map(s => ({ v: s, l: STATUS[s].label }))} /></Field>
          <Field label="Typ"><Select value={ui.filters.type ?? ''} onChange={v => setFilter('type', v)} allowEmpty options={TYPE_ORDER.map(t => ({ v: t, l: TYPES[t].label }))} /></Field>
          <Field label="Priorität"><Select value={ui.filters.priority ?? ''} onChange={v => setFilter('priority', v)} allowEmpty options={PRIORITY_ORDER.map(p => ({ v: p, l: PRIORITY[p].label }))} /></Field>
          <Field label="Kategorie"><Select value={ui.filters.category ?? ''} onChange={v => setFilter('category', v)} allowEmpty options={db.categories.map(c => ({ v: c, l: c }))} /></Field>
          <Field label="Verantw. Nutzer"><Select value={ui.filters.responsibleUser ?? ''} onChange={v => setFilter('responsibleUser', v)} allowEmpty options={db.users.map(u => ({ v: u, l: u }))} /></Field>
          <Field label="Verantw. Rolle"><Select value={ui.filters.responsibleRole ?? ''} onChange={v => setFilter('responsibleRole', v)} allowEmpty options={db.roles.map(r => ({ v: r, l: r }))} /></Field>
          <Field label="Betroffener"><Select value={ui.filters.affectedUser ?? ''} onChange={v => setFilter('affectedUser', v)} allowEmpty options={db.users.map(u => ({ v: u, l: u }))} /></Field>
          <Field label="Asset"><Select value={ui.filters.asset ?? ''} onChange={v => setFilter('asset', v)} allowEmpty options={db.assets.map(a => ({ v: a.id, l: a.name }))} /></Field>
          <Field label="Erstellt ab"><input type="date" value={ui.filters.from ?? ''} onChange={e => setFilter('from', e.target.value)} /></Field>
          <Field label="Erstellt bis"><input type="date" value={ui.filters.to ?? ''} onChange={e => setFilter('to', e.target.value)} /></Field>
        </div>
        <div className="filter-actions">
          <label className="hint" style={{ display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer' }}>
            <input type="checkbox" checked={ui.remember} onChange={e => setUi({ remember: e.target.checked })} /> Filter für nächste Sitzung merken
          </label>
          <button className="btn sm" onClick={() => setUi({ filters: {}, quick: null })}>Filter zurücksetzen</button>
        </div>
      </div>

      <div className="tablewrap">
        <table className="list">
          <thead><tr>
            <Th k="id" label="ID" /><th>Typ</th><Th k="summary" label="Zusammenfassung" /><Th k="status" label="Status" />
            <Th k="priority" label="Priorität" /><th>Kategorie</th><th>Verantwortlich</th><th>Betroffen</th><th>Asset</th><Th k="createdAt" label="Erstellt" />
          </tr></thead>
          <tbody>
            {list.length === 0
              ? <tr><td colSpan={10}><div className="empty"><div className="big">🗂️</div>Keine Vorgänge für die aktuelle Auswahl.</div></td></tr>
              : list.map(t => (
                <tr key={t.uid} tabIndex={0} aria-label={'Vorgang ' + displayId(t) + ' öffnen'}
                  onClick={() => openTicket(t.uid)}
                  onKeyDown={e => { if (e.key === 'Enter') openTicket(t.uid) }}>
                  <td className="idcell" style={{ borderLeftColor: STATUS[t.status].border }}>
                    {displayId(t)}{isEscalated(t, escDays) && <span className="esc" title="Eskaliert">⏱</span>}
                  </td>
                  <td><TypeBadge t={t.type} /></td>
                  <td className="sumcell">{t.summary}<small>{t.description}</small></td>
                  <td><StatusBadge s={t.status} /></td>
                  <td><PriorityBadge p={t.priority} /></td>
                  <td>{t.category}</td>
                  <td>{t.responsibleUser || '—'}<br /><small style={{ color: 'var(--muted)' }}>{t.responsibleRole || ''}</small></td>
                  <td>{t.affectedUser}</td>
                  <td>{t.assetId ? assetName(db, t.assetId) : '—'}</td>
                  <td style={{ whiteSpace: 'nowrap' }} title={fmtDate(t.createdAt)}>{fmtDateShort(t.createdAt)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
function StatCard({ n, l, c, danger }: { n: number; l: string; c: string; danger?: boolean }) {
  return <div className="stat"><div className="n" style={danger ? { color: 'var(--danger)' } : undefined}>{n}</div><div className="l">{l}</div><div className="bar" style={{ background: c }} /></div>
}
function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button className={'chip ' + (on ? 'on' : '')} onClick={onClick}>{children}</button>
}

/* ============================================================ DETAIL */
export function TicketDetailView() {
  const { db, ui, actions, go, toast } = useStore()
  const { open } = useModals()
  const [comment, setComment] = useState('')
  const t = db.tickets.find(x => x.uid === ui.current)
  if (!t) return <div className="empty">Ticket nicht gefunden. <a onClick={() => go('list')}>Zurück</a></div>
  const asset = t.assetId ? db.assets.find(a => a.id === t.assetId) : null
  const slaR = slaState(t, 'reaction'), slaL = slaState(t, 'resolution')
  const openStatus = STATUS[t.status].open
  const journal = [...t.journal].sort((a, b) => a.ts - b.ts)

  const submitComment = () => { if (!comment.trim()) { toast('Kommentar ist leer.', 'err'); return } actions.addComment(t.uid, comment); setComment(''); toast('Kommentar hinzugefügt.', 'ok') }
  const confirmAndMaybeRate = () => { actions.confirmResolved(t.uid); toast('Bestätigt & geschlossen.', 'ok'); if (isOwner(ui, t) && !t.rating) setTimeout(() => open('rate', t.uid), 150) }

  return (
    <>
      <div className="page-head">
        <div>
          <a className="hint" onClick={() => go('list')}>← Zurück zur Liste</a>
          <h2 style={{ marginTop: 6 }}><TypeBadge t={t.type} /> <span className="idcell" style={{ fontSize: 18 }}>{displayId(t)}</span></h2>
          <p style={{ fontSize: 16, color: 'var(--text)', fontWeight: 600, marginTop: 4 }}>{t.summary}</p>
        </div>
        <div style={{ textAlign: 'right' }}><StatusBadge s={t.status} /><br /><span className="hint">Zuletzt {relTime(t.updatedAt)}</span></div>
      </div>

      <div className="actionbar" style={{ marginBottom: 16 }}>
        {isAgent(ui) && openStatus && <>
          {t.responsibleUser !== ui.user && <button className="btn primary" onClick={() => { actions.takeOver(t.uid); toast('Übernommen.', 'ok') }}>🙌 Übernehmen</button>}
          <button className="btn" onClick={() => open('assign', t.uid)}>👥 Zuweisen</button>
          <button className="btn" onClick={() => open('status', t.uid)}>🔄 Status ändern</button>
          <button className="btn" onClick={() => open('pause', t.uid)}>⏸ Pausieren</button>
          {TRANSFORM[t.type].length > 0 && <button className="btn" onClick={() => open('transform', t.uid)}>🔀 Transform</button>}
          <button className="btn" onClick={() => go('edit', t.uid)}>✏️ Bearbeiten</button>
          <button className="btn primary" onClick={() => open('close', t.uid)}>✔ Abschließen</button>
        </>}
        {openStatus && (isOwner(ui, t) || isAgent(ui)) && <button className="btn danger" onClick={() => open('withdraw', t.uid)}>↩ Zurückziehen</button>}
        {t.status === 'resolved' && (isOwner(ui, t) || isAgent(ui)) && <>
          <button className="btn" onClick={() => open('reopen', t.uid)}>🔁 Wiedereröffnen</button>
          <button className="btn primary" onClick={confirmAndMaybeRate}>✔ Lösung bestätigen &amp; schließen</button>
        </>}
        {!openStatus && !db.settings.reopenLocked && (isOwner(ui, t) || isAgent(ui)) && <button className="btn" onClick={() => open('reopen', t.uid)}>🔁 Wiedereröffnen</button>}
        {t.status === 'closed' && isOwner(ui, t) && !t.rating && <button className="btn primary" onClick={() => open('rate', t.uid)}>⭐ Bewerten</button>}
        {isAgent(ui) && <button className="btn danger" onClick={() => open('delete', t.uid)}>🗑 Löschen</button>}
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          <Panel head="Beschreibung"><div className="desc-box">{t.description ? fmtText(t.description) : <span className="hint">Keine Beschreibung</span>}</div></Panel>
          {t.solution && <Panel head={<span style={{ color: 'var(--ok)' }}>✔ Lösung</span>}><div className="desc-box">{fmtText(t.solution)}</div></Panel>}
          {t.rating && <Panel head="Bewertung"><div><StarsDisplay n={t.rating.stars} /> <span style={{ fontWeight: 700, marginLeft: 6 }}>{t.rating.stars}/5</span>{t.rating.comment && <div className="jtext" style={{ marginTop: 8 }}>{fmtText(t.rating.comment)}</div>}</div></Panel>}

          <Panel head={<>Journal / Verlauf <span className="hint" style={{ fontWeight: 400 }}>{t.journal.length} Einträge</span></>}>
            <div className="journal">
              {journal.map((j, i) => {
                const last = i === journal.length - 1
                if (j.kind === 'status') {
                  const head = j.from && j.to
                    ? <><b>{j.author}</b> änderte Status <span style={{ color: 'var(--muted)' }}>{STATUS[j.from].label} →</span> <StatusBadge s={j.to} /> · <span title={fmtDate(j.ts)}>{relTime(j.ts)}</span></>
                    : <><b>{j.author}</b> · <span title={fmtDate(j.ts)}>{relTime(j.ts)}</span></>
                  return <JItem key={i} icon={j.to ? '●' : '✎'} last={last} dotBg={j.to ? STATUS[j.to].bg : undefined} head={head} body={j.text ? <div className="jtext sys">{fmtText(j.text)}</div> : null} />
                }
                if (j.kind === 'system') return <JItem key={i} icon="✎" last={last} head={<><b>{j.author}</b> · <span title={fmtDate(j.ts)}>{relTime(j.ts)}</span></>} body={<div className="jtext sys">{fmtText(j.text)}</div>} />
                return <JItem key={i} icon="💬" last={last} head={<><b>{j.author}</b> kommentierte · <span title={fmtDate(j.ts)}>{relTime(j.ts)}</span></>} body={<div className="jtext">{fmtText(j.text)}</div>} />
              })}
            </div>
            {(openStatus || t.status === 'resolved') && (
              <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                <Field label="Kommentar hinzufügen" hint="(**fett**, *kursiv*, Links)"><textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Journal-Eintrag schreiben …" /></Field>
                <div style={{ marginTop: 8, textAlign: 'right' }}><button className="btn primary sm" onClick={submitComment}>💬 Kommentieren</button></div>
              </div>
            )}
          </Panel>
        </div>

        <div className="detail-side">
          <Panel head="Details">
            <dl className="kv">
              <dt>Typ</dt><dd>{TYPES[t.type].label}</dd>
              <dt>Status</dt><dd><StatusBadge s={t.status} /></dd>
              <dt>Priorität</dt><dd><PriorityBadge p={t.priority} /></dd>
              <dt>Kategorie</dt><dd>{t.category}</dd>
              <dt>Verantw. Nutzer</dt><dd>{t.responsibleUser || '— nicht zugewiesen'}</dd>
              <dt>Verantw. Rolle</dt><dd>{t.responsibleRole || '—'}</dd>
              <dt>Betroffener</dt><dd>{t.affectedUser}</dd>
              <dt>Asset</dt><dd>{asset ? asset.name : '—'}</dd>
              <dt>Erstellt</dt><dd>{fmtDate(t.createdAt)}</dd>
              <dt>Geändert</dt><dd>{fmtDate(t.updatedAt)}</dd>
              {t.pausedUntil && <><dt>Reaktivierung</dt><dd>{fmtDate(t.pausedUntil)}</dd></>}
              {t.closedAt && <><dt>Geschlossen</dt><dd>{fmtDate(t.closedAt)}</dd></>}
            </dl>
          </Panel>
          <Panel head="SLA">
            <dl className="kv">
              <dt>Reaktionszeit</dt><dd>{PRIORITY[t.priority].reaction} h <span className={slaR.cls}>{slaR.txt}</span></dd>
              <dt>Lösungszeit</dt><dd>{PRIORITY[t.priority].resolution} h <span className={slaL.cls}>{slaL.txt}</span></dd>
            </dl>
          </Panel>
          <Panel head={<>Anhänge <span className="hint" style={{ fontWeight: 400 }}>{t.attachments.length}</span></>}>
            {t.attachments.length === 0 ? <div className="hint">Keine Anhänge</div> : t.attachments.map((a, i) => (
              <div className="attach" key={i}>
                <span className="fi">{a.type?.startsWith('image') ? '🖼️' : '📎'}</span>
                <div><div style={{ fontWeight: 600 }}>{a.name}</div><div className="hint">{(a.size / 1024).toFixed(0)} KB</div></div>
                <a href={a.dataUrl} download={a.name} target="_blank" rel="noreferrer">Öffnen</a>
              </div>
            ))}
            {openStatus && <div style={{ marginTop: 8 }}>
              <label className="btn sm" style={{ cursor: 'pointer' }}>📎 Datei anhängen
                <input type="file" hidden multiple onChange={e => { if (e.target.files) actions.attach(t.uid, e.target.files) }} />
              </label>
            </div>}
          </Panel>
        </div>
      </div>
    </>
  )
}
function Panel({ head, children }: { head: React.ReactNode; children: React.ReactNode }) {
  return <div className="panel"><div className="ph">{head}</div><div className="pb">{children}</div></div>
}
function JItem({ icon, last, head, body, dotBg }: { icon: string; last: boolean; head: React.ReactNode; body: React.ReactNode; dotBg?: string }) {
  return (
    <div className="jitem">
      <div className="jline"><div className="jdot" style={dotBg ? { background: dotBg } : undefined}>{icon}</div>{!last && <div className="jconn" />}</div>
      <div className="jbody"><div className="jhead">{head}</div>{body}</div>
    </div>
  )
}

/* ============================================================ FORMULAR (Create/Edit) */
export function TicketFormView() {
  const { db, ui, setUi, actions, go, openTicket, toast } = useStore()
  const editing = ui.view === 'edit'
  const existing = editing ? db.tickets.find(t => t.uid === ui.current) : null
  const pre = ui.createPrefill || {}

  const [summary, setSummary] = useState(existing?.summary ?? pre.summary ?? '')
  const [description, setDescription] = useState(existing?.description ?? pre.description ?? '')
  const [category, setCategory] = useState(existing?.category ?? pre.category ?? db.categories[0])
  const [priority, setPriority] = useState<Priority>(existing?.priority ?? pre.priority ?? 'medium')
  const [affected, setAffected] = useState(existing?.affectedUser ?? ui.user)
  const [assetId, setAssetId] = useState(existing?.assetId ?? pre.assetId ?? '')
  const [type, setType] = useState<TicketType>(existing?.type ?? pre.type ?? 'ticket')
  const [respUser, setRespUser] = useState(existing?.responsibleUser ?? pre.responsibleUser ?? '')
  const [respRole, setRespRole] = useState(existing?.responsibleRole ?? pre.responsibleRole ?? '')
  const [files, setFiles] = useState<FileList | null>(null)

  const kbHits = useMemo(() => {
    const q = summary.toLowerCase().trim()
    if (q.length < 3) return []
    return db.kb.map(a => {
      const latest = a.versions[a.versions.length - 1]
      const text = (a.title + ' ' + latest.body + ' ' + a.category).toLowerCase()
      const score = q.split(/\s+/).filter(w => w.length > 2 && text.includes(w)).length
      return { a, score, latest }
    }).filter(x => x.score > 0).sort((x, y) => y.score - x.score).slice(0, 4)
  }, [summary, db.kb])

  const submit = async () => {
    if (!summary.trim()) { toast('Bitte eine Zusammenfassung angeben.', 'err'); return }
    if (editing && existing) {
      actions.editTicket(existing.uid, {
        summary, description, category, priority, affectedUser: affected, assetId: assetId || null,
        responsibleUser: respUser || null, responsibleRole: respRole || null,
        ...(isAgent(ui) ? { type } : {}),
      })
      toast('Gespeichert.', 'ok'); openTicket(existing.uid)
    } else {
      const uid = await actions.createTicket({
        summary, description, category, priority, affectedUser: affected, assetId: assetId || null,
        type: isAgent(ui) ? type : 'ticket',
        responsibleUser: isAgent(ui) ? (respUser || null) : null,
        responsibleRole: isAgent(ui) ? (respRole || null) : null,
      }, files || undefined)
      setUi({ createPrefill: null })
      toast('Ticket erstellt.', 'ok'); openTicket(uid)
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <a className="hint" onClick={() => go('list')}>← Zurück</a>
          <h2 style={{ marginTop: 6 }}>{editing ? 'Ticket bearbeiten' : 'Neues Ticket erstellen'}</h2>
          <p>{isAgent(ui) ? 'Als Agent kannst du Typ und Verantwortliche direkt festlegen.' : 'Beschreibe dein Anliegen – wir kümmern uns darum.'}</p>
        </div>
      </div>
      <div className="detail-grid">
        <div className="panel"><div className="pb" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Zusammenfassung / Titel" required><input value={summary} onChange={e => setSummary(e.target.value)} placeholder="z. B. Waschmaschine pumpt nicht ab" /></Field>
          <Field label="Beschreibung" hint="(**fett**, *kursiv*, Links)"><textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Was ist passiert? Seit wann? Was wurde schon versucht?" /></Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Kategorie"><Select value={category} onChange={setCategory} options={db.categories.map(c => ({ v: c, l: c }))} /></Field>
            <Field label="Priorität"><Select value={priority} onChange={v => setPriority(v as Priority)} options={PRIORITY_ORDER.map(p => ({ v: p, l: PRIORITY[p].label }))} /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Betroffener Nutzer"><Select value={affected} onChange={setAffected} options={db.users.map(u => ({ v: u, l: u }))} /></Field>
            <Field label="Zugehöriges Asset"><Select value={assetId ?? ''} onChange={setAssetId} allowEmpty emptyLabel="— keines —" options={db.assets.map(a => ({ v: a.id, l: a.name }))} /></Field>
          </div>
          {isAgent(ui) && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <Field label="Typ"><Select value={type} onChange={v => setType(v as TicketType)} options={TYPE_ORDER.map(t => ({ v: t, l: TYPES[t].icon + ' ' + TYPES[t].label }))} /></Field>
            <Field label="Verantw. Nutzer"><Select value={respUser ?? ''} onChange={setRespUser} allowEmpty emptyLabel="—" options={db.users.map(u => ({ v: u, l: u }))} /></Field>
            <Field label="Verantw. Rolle"><Select value={respRole ?? ''} onChange={setRespRole} allowEmpty emptyLabel="—" options={db.roles.map(r => ({ v: r, l: r }))} /></Field>
          </div>}
          {!editing && <Field label="Anhänge"><input type="file" multiple onChange={e => setFiles(e.target.files)} /></Field>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
            <button className="btn" onClick={() => go(editing && existing ? 'detail' : 'list')}>Abbrechen</button>
            <button className="btn primary" onClick={submit}>{editing ? '✔ Änderungen speichern' : '✔ Ticket erstellen'}</button>
          </div>
        </div></div>
        <Panel head="📚 Passende Artikel">
          {kbHits.length === 0
            ? <div className="hint">Gib eine Zusammenfassung ein – passende Wissensdatenbank-Artikel erscheinen automatisch.</div>
            : kbHits.map(h => (
              <div key={h.a.id} className="resrow" style={{ marginBottom: 8 }} onClick={() => go('kbArticle', h.a.id)}>
                <div style={{ fontWeight: 700 }}>📄 {h.a.title}</div>
                <div className="hint" style={{ marginTop: 3 }}>{h.latest.body.slice(0, 90)}…</div>
              </div>
            ))}
        </Panel>
      </div>
    </>
  )
}

/* ============================================================ WISSENSDATENBANK */
export function KBView() {
  const { db, ui, go, actions } = useStore()
  const [modal, setModal] = useState(false)
  return (
    <>
      <div className="page-head">
        <div><h2>📚 Wissensdatenbank</h2><p>Artikel mit Versionierung · {db.kb.length} Einträge</p></div>
        {isAgent(ui) && <button className="btn primary" onClick={() => setModal(true)}>➕ Neuer Artikel</button>}
      </div>
      <div className="cardgrid">
        {db.kb.map(a => { const v = a.versions[a.versions.length - 1]
          return <div key={a.id} className="tile" onClick={() => go('kbArticle', a.id)}>
            <div className="ti">📄</div><h4>{a.title}</h4><p>{v.body}</p>
            <div className="meta"><span className="badge" style={{ background: 'var(--brand-l)', color: 'var(--brand)' }}>{a.category}</span><span>v{v.v}</span><span>· {fmtDateShort(v.date)}</span></div>
          </div>
        })}
      </div>
      {modal && <SimpleFormModal title="Neuer Artikel" submitLabel="Erstellen" onClose={() => setModal(false)}
        fields={[
          { name: 'title', label: 'Titel', required: true },
          { name: 'category', label: 'Kategorie', type: 'select', options: db.categories.map(c => ({ v: c, l: c })) },
          { name: 'body', label: 'Inhalt', type: 'textarea', required: true },
        ]}
        onSubmit={v => { const id = actions.addKB(v.title, v.category, v.body); go('kbArticle', id) }} />}
    </>
  )
}
export function KBArticleView() {
  const { db, ui, setUi, go, actions } = useStore()
  const [modal, setModal] = useState(false)
  const a = db.kb.find(x => x.id === ui.current)
  if (!a) return <div className="empty">Artikel nicht gefunden. <a onClick={() => go('kb')}>Zurück</a></div>
  const v = a.versions[a.versions.length - 1]
  return (
    <>
      <div className="page-head">
        <div>
          <a className="hint" onClick={() => go('kb')}>← Wissensdatenbank</a>
          <h2 style={{ marginTop: 6 }}>📄 {a.title}</h2>
          <p>{a.category} · Version {v.v} · aktualisiert {fmtDate(v.date)} von {v.author}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {isAgent(ui) && <button className="btn" onClick={() => setModal(true)}>✏️ Neue Version</button>}
          <button className="btn primary" onClick={() => { setUi({ createPrefill: { summary: a.title, category: a.category } }); go('create') }}>🎫 Ticket dazu erstellen</button>
        </div>
      </div>
      <div className="detail-grid">
        <Panel head="Inhalt (aktuelle Version)"><div className="desc-box">{fmtText(v.body)}</div></Panel>
        <Panel head="Versionsverlauf">
          <div className="journal">
            {[...a.versions].reverse().map((ver, i, arr) => (
              <JItem key={ver.v} icon={'v' + ver.v} last={i === arr.length - 1}
                head={<><b>Version {ver.v}</b> · {ver.author} · <span title={fmtDate(ver.date)}>{fmtDateShort(ver.date)}</span></>}
                body={<div className="jtext">{fmtText(ver.body)}</div>} />
            ))}
          </div>
        </Panel>
      </div>
      {modal && <SimpleFormModal title={'Neue Version — ' + a.title} submitLabel="Speichern" onClose={() => setModal(false)}
        fields={[{ name: 'body', label: 'Inhalt', type: 'textarea', required: true, value: v.body }]}
        onSubmit={vals => actions.addKBVersion(a.id, vals.body)} />}
    </>
  )
}

/* ============================================================ SERVICE-KATALOG */
export function CatalogView() {
  const { db, ui, setUi, go, actions, toast } = useStore()
  const [modal, setModal] = useState(false)
  const order = (s: ServiceItem) => { setUi({ createPrefill: { summary: s.name, description: s.desc, category: s.category, priority: s.priority, type: 'service_request' } }); go('create'); toast('Formular aus Service „' + s.name + '" vorausgefüllt.') }
  return (
    <>
      <div className="page-head">
        <div><h2>🛎️ Service-Katalog</h2><p>Bestellbare Services – erzeugen automatisch einen Service Request</p></div>
        {isAgent(ui) && <button className="btn" onClick={() => setModal(true)}>➕ Service anlegen</button>}
      </div>
      <div className="cardgrid">
        {db.services.map(s => (
          <div key={s.id} className="tile" onClick={() => order(s)}>
            <div className="ti">{s.icon}</div><h4>{s.name}</h4><p>{s.desc}</p>
            <div className="meta"><span className="badge" style={{ background: 'var(--brand-l)', color: 'var(--brand)' }}>{s.category}</span><PriorityBadge p={s.priority} /></div>
            <div style={{ marginTop: 12 }}><button className="btn primary sm" onClick={e => { e.stopPropagation(); order(s) }}>Bestellen →</button></div>
          </div>
        ))}
      </div>
      {modal && <SimpleFormModal title="Service anlegen" submitLabel="Anlegen" onClose={() => setModal(false)}
        fields={[
          { name: 'name', label: 'Name', required: true },
          { name: 'icon', label: 'Icon (Emoji)', value: '🛎️' },
          { name: 'desc', label: 'Beschreibung', type: 'textarea' },
          { name: 'category', label: 'Kategorie', type: 'select', options: db.categories.map(c => ({ v: c, l: c })) },
          { name: 'priority', label: 'Priorität', type: 'select', options: PRIORITY_ORDER.map(p => ({ v: p, l: PRIORITY[p].label })) },
        ]}
        onSubmit={v => actions.addService({ name: v.name, icon: v.icon || '🛎️', desc: v.desc, category: v.category, priority: v.priority as Priority })} />}
    </>
  )
}

/* ============================================================ ASSETS */
export function AssetsView() {
  const { db, ui, setUi, go, actions, toast } = useStore()
  const [modal, setModal] = useState(false)
  const icon = (a: Asset) => { const s = (a.type + ' ' + a.name).toLowerCase()
    if (s.includes('netz') || s.includes('router') || s.includes('wlan')) return '📶'
    if (s.includes('drucker')) return '🖨️'; if (s.includes('wasch') || s.includes('spül')) return '🧺'; if (s.includes('it')) return '💻'; return '📦' }
  const fromAsset = (a: Asset) => { setUi({ createPrefill: { assetId: a.id, category: a.category, summary: a.name + ': ' } }); go('create'); toast('Formular aus Asset „' + a.name + '" vorausgefüllt.') }
  return (
    <>
      <div className="page-head">
        <div><h2>📦 Asset-Verwaltung</h2><p>Geräte & Gegenstände im Haushalt · {db.assets.length} Assets</p></div>
        {isAgent(ui) && <button className="btn" onClick={() => setModal(true)}>➕ Asset anlegen</button>}
      </div>
      <div className="cardgrid">
        {db.assets.map(a => {
          const openC = db.tickets.filter(t => t.assetId === a.id && STATUS[t.status].open).length
          const total = db.tickets.filter(t => t.assetId === a.id).length
          return <div key={a.id} className="tile">
            <div className="ti">{icon(a)}</div><h4>{a.name}</h4><p>{a.type} · {a.location || '—'}</p>
            <div className="meta"><span className="badge" style={{ background: 'var(--brand-l)', color: 'var(--brand)' }}>{a.category}</span><span>{total} Vorgänge</span>{openC > 0 && <span style={{ color: 'var(--danger)', fontWeight: 700 }}>{openC} offen</span>}</div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button className="btn primary sm" onClick={() => fromAsset(a)}>🎫 Ticket erstellen</button>
              <button className="btn sm" onClick={() => setUi({ filters: { asset: a.id }, quick: null, view: 'list' })}>Vorgänge</button>
            </div>
          </div>
        })}
      </div>
      {modal && <SimpleFormModal title="Asset anlegen" submitLabel="Anlegen" onClose={() => setModal(false)}
        fields={[
          { name: 'name', label: 'Name', required: true },
          { name: 'type', label: 'Typ', value: 'Gerät' },
          { name: 'location', label: 'Standort' },
          { name: 'category', label: 'Kategorie', type: 'select', options: db.categories.map(c => ({ v: c, l: c })) },
        ]}
        onSubmit={v => actions.addAsset({ name: v.name, type: v.type, location: v.location, category: v.category })} />}
    </>
  )
}

/* ============================================================ EINSTELLUNGEN */
export function SettingsView() {
  const { db, actions, toast } = useStore()
  const s = db.settings
  const ListEditor = ({ title, k }: { title: string; k: 'users' | 'roles' | 'categories' }) => {
    const [val, setVal] = useState('')
    return (
      <Panel head={<>{title} <span className="hint" style={{ fontWeight: 400 }}>{db[k].length}</span></>}>
        {db[k].map((x, i) => <div className="attach" key={i}><span>{x}</span><a onClick={() => actions.removeFromList(k, i)} style={{ marginLeft: 'auto', color: 'var(--danger)', cursor: 'pointer' }}>Entfernen</a></div>)}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input value={val} onChange={e => setVal(e.target.value)} placeholder="Hinzufügen …" style={{ flex: 1, padding: '8px 10px', border: '1px solid var(--border-2)', borderRadius: 8, background: 'var(--panel-2)', color: 'var(--text)' }} />
          <button className="btn sm" onClick={() => { if (val.trim()) { actions.addToList(k, val.trim()); setVal('') } }}>+</button>
        </div>
      </Panel>
    )
  }
  return (
    <>
      <div className="page-head"><div><h2>⚙️ Einstellungen</h2><p>Workflow-Verhalten, Nutzer, Rollen & Kategorien</p></div></div>
      <div className="detail-grid">
        <div className="detail-main">
          <Panel head="Workflow">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Pause: automatische Reaktivierung nach (Tagen)"><input type="number" min={0} value={s.pauseReactivationDays} onChange={e => { actions.setSetting('pauseReactivationDays', +e.target.value); toast('Gespeichert.', 'ok') }} /></Field>
              <Field label="Gelöst: automatisch schließen nach (Tagen ohne Rückmeldung)"><input type="number" min={0} value={s.resolvedAutoCloseDays} onChange={e => { actions.setSetting('resolvedAutoCloseDays', +e.target.value); toast('Gespeichert.', 'ok') }} /></Field>
              <Field label="Eskalation: Hinweis bei Inaktivität ab (Tagen)"><input type="number" min={1} value={s.escalationDays} onChange={e => { actions.setSetting('escalationDays', +e.target.value); toast('Gespeichert.', 'ok') }} /></Field>
              <label style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer' }}>
                <input type="checkbox" checked={s.reopenLocked} onChange={e => actions.setSetting('reopenLocked', e.target.checked)} />
                <span><b>Wiedereröffnung sperren</b><br /><span className="hint">Geschlossene Tickets können nicht mehr wiedereröffnet werden.</span></span>
              </label>
              <label style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer' }}>
                <input type="checkbox" checked={s.emailNotify} onChange={e => actions.setSetting('emailNotify', e.target.checked)} />
                <span><b>E-Mail-Benachrichtigung</b><br /><span className="hint">Bei Statusänderungen (simuliert – Ausgabe in der Browser-Konsole).</span></span>
              </label>
            </div>
          </Panel>
          <Panel head="Daten">
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn" onClick={() => actions.exportData()}>⬇️ Export (JSON)</button>
              <label className="btn" style={{ cursor: 'pointer' }}>⬆️ Import<input type="file" hidden accept="application/json" onChange={e => { if (e.target.files?.[0]) actions.importData(e.target.files[0]) }} /></label>
              <button className="btn" onClick={() => { actions.runAutomationNow(); toast('Automatik ausgeführt.', 'ok') }}>🔄 Automatik jetzt ausführen</button>
              <button className="btn danger" onClick={() => actions.resetAll()}>🗑 Alles zurücksetzen</button>
            </div>
          </Panel>
          <SyncPanel />
        </div>
        <div className="detail-side">
          <ListEditor title="Nutzer" k="users" />
          <ListEditor title="Rollen" k="roles" />
          <ListEditor title="Kategorien" k="categories" />
        </div>
      </div>
    </>
  )
}

/* ---------- Cloud-Sync (Supabase) ---------- */
function SyncPanel() {
  const { sync, actions, toast } = useStore()
  const saved = loadSyncConfig()
  const [url, setUrl] = useState(saved?.url ?? '')
  const [anonKey, setAnonKey] = useState(saved?.anonKey ?? '')
  const [code, setCode] = useState(saved?.code ?? '')
  const [showSql, setShowSql] = useState(false)

  const statusText: Record<string, string> = {
    disabled: 'Nicht verbunden', idle: 'Bereit', syncing: 'Synchronisiert …',
    ok: 'Synchron', offline: 'Offline – wird bei Verbindung übertragen', error: 'Fehler',
  }
  const statusColor: Record<string, string> = {
    disabled: 'var(--muted)', idle: 'var(--muted)', syncing: 'var(--brand)',
    ok: 'var(--ok)', offline: 'var(--warn)', error: 'var(--danger)',
  }
  const dot = statusColor[sync.status] ?? 'var(--muted)'

  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 10px', border: '1px solid var(--border-2)', borderRadius: 8, background: 'var(--panel-2)', color: 'var(--text)', fontFamily: 'inherit' }

  return (
    <Panel head={<>☁️ Cloud-Sync <span className="hint" style={{ fontWeight: 400 }}>(optional, Supabase)</span></>}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span className="badge" style={{ background: 'transparent', border: '1px solid var(--border)' }}>
          <span className="dot" style={{ background: dot }} /> {statusText[sync.status] ?? sync.status}
        </span>
        {sync.lastAt && <span className="hint">zuletzt {relTime(sync.lastAt)}</span>}
      </div>
      {sync.error && <div className="jtext" style={{ borderLeftColor: 'var(--danger)', marginBottom: 12 }}>{sync.error}</div>}

      <p className="hint" style={{ marginTop: 0 }}>
        Synchronisiert alle Tickets über dein eigenes (kostenloses) Supabase-Projekt. Die Daten bleiben
        offline nutzbar und werden hochgeladen, sobald Internet verfügbar ist. Auf einem zweiten Gerät
        einfach dieselbe URL, denselben Anon-Key und denselben Sync-Code eintragen.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Field label="Supabase Project-URL" hint="(Project Settings → API)">
          <input style={inputStyle} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://xxxx.supabase.co" />
        </Field>
        <Field label="Anon Public Key" hint="(öffentlicher Client-Key)">
          <input style={inputStyle} value={anonKey} onChange={e => setAnonKey(e.target.value)} placeholder="eyJhbGciOi…" />
        </Field>
        <Field label="Sync-Code" hint="(geheim – auf allen Geräten gleich)">
          <div style={{ display: 'flex', gap: 8 }}>
            <input style={inputStyle} value={code} onChange={e => setCode(e.target.value)} placeholder="z. B. generieren →" />
            <button className="btn sm" type="button" onClick={() => setCode(generateSyncCode())}>🎲 Neu</button>
          </div>
        </Field>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
        <button className="btn primary" onClick={() => actions.configureSync({ url, anonKey, code })}>
          🔗 {sync.configured ? 'Aktualisieren & synchronisieren' : 'Verbinden & synchronisieren'}
        </button>
        {sync.configured && <button className="btn" onClick={() => actions.syncNow()}>🔄 Jetzt synchronisieren</button>}
        {sync.configured && <button className="btn danger" onClick={() => actions.disconnectSync()}>Trennen</button>}
      </div>

      <div style={{ marginTop: 14 }}>
        <a className="hint" style={{ cursor: 'pointer' }} onClick={() => setShowSql(v => !v)}>
          {showSql ? '▾' : '▸'} Einrichtung: SQL für Supabase (einmalig)
        </a>
        {showSql && (
          <div style={{ marginTop: 8 }}>
            <p className="hint" style={{ marginTop: 0 }}>
              In Supabase → <b>SQL Editor</b> → neues Query → einfügen → <b>Run</b>. Danach oben URL, Anon-Key und Sync-Code eintragen.
            </p>
            <pre style={{ maxHeight: 220, overflow: 'auto', background: 'var(--panel-2)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, fontSize: 12, whiteSpace: 'pre' }}>{SUPABASE_SQL}</pre>
            <button className="btn sm" type="button" onClick={() => { navigator.clipboard?.writeText(SUPABASE_SQL); toast('SQL kopiert.', 'ok') }}>📋 SQL kopieren</button>
          </div>
        )}
      </div>
    </Panel>
  )
}

/* ============================================================ SUCHE */
export function SearchView() {
  const { db, ui, openTicket, go } = useStore()
  const q = ui.searchQuery || ''
  const ql = q.toLowerCase()
  const hit = (txt?: string | null) => (txt || '').toLowerCase().includes(ql)
  const tickets = selectVisible(db, ui).filter(t => ticketMatches(t, q))
  const byType: Record<string, Ticket[]> = {}
  tickets.forEach(t => { (byType[t.type] = byType[t.type] || []).push(t) })
  const kb = db.kb.filter(a => hit(a.title) || a.versions.some(v => hit(v.body)))
  const Mark = ({ text }: { text: string }) => {
    const i = text.toLowerCase().indexOf(ql)
    if (i < 0) return <>{text.slice(0, 120)}</>
    const start = Math.max(0, i - 30)
    return <>{start > 0 ? '…' : ''}{text.slice(start, i)}<mark>{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length, i + q.length + 60)}…</>
  }
  return (
    <>
      <div className="page-head"><div><a className="hint" onClick={() => go('list')}>← Zurück</a><h2 style={{ marginTop: 6 }}>Suchergebnisse für „{q}"</h2><p>{tickets.length + kb.length} Treffer</p></div></div>
      <div className="searchres">
        {TYPE_ORDER.filter(ty => byType[ty]).map(ty => (
          <div className="grp" key={ty}>
            <h3>{TYPES[ty].icon} {TYPES[ty].label} ({byType[ty].length})</h3>
            {byType[ty].map(t => {
              const src = [t.summary, t.description, t.solution, ...t.journal.map(j => j.text)].find(x => hit(x)) || t.summary
              return <div className="resrow" key={t.uid} onClick={() => openTicket(t.uid)}>
                <div><span className="idcell">{displayId(t)}</span> <StatusBadge s={t.status} /> <b>{t.summary}</b></div>
                <div className="hint" style={{ marginTop: 4 }}><Mark text={src || ''} /></div>
              </div>
            })}
          </div>
        ))}
        {kb.length > 0 && <div className="grp">
          <h3>📚 Wissensdatenbank ({kb.length})</h3>
          {kb.map(a => { const v = a.versions[a.versions.length - 1]; const src = hit(a.title) ? a.title : v.body
            return <div className="resrow" key={a.id} onClick={() => go('kbArticle', a.id)}>
              <div>📄 <b>{a.title}</b> <span className="hint">v{v.v}</span></div>
              <div className="hint" style={{ marginTop: 4 }}><Mark text={src} /></div>
            </div>
          })}
        </div>}
        {tickets.length + kb.length === 0 && <div className="empty"><div className="big">🔍</div>Keine Treffer für „{q}".</div>}
      </div>
    </>
  )
}

/* ============================================================ DASHBOARD */
export function DashboardView() {
  const { db, ui, setUi } = useStore()
  const list = selectVisible(db, ui)
  const byStatus = STATUS_ORDER.map(s => ({ s, n: list.filter(t => t.status === s).length }))
  const byType = TYPE_ORDER.map(t => ({ t, n: list.filter(x => x.type === t).length }))
  const maxS = Math.max(1, ...byStatus.map(x => x.n))
  const maxT = Math.max(1, ...byType.map(x => x.n))
  const openC = list.filter(t => STATUS[t.status].open).length
  const rated = list.filter(t => t.rating)
  const avg = rated.length ? (rated.reduce((a, t) => a + (t.rating?.stars || 0), 0) / rated.length).toFixed(1) : '—'
  return (
    <>
      <div className="page-head"><div><h2>📊 Dashboard</h2><p>Überblick über alle sichtbaren Vorgänge</p></div></div>
      <div className="stats">
        <StatCard n={list.length} l="Vorgänge gesamt" c="var(--brand)" />
        <StatCard n={openC} l="Offen" c="#3b82f6" />
        <div className="stat"><div className="n">{avg}</div><div className="l">Ø Bewertung ({rated.length})</div><div className="bar" style={{ background: '#f59e0b' }} /></div>
        <StatCard n={list.filter(t => isEscalated(t, db.settings.escalationDays)).length} l="Eskaliert" c="var(--danger)" />
      </div>
      <div className="detail-grid">
        <Panel head="Vorgänge nach Status">
          <div className="chart">
            {byStatus.map(({ s, n }) => (
              <div className="chart-row" key={s} onClick={() => setUi({ filters: { status: s }, quick: null, view: 'list' })}>
                <div className="chart-label"><StatusBadge s={s} /></div>
                <div className="chart-track"><div className="chart-fill" style={{ width: (n / maxS * 100) + '%', background: STATUS[s].color }} /></div>
                <div className="chart-n">{n}</div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel head="Vorgänge nach Typ">
          <div className="chart">
            {byType.map(({ t, n }) => (
              <div className="chart-row" key={t} onClick={() => setUi({ filters: { type: t }, quick: null, view: 'list' })}>
                <div className="chart-label">{TYPES[t].icon} {TYPES[t].label}</div>
                <div className="chart-track"><div className="chart-fill" style={{ width: (n / maxT * 100) + '%', background: 'var(--brand)' }} /></div>
                <div className="chart-n">{n}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  )
}
