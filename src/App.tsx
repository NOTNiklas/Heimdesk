/* ============================================================
   HeimDesk — App-Shell (Layout, Navigation, Router)
   ============================================================ */
import React, { useState } from 'react'
import { useStore, selectVisible } from './store'
import { STATUS } from './domain'
import { initials } from './lib'
import { ModalContext, ModalHost, type ModalKind } from './modals'
import {
  TicketListView, TicketDetailView, TicketFormView, KBView, KBArticleView,
  CatalogView, AssetsView, SettingsView, SearchView, DashboardView,
} from './views'

export default function App() {
  const { db, ui, setUi, go, toasts } = useStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [modal, setModal] = useState<{ kind: ModalKind; uid: string } | null>(null)
  const [search, setSearch] = useState('')

  const closeSidebar = () => setSidebarOpen(false)

  const visible = selectVisible(db, ui)
  const openCount = visible.filter(t => STATUS[t.status].open).length
  const mineCount = db.tickets.filter(t => t.responsibleUser === ui.user && STATUS[t.status].open).length

  const doSearch = () => { if (search.trim()) { setUi({ searchQuery: search.trim(), view: 'search' }); closeSidebar() } }

  const NavItem = ({ view, icon, label, count, onClick, active }:
    { view?: typeof ui.view; icon: string; label: string; count?: number; onClick?: () => void; active?: boolean }) => {
    const isActive = active ?? (ui.view === view)
    const handle = onClick ?? (() => { go(view!); closeSidebar() })
    return (
      <a className={isActive ? 'active' : ''} role="button" tabIndex={0}
         aria-current={isActive ? 'page' : undefined}
         onClick={handle}
         onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handle() } }}>
        <span className="ic" aria-hidden="true">{icon}</span>{label}{count != null && <span className="count">{count}</span>}
      </a>
    )
  }

  return (
    <ModalContext.Provider value={{ open: (kind, uid) => setModal({ kind, uid }) }}>
      <div className="layout">
        <aside className={'sidebar' + (sidebarOpen ? ' open' : '')}>
          <div className="brand">
            <div className="logo">HD</div>
            <div><h1>HeimDesk</h1><small>Service Desk</small></div>
          </div>
          <nav className="nav">
            <div className="section">Service Desk</div>
            <NavItem view="dashboard" icon="📊" label="Dashboard" />
            <NavItem view="list" icon="📋" label="Ticketliste" count={openCount} onClick={() => { setUi({ view: 'list' }); closeSidebar() }} active={ui.view === 'list'} />
            <NavItem view="create" icon="➕" label="Neues Ticket" />
            {ui.role === 'agent' && <NavItem icon="🙋" label="Mir zugewiesen" count={mineCount} onClick={() => { setUi({ quick: 'mine', view: 'list' }); closeSidebar() }} active={false} />}
            <div className="section">Self-Service</div>
            <NavItem view="catalog" icon="🛎️" label="Service-Katalog" />
            <NavItem view="kb" icon="📚" label="Wissensdatenbank" />
            <NavItem view="assets" icon="📦" label="Assets" />
            <div className="section">System</div>
            <NavItem view="settings" icon="⚙️" label="Einstellungen" />
          </nav>
          <div className="sidebar-foot">{db.tickets.length} Vorgänge · lokal gespeichert</div>
        </aside>

        {sidebarOpen && <div className="backdrop show" onClick={closeSidebar} />}

        <div className="main">
          <div className="topbar">
            <button className="menu-toggle" onClick={() => setSidebarOpen(true)} aria-label="Menü">☰</button>
            <div className="search">
              <span className="mag">🔎</span>
              <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') doSearch() }}
                placeholder="Volltextsuche über Tickets, Wissensdatenbank …" />
            </div>
            <div className="role-switch">
              <button className={ui.role === 'user' ? 'on' : ''} onClick={() => setUi({ role: 'user', quick: ui.quick === 'mine' ? null : ui.quick })} title="Self-Service-Portal">🙋 Endnutzer</button>
              <button className={ui.role === 'agent' ? 'on' : ''} onClick={() => setUi({ role: 'agent' })} title="Service-Desk">🎧 Agent</button>
            </div>
            <div className="userpick">
              <div className="avatar" title={ui.user}>{initials(ui.user)}</div>
              <select value={ui.user} onChange={e => setUi({ user: e.target.value })}>
                {db.users.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="content">
            <Router />
          </div>
        </div>
      </div>

      {modal && <ModalHost kind={modal.kind} uid={modal.uid} onClose={() => setModal(null)} />}

      <div className="toasts">
        {toasts.map(t => <div key={t.id} className={'toast' + (t.type ? ' ' + t.type : '')}>{t.msg}</div>)}
      </div>
    </ModalContext.Provider>
  )
}

function Router() {
  const { ui } = useStore()
  switch (ui.view) {
    case 'list': return <TicketListView />
    case 'detail': return <TicketDetailView />
    case 'create': return <TicketFormView />
    case 'edit': return <TicketFormView />
    case 'kb': return <KBView />
    case 'kbArticle': return <KBArticleView />
    case 'catalog': return <CatalogView />
    case 'assets': return <AssetsView />
    case 'settings': return <SettingsView />
    case 'search': return <SearchView />
    case 'dashboard': return <DashboardView />
    default: return <TicketListView />
  }
}
