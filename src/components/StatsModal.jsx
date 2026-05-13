import { useState } from 'react'
import { X, TrendingUp, Plus, Trash2, Lock, Unlock } from 'lucide-react'
import { STATUTS } from './StatusBadge'
import { usePlatformStats } from '../hooks/usePlatformStats'

// ── Onglet candidatures du kanban ──────────────────────────────────────────

function KanbanStats({ candidatures }) {
  const total = candidatures.length
  const contactes = candidatures.filter(c => c.statut !== 'a_envoyer').length
  const reponses  = candidatures.filter(c => !['a_envoyer', 'envoye'].includes(c.statut)).length
  const tauxReponse = contactes > 0 ? Math.round((reponses / contactes) * 100) : 0

  const byStatut = {}
  for (const c of candidatures) byStatut[c.statut] = (byStatut[c.statut] ?? 0) + 1

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-3">
        <KPI label="Total kanban" value={total} color="text-slate-900" />
        <KPI label="Contactés" value={contactes} color="text-blue-600" />
        <KPI label="Taux de retour" value={`${tauxReponse}%`} color="text-violet-600" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Par statut</p>
        <div className="flex flex-col gap-1.5">
          {STATUTS.map(s => {
            const count = byStatut[s.id] ?? 0
            if (!count) return null
            return (
              <div key={s.id} className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 w-32 shrink-0">
                  <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                  <span className="text-xs text-slate-600">{s.label}</span>
                </div>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.dot}`} style={{ width: `${(count / total) * 100}%` }} />
                </div>
                <span className="text-xs font-semibold text-slate-500 w-5 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Onglet plateformes externes ────────────────────────────────────────────

const numCls = 'w-full text-center border border-slate-200 rounded-lg px-1 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent'

function NumInput({ value, onChange, locked }) {
  function handleWheel(e) {
    if (locked) return
    e.preventDefault()
    const delta = e.deltaY < 0 ? 1 : -1
    onChange(Math.max(0, (Number(value) || 0) + delta))
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

function PlatformStats() {
  const { platforms, update, add, remove } = usePlatformStats()
  const [locked, setLocked] = useState(true)

  const totaux = platforms.reduce((acc, p) => ({
    total:       acc.total + (Number(p.total) || 0),
    refus:       acc.refus + (Number(p.refus) || 0),
    sansReponse: acc.sansReponse + (Number(p.sansReponse) || 0),
    entretiens:  acc.entretiens + (Number(p.entretiens) || 0),
  }), { total: 0, refus: 0, sansReponse: 0, entretiens: 0 })

  const tauxRetour = totaux.total > 0
    ? Math.round(((totaux.total - totaux.sansReponse) / totaux.total) * 100)
    : 0

  return (
    <div className="flex flex-col gap-4">
      {/* KPIs globaux */}
      <div className="grid grid-cols-4 gap-2">
        <KPI label="Total" value={totaux.total} color="text-slate-900" small />
        <KPI label="Refus" value={totaux.refus} color="text-red-600" small />
        <KPI label="Sans réponse" value={totaux.sansReponse} color="text-slate-400" small />
        <KPI label="Taux retour" value={`${tauxRetour}%`} color="text-violet-600" small />
      </div>

      {/* Tableau éditable */}
      <div>
        {/* En-têtes + cadenas */}
        <div className="flex items-center justify-between mb-1 px-0.5">
          <div className="grid grid-cols-[1fr_52px_52px_52px_52px_28px] gap-1.5 flex-1">
            {['Plateforme', 'Total', 'Refus', 'Sans rép.', 'Entretien', ''].map(h => (
              <span key={h} className="text-[10px] font-bold text-slate-400 uppercase tracking-wide text-center first:text-left">{h}</span>
            ))}
          </div>
          <button
            onClick={() => setLocked(l => !l)}
            title={locked ? 'Déverrouiller pour modifier' : 'Verrouiller'}
            className={`ml-2 p-1.5 rounded-lg border transition-colors shrink-0 ${
              locked
                ? 'border-slate-200 text-slate-400 hover:border-violet-300 hover:text-violet-600'
                : 'border-violet-300 bg-violet-50 text-violet-600'
            }`}
          >
            {locked ? <Lock size={13} /> : <Unlock size={13} />}
          </button>
        </div>

        {/* Lignes */}
        <div className="flex flex-col gap-1.5">
          {platforms.map(p => (
            <div key={p.id} className="grid grid-cols-[1fr_52px_52px_52px_52px_28px] gap-1.5 items-center">
              <input
                className={`border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent ${locked ? 'bg-slate-50 text-slate-400 cursor-default' : ''}`}
                value={p.nom}
                placeholder="Plateforme…"
                readOnly={locked}
                onChange={e => { if (!locked) update(p.id, 'nom', e.target.value) }}
              />
              {['total', 'refus', 'sansReponse', 'entretiens'].map(field => (
                <NumInput
                  key={field}
                  value={p[field]}
                  locked={locked}
                  onChange={val => update(p.id, field, val)}
                />
              ))}
              <button
                onClick={() => !locked && remove(p.id)}
                className={`flex items-center justify-center p-1.5 rounded-lg transition-colors ${locked ? 'text-slate-200 cursor-default' : 'hover:bg-red-50 text-slate-300 hover:text-red-500'}`}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        {!locked && (
          <button
            onClick={add}
            className="mt-3 flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-800 font-medium transition-colors"
          >
            <Plus size={13} /> Ajouter une plateforme
          </button>
        )}
      </div>
    </div>
  )
}

// ── Modal principal ────────────────────────────────────────────────────────

function GlobalStats({ candidatures, platforms }) {
  // Kanban
  const kTotal       = candidatures.length
  const kRefus       = candidatures.filter(c => c.statut === 'refus').length
  const kSansReponse = candidatures.filter(c => c.statut === 'envoye').length
  const kEntretiens  = candidatures.filter(c => c.statut === 'entretien').length
  const kAcceptes    = candidatures.filter(c => c.statut === 'accepte').length

  // Plateformes externes
  const pTotal       = platforms.reduce((s, p) => s + (Number(p.total)       || 0), 0)
  const pRefus       = platforms.reduce((s, p) => s + (Number(p.refus)       || 0), 0)
  const pSansReponse = platforms.reduce((s, p) => s + (Number(p.sansReponse) || 0), 0)
  const pEntretiens  = platforms.reduce((s, p) => s + (Number(p.entretiens)  || 0), 0)

  const total       = kTotal + pTotal
  const refus       = kRefus + pRefus
  const sansReponse = kSansReponse + pSansReponse
  const entretiens  = kEntretiens + pEntretiens
  const acceptes    = kAcceptes
  const tauxRetour  = total > 0 ? Math.round(((total - sansReponse) / total) * 100) : 0

  return (
    <div className="bg-gradient-to-br from-violet-600 to-violet-700 rounded-2xl p-4 text-white">
      <p className="text-xs font-bold uppercase tracking-widest text-violet-300 mb-3">Toutes sources confondues</p>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <GlobalKPI label="Candidatures" value={total} />
        <GlobalKPI label="Taux de retour" value={`${tauxRetour}%`} highlight />
        <GlobalKPI label="Entretiens" value={entretiens} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <GlobalKPI label="Refus" value={refus} sub />
        <GlobalKPI label="Sans réponse" value={sansReponse} sub />
        <GlobalKPI label="Acceptés" value={acceptes} sub />
      </div>
    </div>
  )
}

function GlobalKPI({ label, value, highlight, sub }) {
  return (
    <div className={`rounded-xl p-2 text-center ${sub ? 'bg-white/10' : 'bg-white/20'}`}>
      <p className={`font-bold leading-tight ${highlight ? 'text-2xl text-yellow-300' : sub ? 'text-lg' : 'text-2xl'}`}>{value}</p>
      <p className={`text-[10px] mt-0.5 leading-tight ${sub ? 'text-violet-300' : 'text-violet-200'}`}>{label}</p>
    </div>
  )
}

export default function StatsModal({ candidatures, onClose }) {
  const { platforms, update, add, remove } = usePlatformStats()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-violet-600" />
            <h2 className="text-base font-semibold text-slate-900">État des lieux</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-6">
          <GlobalStats candidatures={candidatures} platforms={platforms} />
          <div className="h-px bg-slate-100" />
          <Section title="Candidatures sur d'autres plateformes">
            <PlatformStats />
          </Section>
          <div className="h-px bg-slate-100" />
          <Section title="Suivi dans l'app (kanban)">
            <KanbanStats candidatures={candidatures} />
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {children}
    </div>
  )
}

function KPI({ label, value, color, small }) {
  return (
    <div className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
      <p className={`font-bold ${small ? 'text-xl' : 'text-2xl'} ${color}`}>{value}</p>
      <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{label}</p>
    </div>
  )
}
