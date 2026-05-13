import { Star, Zap, User, Calendar } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { groupBestStatut, groupIsPriority } from '../utils/groupCandidatures'

function fmt(str) {
  if (!str) return null
  return new Date(str).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

export default function CompanyCard({ group, onOpen, onToggleGroupPriorite }) {
  const { entreprise, items } = group
  const isPrio = groupIsPriority(items)
  const bestStatut = groupBestStatut(items)
  const hasSpontanee = items.some(c => c.type === 'spontanée')
  const bestItem = items.find(c => c.statut === bestStatut) ?? items[0]

  function handleStar(e) {
    e.stopPropagation()
    onToggleGroupPriorite(items.map(c => c.id), !isPrio)
  }

  return (
    <div
      onClick={() => onOpen(group)}
      className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all p-4 flex flex-col gap-3 cursor-pointer group
        ${isPrio ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200 hover:border-violet-200'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {isPrio && <Star size={12} className="fill-amber-400 text-amber-400 shrink-0" />}
            <p className="font-bold text-slate-900 text-sm truncate">{entreprise}</p>
          </div>
          {items.length === 1 && items[0].poste && (
            <p className="text-xs text-slate-400 truncate mt-0.5">{items[0].poste}</p>
          )}
        </div>
        <button
          onClick={handleStar}
          className={`p-1.5 rounded-lg transition-colors shrink-0
            ${isPrio
              ? 'text-amber-400 hover:bg-amber-50'
              : 'text-slate-300 hover:text-amber-400 hover:bg-amber-50 opacity-0 group-hover:opacity-100'}`}
          title={isPrio ? 'Retirer la priorité' : 'Marquer comme prioritaire'}
        >
          <Star size={13} className={isPrio ? 'fill-amber-400' : ''} />
        </button>
      </div>

      {/* Badge spontanée */}
      {hasSpontanee && (
        <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 w-fit">
          <Zap size={10} className="fill-amber-500 text-amber-500" />
          Spontanée
        </span>
      )}

      {/* Contacts */}
      {items.length === 1 ? (
        <SingleContact item={items[0]} />
      ) : (
        <MultipleContacts items={items} />
      )}

      {/* Notes preview — seulement si 1 contact */}
      {items.length === 1 && items[0].notes && (
        <p className="text-xs text-slate-400 line-clamp-2 bg-slate-50 rounded-lg px-2.5 py-2 border border-slate-100">
          {items[0].notes}
        </p>
      )}

      {/* Footer */}
      <div className="pt-1 border-t border-slate-100">
        <StatusBadge statut={bestStatut} size="sm" />
      </div>
    </div>
  )
}

function SingleContact({ item }) {
  const { contact, dateCandidature, dateEntretien } = item
  return (
    <div className="flex flex-col gap-1.5">
      {contact?.nom && (
        <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
          <User size={11} className="shrink-0" />
          {contact.nom}
        </p>
      )}
      <div className="flex flex-wrap gap-2 text-xs text-slate-400">
        {dateCandidature && (
          <span className="flex items-center gap-1">
            <Calendar size={10} /> {fmt(dateCandidature)}
          </span>
        )}
        {dateEntretien && (
          <span className="flex items-center gap-1 text-violet-600 font-medium">
            <Calendar size={10} /> Entretien {fmt(dateEntretien)}
          </span>
        )}
      </div>
    </div>
  )
}

function MultipleContacts({ items }) {
  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item, i) => (
        <div key={item.id} className="flex items-center justify-between gap-2 py-1 border-t border-slate-50 first:border-t-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <User size={11} className="text-slate-300 shrink-0" />
            <span className="text-xs text-slate-600 truncate font-medium">
              {item.contact?.nom || <span className="text-slate-300 italic">Sans nom</span>}
            </span>
          </div>
          <StatusBadge statut={item.statut} size="sm" />
        </div>
      ))}
    </div>
  )
}
