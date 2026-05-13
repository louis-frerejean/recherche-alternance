import { Star, Send, RefreshCw, MessageSquare, Archive } from 'lucide-react'
import CompanyCard from './CompanyCard'
import { groupByCompany, groupBestStatut, groupIsPriority } from '../utils/groupCandidatures'

const COLUMNS = [
  {
    id: 'priority',
    label: 'Try Hard',
    sub: 'Prioritaires',
    Icon: Star,
    header: 'bg-gradient-to-r from-amber-400 to-yellow-400',
    body: 'bg-gradient-to-b from-amber-50 to-yellow-50',
    border: 'border-amber-300',
    count: 'bg-amber-600/20 text-amber-900',
    empty: 'text-amber-300',
    filter: g => groupIsPriority(g.items),
  },
  {
    id: 'a_envoyer',
    label: 'À envoyer',
    sub: 'Pas encore envoyé',
    Icon: Send,
    header: 'bg-slate-500',
    body: 'bg-slate-50',
    border: 'border-slate-200',
    count: 'bg-white/20 text-white',
    empty: 'text-slate-300',
    filter: g => !groupIsPriority(g.items) && groupBestStatut(g.items) === 'a_envoyer',
  },
  {
    id: 'en_cours',
    label: 'En cours',
    sub: 'Envoyé · Relancé',
    Icon: RefreshCw,
    header: 'bg-gradient-to-r from-blue-500 to-sky-500',
    body: 'bg-blue-50',
    border: 'border-blue-200',
    count: 'bg-white/20 text-white',
    empty: 'text-blue-200',
    filter: g => !groupIsPriority(g.items) && ['envoye', 'relance'].includes(groupBestStatut(g.items)),
  },
  {
    id: 'entretien',
    label: 'Entretien',
    sub: 'En discussion',
    Icon: MessageSquare,
    header: 'bg-gradient-to-r from-violet-500 to-purple-500',
    body: 'bg-violet-50',
    border: 'border-violet-200',
    count: 'bg-white/20 text-white',
    empty: 'text-violet-200',
    filter: g => !groupIsPriority(g.items) && groupBestStatut(g.items) === 'entretien',
  },
  {
    id: 'cloture',
    label: 'Clôturé',
    sub: 'Refus · Accepté',
    Icon: Archive,
    header: 'bg-slate-700',
    body: 'bg-slate-100',
    border: 'border-slate-300',
    count: 'bg-white/10 text-white',
    empty: 'text-slate-400',
    filter: g => !groupIsPriority(g.items) && ['refus', 'accepte'].includes(groupBestStatut(g.items)),
  },
]

export default function KanbanBoard({ candidatures, onOpenGroup, onToggleGroupPriorite }) {
  const groups = groupByCompany(candidatures)

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 px-6 pt-4 min-h-0 flex-1">
      {COLUMNS.map(col => {
        const colGroups = groups.filter(col.filter)
        return (
          <KanbanColumn
            key={col.id}
            col={col}
            groups={colGroups}
            isClosed={col.id === 'cloture'}
            onOpenGroup={onOpenGroup}
            onToggleGroupPriorite={onToggleGroupPriorite}
          />
        )
      })}
    </div>
  )
}

function KanbanColumn({ col, groups, isClosed, onOpenGroup, onToggleGroupPriorite }) {
  const { Icon } = col
  return (
    <div className={`flex-shrink-0 w-72 flex flex-col rounded-2xl border-2 ${col.border} ${col.body} overflow-hidden shadow-sm`}>
      <div className={`${col.header} px-4 py-3 flex items-center justify-between shrink-0`}>
        <div className="flex items-center gap-2.5">
          <Icon size={15} className={col.id === 'priority' ? 'fill-white text-white' : 'text-white/90'} />
          <div>
            <p className="text-sm font-bold text-white leading-tight">{col.label}</p>
            <p className="text-[10px] text-white/60 leading-tight">{col.sub}</p>
          </div>
        </div>
        <span className={`text-xs font-bold rounded-full px-2.5 py-0.5 ${col.count}`}>
          {groups.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {groups.length === 0 && (
          <div className="flex flex-col items-center gap-1.5 py-8 text-center">
            <Icon size={18} className={col.empty} />
            <p className={`text-xs ${col.empty}`}>
              {col.id === 'priority' ? 'Clique sur ⭐ sur une carte' : 'Aucune candidature'}
            </p>
          </div>
        )}
        {groups.map(group => (
          <div key={group.key} className={isClosed ? 'opacity-60 hover:opacity-100 transition-opacity' : ''}>
            <CompanyCard
              group={group}
              onOpen={onOpenGroup}
              onToggleGroupPriorite={onToggleGroupPriorite}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
