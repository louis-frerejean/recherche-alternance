export const STATUTS = [
  { id: 'a_envoyer', label: 'À envoyer', color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400', column: 'bg-slate-50 border-slate-200' },
  { id: 'envoye',    label: 'Envoyé',    color: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500',  column: 'bg-blue-50 border-blue-200' },
  { id: 'relance',   label: 'Relancé',   color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', column: 'bg-amber-50 border-amber-200' },
  { id: 'entretien', label: 'Entretien', color: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500', column: 'bg-violet-50 border-violet-200' },
  { id: 'refus',     label: 'Refus',     color: 'bg-red-100 text-red-700',     dot: 'bg-red-500',   column: 'bg-red-50 border-red-200' },
  { id: 'accepte',   label: 'Accepté',   color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', column: 'bg-emerald-50 border-emerald-200' },
]

export function getStatut(id) {
  return STATUTS.find(s => s.id === id) ?? STATUTS[0]
}

export default function StatusBadge({ statut, size = 'sm' }) {
  const s = getStatut(statut)
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${s.color} ${padding}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  )
}
