/* ============================================================
   HeimDesk — Cloud-Sync über Supabase (optional)
   ------------------------------------------------------------
   Prinzip: Die gesamte Datenbank (DB) wird als EIN JSON-Datensatz
   in Supabase abgelegt, adressiert über den SHA-256-Hash eines
   frei wählbaren Sync-Codes. Der Klartext-Code verlässt das Gerät
   nie – server­seitig steht nur der Hash. Zugriff ausschließlich
   über zwei RPC-Funktionen (siehe SUPABASE_SQL unten), damit die
   Tabelle nicht aufgelistet werden kann.
   Konfliktstrategie: „letzte Änderung gewinnt" auf Dokumentebene
   (updatedAt-Zeitstempel). Für den privaten Ein-Personen-Betrieb
   auf mehreren eigenen Geräten ausreichend.
   ============================================================ */
import type { DB } from './domain'

export const SYNC_CFG_KEY = 'heimdesk_sync_v1'
export const SYNC_META_KEY = 'heimdesk_sync_meta_v1'

export interface SyncConfig { url: string; anonKey: string; code: string }
export interface SyncMeta { updatedAt: number }
export type SyncStatus = 'disabled' | 'idle' | 'syncing' | 'ok' | 'offline' | 'error'
export interface SyncState { configured: boolean; status: SyncStatus; lastAt: number | null; error: string | null }

/* ---------- Konfiguration / Meta laden & speichern ---------- */
export function loadSyncConfig(): SyncConfig | null {
  try {
    const raw = localStorage.getItem(SYNC_CFG_KEY)
    if (!raw) return null
    const c = JSON.parse(raw)
    if (c && c.url && c.anonKey && c.code) return c as SyncConfig
  } catch { /* ignore */ }
  return null
}
export function saveSyncConfig(cfg: SyncConfig | null) {
  try {
    if (cfg) localStorage.setItem(SYNC_CFG_KEY, JSON.stringify(cfg))
    else localStorage.removeItem(SYNC_CFG_KEY)
  } catch { /* ignore */ }
}
export function loadSyncMeta(): SyncMeta {
  try {
    const raw = localStorage.getItem(SYNC_META_KEY)
    if (raw) { const m = JSON.parse(raw); if (m && typeof m.updatedAt === 'number') return m as SyncMeta }
  } catch { /* ignore */ }
  return { updatedAt: 0 }
}
export function saveSyncMeta(m: SyncMeta) {
  try { localStorage.setItem(SYNC_META_KEY, JSON.stringify(m)) } catch { /* ignore */ }
}

/* ---------- Hilfen ---------- */
export function generateSyncCode(): string {
  // 24 Zeichen aus zufälligen Bytes – lang genug, um nicht erratbar zu sein.
  const bytes = new Uint8Array(18)
  crypto.getRandomValues(bytes)
  const b64 = btoa(String.fromCharCode(...bytes)).replace(/[+/=]/g, '')
  return b64.slice(0, 24)
}
async function hashCode(code: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('heimdesk:' + code))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}
function normUrl(url: string): string {
  // Trailing-Slashes entfernen und ein versehentlich mitkopiertes "/rest/v1"
  // abschneiden – die App hängt den REST-Pfad selbst an.
  return url.trim().replace(/\/+$/, '').replace(/\/rest\/v1$/i, '').replace(/\/+$/, '')
}
function headers(cfg: SyncConfig): Record<string, string> {
  return { apikey: cfg.anonKey, Authorization: 'Bearer ' + cfg.anonKey, 'Content-Type': 'application/json' }
}

export function isOnline(): boolean {
  return typeof navigator === 'undefined' ? true : navigator.onLine
}

/* ---------- Remote-Zugriff (RPC) ---------- */
export interface RemoteState { data: DB; updatedAt: number }

export async function pull(cfg: SyncConfig): Promise<RemoteState | null> {
  const codeHash = await hashCode(cfg.code)
  const res = await fetch(normUrl(cfg.url) + '/rest/v1/rpc/heimdesk_get', {
    method: 'POST', headers: headers(cfg), body: JSON.stringify({ p_code_hash: codeHash }),
  })
  if (!res.ok) throw new Error('Pull fehlgeschlagen (' + res.status + '): ' + (await safeText(res)))
  const rows = await res.json()
  const row = Array.isArray(rows) ? rows[0] : rows
  if (!row || !row.data) return null
  return { data: row.data as DB, updatedAt: Number(row.updated_at) || 0 }
}

export async function push(cfg: SyncConfig, data: DB, updatedAt: number): Promise<void> {
  const codeHash = await hashCode(cfg.code)
  const res = await fetch(normUrl(cfg.url) + '/rest/v1/rpc/heimdesk_set', {
    method: 'POST', headers: headers(cfg),
    body: JSON.stringify({ p_code_hash: codeHash, p_data: data, p_updated_at: updatedAt }),
  })
  if (!res.ok) throw new Error('Push fehlgeschlagen (' + res.status + '): ' + (await safeText(res)))
}

async function safeText(res: Response): Promise<string> {
  try { return (await res.text()).slice(0, 200) } catch { return '' }
}

/* ---------- SQL-Setup für Supabase (einmalig im SQL-Editor ausführen) ---------- */
export const SUPABASE_SQL = `-- HeimDesk Cloud-Sync: einmalig im Supabase SQL-Editor ausführen
create table if not exists heimdesk_state (
  code_hash  text primary key,
  data       jsonb not null,
  updated_at bigint not null,
  changed_at timestamptz not null default now()
);
alter table heimdesk_state enable row level security;
-- Keine Table-Policies -> die Tabelle ist per anon nicht auflistbar.

create or replace function heimdesk_get(p_code_hash text)
returns table(data jsonb, updated_at bigint)
language sql security definer set search_path = public as $$
  select data, updated_at from heimdesk_state where code_hash = p_code_hash;
$$;

create or replace function heimdesk_set(p_code_hash text, p_data jsonb, p_updated_at bigint)
returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into heimdesk_state(code_hash, data, updated_at, changed_at)
  values (p_code_hash, p_data, p_updated_at, now())
  on conflict (code_hash) do update
    set data = excluded.data, updated_at = excluded.updated_at, changed_at = now();
end;
$$;

grant execute on function heimdesk_get(text)  to anon;
grant execute on function heimdesk_set(text, jsonb, bigint) to anon;`
