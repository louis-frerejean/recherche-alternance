import { useEffect } from 'react'
import {
  X, Pencil, Trash2, ExternalLink, Calendar, User, Phone, Mail,
  Zap, FileText, ArrowRight, Building2
} from 'lucide-react'
import StatusBadge, { STATUTS, getStatut } from './StatusBadge'

function formatDate(str) {
  if (!str) return null
  const d = new Date(str)
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function Section({ title, children }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{title}</p>
      {children}
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, href }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2.5 text-sm">
      <Icon size={15} className="text-slate-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        {label && <span className="text-slate-400 text-xs">{label} · </span>}
        {href
          ? <a href={href} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline break-all">{value}</a>
          : <span className="text-slate-700 break-words">{value}</span>
        }
      </div>
    </div>
  )
}

export default function CandidatureDetail({ candidature, onEdit, onDelete, onChangeStatut, onClose }) {
  const { entreprise, poste, type, statut, dateCandidature, dateRelance, dateEntretien, contact, lienOffre, notes } = candidature

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const hasContact = contact?.nom || contact?.email || contact?.tel
  const hasDates = dateCandidature || dateRelance || dateEntretien

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed right-0 top-0 bottom-0 z-40 w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                <Building2 size={20} className="text-violet-600" />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-900 leading-tight truncate">{entreprise}</h2>
                {poste && <p className="text-sm text-slate-500 truncate">{poste}</p>}
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors shrink-0">
              <X size={18} />
            </button>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge statut={statut} size="md" />
            {type === 'spontanée' && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-1">
                <Zap size={11} className="fill-amber-500 text-amber-500" />
                Candidature spontanée
              </span>
            )}
          </div>

          {/* Changer statut */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 shrink-0">Changer statut :</span>
            <select
              value={statut}
              onChange={e => onChangeStatut(candidature.id, e.target.value)}
              className="flex-1 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {STATUTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">

          {/* Dates */}
          {hasDates && (
            <Section title="Chronologie">
              <div className="flex flex-col gap-2 pl-1 border-l-2 border-slate-100 ml-1">
                {dateCandidature && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 -ml-[5px] shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">Candidature envoyée</p>
                      <p className="text-sm font-medium text-slate-700 capitalize">{formatDate(dateCandidature)}</p>
                    </div>
                  </div>
                )}
                {dateRelance && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 -ml-[5px] shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">Relance</p>
                      <p className="text-sm font-medium text-slate-700 capitalize">{formatDate(dateRelance)}</p>
                    </div>
                  </div>
                )}
                {dateEntretien && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-violet-500 mt-1.5 -ml-[5px] shrink-0" />
                    <div>
                      <p className="text-xs text-slate-400">Entretien</p>
                      <p className="text-sm font-medium text-violet-700 capitalize">{formatDate(dateEntretien)}</p>
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Contact */}
          {hasContact && (
            <Section title="Contact">
              <div className="bg-slate-50 rounded-xl px-4 py-3 flex flex-col gap-2.5 border border-slate-100">
                <InfoRow icon={User} value={contact.nom} />
                <InfoRow icon={Mail} value={contact.email} href={contact.email ? `mailto:${contact.email}` : null} />
                <InfoRow icon={Phone} value={contact.tel} href={contact.tel ? `tel:${contact.tel}` : null} />
              </div>
            </Section>
          )}

          {/* Lien offre */}
          {lienOffre && (
            <Section title="Offre">
              <a
                href={lienOffre}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-800 bg-violet-50 hover:bg-violet-100 rounded-xl px-4 py-3 border border-violet-100 transition-colors"
              >
                <ExternalLink size={15} />
                <span className="truncate">{lienOffre}</span>
              </a>
            </Section>
          )}

          {/* Notes */}
          {notes && (
            <Section title="Notes & contexte">
              <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{notes}</p>
              </div>
            </Section>
          )}

          {!hasDates && !hasContact && !lienOffre && !notes && (
            <p className="text-sm text-slate-400 text-center py-8">Aucun détail renseigné.</p>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => onDelete(candidature.id)}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
          >
            <Trash2 size={15} />
            Supprimer
          </button>
          <button
            onClick={() => onEdit(candidature)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-colors"
          >
            <Pencil size={14} />
            Modifier
          </button>
        </div>
      </aside>
    </>
  )
}
