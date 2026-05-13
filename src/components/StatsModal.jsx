import { X, TrendingUp } from 'lucide-react'
import { STATUTS } from './StatusBadge'

const PLATFORM_COLORS = {
  'LinkedIn':              'bg-blue-600',
  'Indeed':               'bg-indigo-500',
  'Welcome to the Jungle':'bg-emerald-500',
  'APEC':                 'bg-orange-500',
  'HelloWork':            'bg-cyan-500',
  'JobTeaser':            'bg-violet-500',
  'Site entreprise':      'bg-slate-500',
  'Réseau / contact':     'bg-amber-500',
  'Spontanée':            'bg-pink-500',
}

function defaultColor(i) {
  const colors = ['bg-rose-400','bg-teal-400','bg-lime-500','bg-fuchsia-400','bg-sky-400']
  return colors[i % colors.length]
}

export default function StatsModal({ candidatures, onClose }) {
  const total = candidatures.length

  // Stats par plateforme
  const byPlatform = {}
  for (const c of candidatures) {
    const p = c.plateforme?.trim() || 'Non renseigné'
    byPlatform[p] = (byPlatform[p] ?? 0) + 1
  }
  const platformEntries = Object.entries(byPlatform).sort((a, b) => b[1] - a[1])

  // Stats par statut
  const byStatut = {}
  for (const c of candidatures) byStatut[c.statut] = (byStatut[c.statut] ?? 0) + 1

  // Taux de réponse (tout sauf "à envoyer")
  const contactes = candidatures.filter(c => c.statut !== 'a_envoyer').length
  const reponses  = candidatures.filter(c => !['a_envoyer','envoye'].includes(c.statut)).length
  const tauxReponse = contactes > 0 ? Math.round((reponses / contactes) * 100) : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-violet-600" />
            <h2 className="text-base font-semibold text-slate-900">État des lieux</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-6">

          {/* KPIs */}
          <div className="grid grid-cols-3 gap-3">
            <KPI label="Total" value={total} color="text-slate-900" />
            <KPI label="Contactés" value={contactes} color="text-blue-600" />
            <KPI label="Taux de retour" value={`${tauxReponse}%`} color="text-violet-600" />
          </div>

          {/* Par plateforme */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Par plateforme</p>
            {platformEntries.length === 0
              ? <p className="text-sm text-slate-400 italic">Aucune plateforme renseignée</p>
              : <div className="flex flex-col gap-2">
                  {platformEntries.map(([name, count], i) => (
                    <div key={name} className="flex items-center gap-3">
                      <span className="text-sm text-slate-700 w-40 truncate shrink-0">{name}</span>
                      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${PLATFORM_COLORS[name] ?? defaultColor(i)}`}
                          style={{ width: `${(count / total) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-500 w-6 text-right">{count}</span>
                    </div>
                  ))}
                </div>
            }
          </div>

          {/* Par statut */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Par statut</p>
            <div className="flex flex-col gap-2">
              {STATUTS.map(s => {
                const count = byStatut[s.id] ?? 0
                if (!count) return null
                return (
                  <div key={s.id} className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 w-40 shrink-0">
                      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                      <span className="text-sm text-slate-700">{s.label}</span>
                    </div>
                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${s.dot.replace('bg-','bg-')}`}
                        style={{ width: `${(count / total) * 100}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-slate-500 w-6 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function KPI({ label, value, color }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  )
}
