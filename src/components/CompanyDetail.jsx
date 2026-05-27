import { useEffect, useState } from 'react'
import { X, Star, Pencil, Trash2, ExternalLink, Calendar, User, Phone, Mail, Zap, Building2, Copy, Check } from 'lucide-react'
import StatusBadge from './StatusBadge'
import { groupBestStatut, groupIsPriority } from '../utils/groupCandidatures'

function fmt(str) {
  if (!str) return null
  return new Date(str).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
}

function InfoRow({ icon: Icon, value, href }) {
  if (!value) return null
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon size={13} className="text-slate-400 shrink-0" />
      {href
        ? <a href={href} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline truncate">{value}</a>
        : <span className="text-slate-700 truncate">{value}</span>}
    </div>
  )
}

function buildPromptText(group) {
  const { entreprise, items } = group
  const isPrio = groupIsPriority(items)
  const lines = []

  lines.push(`Entreprise : ${entreprise}`)
  if (isPrio) lines.push('[ Try Hard ]')
  lines.push('')

  items.forEach((item, i) => {
    if (items.length > 1) lines.push(`--- Candidature #${i + 1} ---`)
    if (item.poste) lines.push(`Poste : ${item.poste}`)
    if (item.statut) lines.push(`Statut : ${item.statut}`)
    if (item.type && item.type !== 'classique') lines.push(`Type : ${item.type}`)
    if (item.plateforme) lines.push(`Plateforme : ${item.plateforme}`)
    if (item.dateCandidature) lines.push(`Date de candidature : ${fmt(item.dateCandidature)}`)
    if (item.dateRelance) lines.push(`Date de relance : ${fmt(item.dateRelance)}`)
    if (item.dateEntretien) lines.push(`Date d'entretien : ${fmt(item.dateEntretien)}`)
    if (item.contact?.nom || item.contact?.email || item.contact?.tel) {
      const parts = [item.contact.nom, item.contact.email, item.contact.tel].filter(Boolean)
      lines.push(`Contact : ${parts.join(' | ')}`)
    }
    if (item.lienOffre) lines.push(`Lien offre : ${item.lienOffre}`)
    if (item.notes) lines.push(`Notes :\n${item.notes}`)
    if (items.length > 1 && i < items.length - 1) lines.push('')
  })

  return lines.join('\n')
}

export default function CompanyDetail({ group, onEdit, onDelete, onToggleGroupPriorite, onClose }) {
  const { entreprise, items } = group
  const isPrio = groupIsPriority(items)
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(buildPromptText(group))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />

      <aside className="fixed right-0 top-0 bottom-0 z-40 w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in">

        {/* Header */}
        <div className={`px-6 pt-5 pb-4 border-b border-slate-100 ${isPrio ? 'bg-amber-50' : 'bg-white'}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isPrio ? 'bg-amber-400' : 'bg-violet-100'}`}>
                {isPrio
                  ? <Star size={18} className="fill-white text-white" />
                  : <Building2 size={18} className="text-violet-600" />}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 leading-tight">{entreprise}</h2>
                <p className="text-xs text-slate-400">{items.length} contact{items.length > 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleCopy}
                title="Copier pour un prompt IA"
                className={`p-1.5 rounded-lg transition-colors ${copied ? 'bg-green-50 text-green-600' : 'hover:bg-slate-100 text-slate-400'}`}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <StatusBadge statut={groupBestStatut(items)} size="md" />
            {isPrio && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 border border-amber-300 rounded-full px-2.5 py-1">
                <Star size={10} className="fill-amber-500" /> Try Hard
              </span>
            )}
          </div>

          <button
            onClick={() => onToggleGroupPriorite(items.map(c => c.id), !isPrio)}
            className={`mt-3 w-full flex items-center justify-center gap-2 text-xs font-medium py-1.5 rounded-lg border transition-colors
              ${isPrio
                ? 'border-amber-200 text-amber-700 hover:bg-amber-100'
                : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
          >
            <Star size={12} className={isPrio ? 'fill-amber-400 text-amber-400' : ''} />
            {isPrio ? 'Retirer la priorité' : 'Marquer comme try hard'}
          </button>
        </div>

        {/* Entries */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
          {items.map((item, i) => (
            <EntrySection
              key={item.id}
              item={item}
              index={items.length > 1 ? i + 1 : null}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </aside>
    </>
  )
}

function EntrySection({ item, index, onEdit, onDelete }) {
  const { statut, type, contact, dateCandidature, dateRelance, dateEntretien, lienOffre, notes } = item

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      {/* Entry header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          {index && <span className="text-xs font-bold text-slate-400">#{index}</span>}
          <StatusBadge statut={statut} size="sm" />
          {type === 'spontanée' && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
              <Zap size={9} className="fill-amber-500 text-amber-500" /> Spontanée
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg hover:bg-white text-slate-400 hover:text-slate-700 transition-colors">
            <Pencil size={13} />
          </button>
          <button onClick={() => onDelete(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Entry body */}
      <div className="px-4 py-3 flex flex-col gap-2.5">
        {/* Contact */}
        {(contact?.nom || contact?.email || contact?.tel) && (
          <div className="flex flex-col gap-1.5 pb-2.5 border-b border-slate-100">
            <InfoRow icon={User} value={contact.nom} />
            <InfoRow icon={Mail} value={contact.email} href={contact.email ? `mailto:${contact.email}` : null} />
            <InfoRow icon={Phone} value={contact.tel} href={contact.tel ? `tel:${contact.tel}` : null} />
          </div>
        )}

        {/* Dates */}
        {(dateCandidature || dateRelance || dateEntretien) && (
          <div className="flex flex-wrap gap-3 text-xs text-slate-500 pb-2.5 border-b border-slate-100">
            {dateCandidature && <span className="flex items-center gap-1"><Calendar size={11} /> {fmt(dateCandidature)}</span>}
            {dateRelance && <span className="flex items-center gap-1 text-amber-600"><Calendar size={11} /> Relance {fmt(dateRelance)}</span>}
            {dateEntretien && <span className="flex items-center gap-1 text-violet-600 font-medium"><Calendar size={11} /> Entretien {fmt(dateEntretien)}</span>}
          </div>
        )}

        {/* Lien */}
        {lienOffre && (
          <a href={lienOffre} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-violet-600 hover:underline truncate">
            <ExternalLink size={11} /> {lienOffre}
          </a>
        )}

        {/* Notes */}
        {notes && (
          <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed bg-slate-50 rounded-lg px-3 py-2">
            {notes}
          </p>
        )}
      </div>
    </div>
  )
}
