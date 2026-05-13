import { Calendar, ExternalLink, User, Pencil, Trash2, Zap, Star } from 'lucide-react'
import { STATUTS } from './StatusBadge'

function formatDate(str) {
  if (!str) return null
  return new Date(str).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

export default function CandidatureCard({ candidature, onEdit, onDelete, onChangeStatut, onTogglePriorite, onOpen }) {
  const { entreprise, poste, type, statut, priorite, dateCandidature, dateEntretien, contact, lienOffre, notes } = candidature

  return (
    <div
      onClick={onOpen}
      className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all p-4 flex flex-col gap-3 cursor-pointer group
        ${priorite ? 'border-amber-300 ring-1 ring-amber-200' : 'border-slate-200 hover:border-violet-200'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {priorite && <Star size={12} className="fill-amber-400 text-amber-400 shrink-0" />}
            <p className="font-semibold text-slate-900 text-sm truncate">{entreprise}</p>
          </div>
          {poste && <p className="text-xs text-slate-500 truncate mt-0.5">{poste}</p>}
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onTogglePriorite(candidature.id) }}
            className={`p-1.5 rounded-lg transition-colors ${priorite ? 'text-amber-400 hover:bg-amber-50' : 'text-slate-300 hover:text-amber-400 hover:bg-amber-50 opacity-0 group-hover:opacity-100'}`}
            title={priorite ? 'Retirer la priorité' : 'Marquer comme prioritaire'}
          >
            <Star size={13} className={priorite ? 'fill-amber-400' : ''} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onEdit(candidature) }}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors opacity-0 group-hover:opacity-100"
            title="Modifier"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(candidature.id) }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
            title="Supprimer"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Badges */}
      {type === 'spontanée' && (
        <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 w-fit">
          <Zap size={10} className="fill-amber-500 text-amber-500" />
          Spontanée
        </span>
      )}

      {/* Dates */}
      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
        {dateCandidature && (
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            Envoi : {formatDate(dateCandidature)}
          </span>
        )}
        {dateEntretien && (
          <span className="flex items-center gap-1 text-violet-600 font-medium">
            <Calendar size={11} />
            Entretien : {formatDate(dateEntretien)}
          </span>
        )}
      </div>

      {/* Contact */}
      {contact?.nom && (
        <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
          <User size={11} />
          {contact.nom}
        </p>
      )}

      {/* Notes */}
      {notes && (
        <p className="text-xs text-slate-500 line-clamp-2 bg-slate-50 rounded-lg px-2.5 py-2 border border-slate-100">
          {notes}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
        <select
          value={statut}
          onChange={e => { e.stopPropagation(); onChangeStatut(candidature.id, e.target.value) }}
          onClick={e => e.stopPropagation()}
          className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500"
        >
          {STATUTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        {lienOffre && (
          <a
            href={lienOffre}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-800 transition-colors"
          >
            Offre <ExternalLink size={11} />
          </a>
        )}
      </div>
    </div>
  )
}
