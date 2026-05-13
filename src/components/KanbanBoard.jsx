import { STATUTS, getStatut } from './StatusBadge'
import CandidatureCard from './CandidatureCard'

export default function KanbanBoard({ candidatures, onEdit, onDelete, onChangeStatut, onTogglePriorite, onOpen }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-6 px-6 pt-4 min-h-0 flex-1">
      {STATUTS.map(statut => {
        const cards = candidatures.filter(c => c.statut === statut.id)
        return (
          <KanbanColumn
            key={statut.id}
            statut={statut}
            cards={cards}
            onEdit={onEdit}
            onDelete={onDelete}
            onChangeStatut={onChangeStatut}
            onTogglePriorite={onTogglePriorite}
            onOpen={onOpen}
          />
        )
      })}
    </div>
  )
}

function KanbanColumn({ statut, cards, onEdit, onDelete, onChangeStatut, onTogglePriorite, onOpen }) {
  return (
    <div className={`flex-shrink-0 w-72 flex flex-col rounded-2xl border ${statut.column} overflow-hidden`}>
      <div className="px-4 py-3 border-b border-inherit flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statut.dot}`} />
          <span className="text-sm font-semibold text-slate-700">{statut.label}</span>
        </div>
        <span className="text-xs font-medium text-slate-400 bg-white/70 rounded-full px-2 py-0.5 border border-slate-200">
          {cards.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {cards.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-6">Aucune candidature</p>
        )}
        {cards.map(c => (
          <CandidatureCard
            key={c.id}
            candidature={c}
            onEdit={onEdit}
            onDelete={onDelete}
            onChangeStatut={onChangeStatut}
            onTogglePriorite={onTogglePriorite}
            onOpen={() => onOpen(c)}
          />
        ))}
      </div>
    </div>
  )
}
