import { useState } from 'react'
import { Lock, Unlock, Plus, Trash2 } from 'lucide-react'
import { STATUTS } from './StatusBadge'

// ── Helpers ────────────────────────────────────────────────────────────────

function buildAutoStats(candidatures) {
  const map = {}
  for (const c of candidatures) {
    const key = c.plateforme?.trim()
    if (!key) continue
    if (!map[key]) map[key] = { nom: key, total: 0, refus: 0, sansReponse: 0, entretiens: 0 }
    map[key].total++
    if (c.statut === 'refus')                             map[key].refus++
    if (c.statut === 'envoye')                            map[key].sansReponse++
    if (['entretien', 'relance'].includes(c.statut))      map[key].entretiens++
  }
  return Object.values(map)
}

// ── Composants UI ──────────────────────────────────────────────────────────

function KpiCard({ label, value, accent = 'text-slate-900', bg = 'bg-slate-50' }) {
  return (
    <div className={`${bg} rounded-2xl p-4 text-center border border-white/60`}>
      <p className={`text-3xl font-extrabold leading-tight ${accent}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
    </div>
  )
}

const numCls = 'w-full text-center border border-slate-200 rounded-lg px-1 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent'

function NumInput({ value, onChange, locked }) {
  function handleWheel(e) {
    if (locked) return
    e.preventDefault()
    onChange(Math.max(0, (Number(value) || 0) + (e.deltaY < 0 ? 1 : -1)))
  }
  return (
    <input
      type="number" min="0"
      className={`${numCls} ${locked ? 'bg-slate-50 text-slate-400 cursor-default' : ''}`}
      value={value || ''}
      placeholder="0"
      readOnly={locked}
      onChange={e => { if (!locked) onChange(Number(e.target.value) || 0) }}
      onWheel={handleWheel}
    />
  )
}

// ── Section : Global toutes sources ───────────────────────────────────────

function GlobalSection({ candidatures, platforms }) {
  const kTotal      = candidatures.length
  const kRefus      = candidatures.filter(c => c.statut === 'refus').length
  const kSansRep    = candidatures.filter(c => c.statut === 'envoye').length
  const kEntretiens = candidatures.filter(c => c.statut === 'entretien').length
  const kAcceptes   = candidatures.filter(c => c.statut === 'accepte').length

  const pTotal      = platforms.reduce((s, p) => s + (p.total       || 0), 0)
  const pRefus      = platforms.reduce((s, p) => s + (p.refus       || 0), 0)
  const pSansRep    = platforms.reduce((s, p) => s + (p.sansReponse || 0), 0)
  const pEntretiens = platforms.reduce((s, p) => s + (p.entretiens  || 0), 0)

  const total      = kTotal + pTotal
  const refus      = kRefus + pRefus
  const sansRep    = kSansRep + pSansRep
  const entretiens = kEntretiens + pEntretiens
  const acceptes   = kAcceptes
  const tauxRetour = total > 0 ? Math.round(((total - sansRep) / total) * 100) : 0

  return (
    <div className="bg-gradient-to-br from-violet-600 to-violet-700 rounded-2xl p-5 text-white">
      <p className="text-xs font-bold uppercase tracking-widest text-violet-300 mb-4">Toutes sources confondues</p>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Candidatures', value: total, big: true },
          { label: 'Taux de retour', value: `${tauxRetour}%`, accent: 'text-yellow-300', big: true },
          { label: 'Entretiens', value: entretiens },
          { label: 'Refus', value: refus },
          { label: 'Acceptés', value: acceptes },
        ].map(({ label, value, accent, big }) => (
          <div key={label} className="bg-white/15 rounded-xl p-3 text-center">
            <p className={`font-extrabold leading-tight ${big ? 'text-2xl' : 'text-xl'} ${accent ?? 'text-white'}`}>{value}</p>
            <p className="text-[10px] text-violet-200 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Section : Plateformes ─────────────────────────────────────────────────

function PlatformsSection({ candidatures, platforms, onUpdate, onUpdateNom, onAdd, onRemove }) {
  const [locked, setLocked] = useState(true)
  const autoStats = buildAutoStats(candidatures)

  // Plateformes auto (depuis candidatures avec plateforme renseignée)
  // Plateformes manuelles = celles dans `platforms` (table Supabase)

  const totaux = platforms.reduce((acc, p) => ({
    total:       acc.total       + (p.total       || 0),
    refus:       acc.refus       + (p.refus       || 0),
    sansReponse: acc.sansReponse + (p.sansReponse || 0),
    entretiens:  acc.entretiens  + (p.entretiens  || 0),
  }), { total: 0, refus: 0, sansReponse: 0, entretiens: 0 })

  return (
    <div className="flex flex-col gap-4">

      {/* Auto (depuis candidatures) */}
      {autoStats.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            Depuis tes candidatures dans l'app
          </p>
          <TableHeader locked={false} showLock={false} />
          {autoStats.map(p => (
            <TableRow key={p.nom} nom={p.nom} values={p} locked readOnly />
          ))}
        </div>
      )}

      {/* Manuel (Supabase) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Autres plateformes (saisie manuelle)
          </p>
          <button
            onClick={() => setLocked(l => !l)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-colors ${
              locked
                ? 'border-slate-200 text-slate-400 hover:border-violet-300 hover:text-violet-600'
                : 'border-violet-300 bg-violet-50 text-violet-600'
            }`}
          >
            {locked ? <Lock size={11} /> : <Unlock size={11} />}
            {locked ? 'Déverrouiller' : 'Verrouiller'}
          </button>
        </div>

        <TableHeader locked={locked} />
        <div className="flex flex-col gap-1.5">
          {platforms.map(p => (
            <div key={p.id} className="grid grid-cols-[1fr_56px_56px_56px_56px_28px] gap-1.5 items-center">
              <input
                className={`border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 ${locked ? 'bg-slate-50 text-slate-400' : ''}`}
                value={p.nom} placeholder="Plateforme…" readOnly={locked}
                onChange={e => { if (!locked) onUpdateNom(p.id, e.target.value) }}
              />
              {['total', 'refus', 'sansReponse', 'entretiens'].map(field => (
                <NumInput key={field} value={p[field]} locked={locked}
                  onChange={val => onUpdate(p.id, field, val)} />
              ))}
              <button
                onClick={() => !locked && onRemove(p.id)}
                className={`flex items-center justify-center p-1.5 rounded-lg transition-colors ${locked ? 'text-slate-200 cursor-default' : 'text-slate-300 hover:bg-red-50 hover:text-red-500'}`}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
        {!locked && (
          <button onClick={onAdd} className="mt-3 flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-800 font-medium">
            <Plus size={12} /> Ajouter une plateforme
          </button>
        )}
      </div>
    </div>
  )
}

function TableHeader({ locked, showLock = true }) {
  const cols = ['Plateforme', 'Total', 'Refus', 'Sans rép.', 'Entretiens', '']
  return (
    <div className="grid grid-cols-[1fr_56px_56px_56px_56px_28px] gap-1.5 mb-1.5 px-0.5">
      {cols.map(h => (
        <span key={h} className="text-[10px] font-bold text-slate-400 uppercase tracking-wide text-center first:text-left">{h}</span>
      ))}
    </div>
  )
}

function TableRow({ nom, values, readOnly }) {
  const numReadCls = `${numCls} bg-slate-50 text-slate-500 cursor-default`
  return (
    <div className="grid grid-cols-[1fr_56px_56px_56px_56px_28px] gap-1.5 items-center mb-1.5">
      <span className="border border-slate-100 bg-slate-50 rounded-lg px-2.5 py-1.5 text-sm text-slate-600 truncate">{nom}</span>
      {['total', 'refus', 'sansReponse', 'entretiens'].map(f => (
        <input key={f} readOnly className={numReadCls} value={values[f] || 0} onChange={() => {}} />
      ))}
      <span />
    </div>
  )
}

// ── Section : Kanban par statut ───────────────────────────────────────────

function KanbanSection({ candidatures }) {
  const total = candidatures.length
  const byStatut = {}
  for (const c of candidatures) byStatut[c.statut] = (byStatut[c.statut] ?? 0) + 1

  return (
    <div className="flex flex-col gap-2">
      {STATUTS.map(s => {
        const count = byStatut[s.id] ?? 0
        if (!count) return null
        return (
          <div key={s.id} className="flex items-center gap-3">
            <div className="flex items-center gap-2 w-32 shrink-0">
              <span className={`w-2 h-2 rounded-full ${s.dot}`} />
              <span className="text-sm text-slate-700">{s.label}</span>
            </div>
            <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${s.dot}`} style={{ width: `${(count / total) * 100}%` }} />
            </div>
            <span className="text-sm font-semibold text-slate-500 w-6 text-right tabular-nums">{count}</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Vue principale ─────────────────────────────────────────────────────────

export default function StatsView({ candidatures, platforms, onUpdate, onUpdateNom, onAdd, onRemove }) {
  const kTotal      = candidatures.length
  const kEntretiens = candidatures.filter(c => c.statut === 'entretien').length
  const kAcceptes   = candidatures.filter(c => c.statut === 'accepte').length
  const kRelance    = candidatures.filter(c => c.statut === 'relance').length

  return (
    <div className="flex-1 overflow-hidden bg-slate-50 flex flex-col">
      <div className="flex-1 overflow-auto px-6 py-6">
        <div className="max-w-screen-xl mx-auto flex flex-col gap-5 h-full">

          {/* Bannière globale — pleine largeur */}
          <GlobalSection candidatures={candidatures} platforms={platforms} />

          {/* 2 colonnes */}
          <div className="grid grid-cols-2 gap-5 flex-1 min-h-0">

            {/* Colonne gauche : kanban stats */}
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-3">
                <KpiCard label="Candidatures" value={kTotal} />
                <KpiCard label="Entretiens"   value={kEntretiens} accent="text-violet-600" bg="bg-violet-50" />
                <KpiCard label="Relancé"      value={kRelance}    accent="text-amber-600"  bg="bg-amber-50" />
                <KpiCard label="Acceptés"     value={kAcceptes}   accent="text-emerald-600" bg="bg-emerald-50" />
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 flex-1">
                <SectionTitle>Répartition par statut</SectionTitle>
                <KanbanSection candidatures={candidatures} />
              </div>
            </div>

            {/* Colonne droite : plateformes */}
            <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 overflow-auto">
              <SectionTitle>Par plateforme</SectionTitle>
              <PlatformsSection
                candidatures={candidatures}
                platforms={platforms}
                onUpdate={onUpdate}
                onUpdateNom={onUpdateNom}
                onAdd={onAdd}
                onRemove={onRemove}
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ children }) {
  return <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">{children}</h2>
}
