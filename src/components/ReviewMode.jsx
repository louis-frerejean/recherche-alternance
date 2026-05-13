import { useEffect, useState, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Star, ExternalLink, Zap } from 'lucide-react'
import { STATUTS } from './StatusBadge'

const inputCls = 'w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition placeholder:text-slate-300'
const labelCls = 'text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1 block'

function Field({ label, children }) {
  return (
    <div className="flex flex-col">
      <span className={labelCls}>{label}</span>
      {children}
    </div>
  )
}

export default function ReviewMode({ candidatures, startIndex = 0, onUpdate, onTogglePriorite, onClose }) {
  const [idx, setIdx] = useState(() => Math.min(startIndex, candidatures.length - 1))
  const [form, setForm] = useState(null)

  const current = candidatures[idx]

  // Sync form when navigating
  useEffect(() => {
    if (!current) return
    setForm({
      entreprise: current.entreprise ?? '',
      poste: current.poste ?? '',
      type: current.type ?? 'classique',
      statut: current.statut ?? 'a_envoyer',
      dateCandidature: current.dateCandidature ?? '',
      dateRelance: current.dateRelance ?? '',
      dateEntretien: current.dateEntretien ?? '',
      contact: { nom: current.contact?.nom ?? '', email: current.contact?.email ?? '', tel: current.contact?.tel ?? '' },
      lienOffre: current.lienOffre ?? '',
      notes: current.notes ?? '',
    })
  }, [idx, current?.id])

  const saveField = useCallback((field, value) => {
    if (!current) return
    if (field === 'contact') {
      onUpdate(current.id, { contact: value })
    } else {
      onUpdate(current.id, { [field]: value })
    }
  }, [current, onUpdate])

  function setField(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function setContactField(subField, value) {
    setForm(f => ({ ...f, contact: { ...f.contact, [subField]: value } }))
  }

  const goNext = useCallback(() => {
    if (idx < candidatures.length - 1) setIdx(i => i + 1)
  }, [idx, candidatures.length])

  const goPrev = useCallback(() => {
    if (idx > 0) setIdx(i => i - 1)
  }, [idx])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'SELECT') goNext()
      if (e.key === 'ArrowLeft' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'SELECT') goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goNext, goPrev, onClose])

  if (!current || !form) return null

  const isPriorite = current.priorite ?? false
  const progress = ((idx + 1) / candidatures.length) * 100

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col overflow-hidden">

      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
            <X size={18} />
          </button>
          <div className="h-4 w-px bg-slate-200" />
          <span className="text-sm font-medium text-slate-500">
            Mode Review — <span className="text-slate-900">{idx + 1}</span> / {candidatures.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex-1 max-w-xs h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={goPrev}
            disabled={idx === 0}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <ChevronLeft size={16} /> Préc.
          </button>
          <button
            onClick={goNext}
            disabled={idx === candidatures.length - 1}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            Suiv. <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-8">

          {/* Hero : entreprise + priorité */}
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <input
                className="w-full text-3xl font-bold text-slate-900 bg-transparent border-b-2 border-transparent hover:border-slate-200 focus:border-violet-400 focus:outline-none pb-1 transition-colors placeholder:text-slate-300"
                value={form.entreprise}
                onChange={e => setField('entreprise', e.target.value)}
                onBlur={e => saveField('entreprise', e.target.value)}
                placeholder="Nom de l'entreprise"
              />
              <input
                className="w-full text-base text-slate-500 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-violet-400 focus:outline-none mt-1 pb-1 transition-colors placeholder:text-slate-300"
                value={form.poste}
                onChange={e => setField('poste', e.target.value)}
                onBlur={e => saveField('poste', e.target.value)}
                placeholder="Intitulé du poste (optionnel)"
              />
            </div>
            <button
              onClick={() => onTogglePriorite(current.id)}
              className={`p-3 rounded-2xl border-2 transition-all ${isPriorite
                ? 'bg-amber-50 border-amber-300 text-amber-500'
                : 'bg-white border-slate-200 text-slate-300 hover:border-amber-300 hover:text-amber-400'
              }`}
              title={isPriorite ? 'Retirer la priorité' : 'Marquer comme try hard'}
            >
              <Star size={22} className={isPriorite ? 'fill-amber-400' : ''} />
            </button>
          </div>

          {isPriorite && (
            <div className="flex items-center gap-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
              <Star size={15} className="fill-amber-400 text-amber-400 shrink-0" />
              Candidature prioritaire — tu veux try hard celle-là
            </div>
          )}

          {/* Statut + Type */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Statut">
              <select
                className={inputCls}
                value={form.statut}
                onChange={e => { setField('statut', e.target.value); saveField('statut', e.target.value) }}
              >
                {STATUTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="Type">
              <select
                className={inputCls}
                value={form.type}
                onChange={e => { setField('type', e.target.value); saveField('type', e.target.value) }}
              >
                <option value="classique">Candidature classique</option>
                <option value="spontanée">Candidature spontanée</option>
              </select>
            </Field>
          </div>

          {/* Chronologie */}
          <div>
            <span className={labelCls}>Chronologie</span>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Date d'envoi">
                <input type="date" className={inputCls} value={form.dateCandidature}
                  onChange={e => setField('dateCandidature', e.target.value)}
                  onBlur={e => saveField('dateCandidature', e.target.value)} />
              </Field>
              <Field label="Date de relance">
                <input type="date" className={inputCls} value={form.dateRelance}
                  onChange={e => setField('dateRelance', e.target.value)}
                  onBlur={e => saveField('dateRelance', e.target.value)} />
              </Field>
              <Field label="Date d'entretien">
                <input type="date" className={inputCls} value={form.dateEntretien}
                  onChange={e => setField('dateEntretien', e.target.value)}
                  onBlur={e => saveField('dateEntretien', e.target.value)} />
              </Field>
            </div>
          </div>

          {/* Contact */}
          <div>
            <span className={labelCls}>Contact</span>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Nom">
                <input className={inputCls} value={form.contact.nom} placeholder="Nom"
                  onChange={e => setContactField('nom', e.target.value)}
                  onBlur={() => saveField('contact', form.contact)} />
              </Field>
              <Field label="Email">
                <input type="email" className={inputCls} value={form.contact.email} placeholder="email@…"
                  onChange={e => setContactField('email', e.target.value)}
                  onBlur={() => saveField('contact', form.contact)} />
              </Field>
              <Field label="Téléphone">
                <input className={inputCls} value={form.contact.tel} placeholder="06…"
                  onChange={e => setContactField('tel', e.target.value)}
                  onBlur={() => saveField('contact', form.contact)} />
              </Field>
            </div>
          </div>

          {/* Lien offre */}
          <Field label="Lien de l'offre">
            <div className="flex gap-2">
              <input className={inputCls} value={form.lienOffre} placeholder="https://…"
                onChange={e => setField('lienOffre', e.target.value)}
                onBlur={e => saveField('lienOffre', e.target.value)} />
              {form.lienOffre && (
                <a href={form.lienOffre} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-2 text-sm text-violet-600 border border-violet-200 bg-violet-50 rounded-xl hover:bg-violet-100 transition-colors shrink-0">
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </Field>

          {/* Notes */}
          <Field label="Notes & contexte">
            <textarea
              className={`${inputCls} resize-none leading-relaxed`}
              rows={6}
              value={form.notes}
              placeholder="Infos utiles, retours, impressions, prochaine action…"
              onChange={e => setField('notes', e.target.value)}
              onBlur={e => saveField('notes', e.target.value)}
            />
          </Field>

        </div>
      </div>

      {/* Bottom nav (mobile friendly) */}
      <div className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
        <button
          onClick={goPrev}
          disabled={idx === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl transition-colors"
        >
          <ChevronLeft size={16} /> Précédent
        </button>
        <span className="text-xs text-slate-400 tabular-nums">← → pour naviguer · Échap pour quitter</span>
        <button
          onClick={goNext}
          disabled={idx === candidatures.length - 1}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white disabled:opacity-30 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm"
        >
          Suivant <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
