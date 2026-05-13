import { useEffect, useState, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Star, ExternalLink } from 'lucide-react'
import { STATUTS } from './StatusBadge'

const STATUS_THEME = {
  a_envoyer: { bg: 'from-slate-100 to-slate-50',  accent: 'bg-slate-500',   text: 'text-slate-600',  ring: 'ring-slate-300' },
  envoye:    { bg: 'from-blue-100 to-blue-50',    accent: 'bg-blue-500',    text: 'text-blue-700',   ring: 'ring-blue-300' },
  relance:   { bg: 'from-amber-100 to-amber-50',  accent: 'bg-amber-500',   text: 'text-amber-700',  ring: 'ring-amber-300' },
  entretien: { bg: 'from-violet-100 to-violet-50',accent: 'bg-violet-500',  text: 'text-violet-700', ring: 'ring-violet-300' },
  refus:     { bg: 'from-red-100 to-red-50',      accent: 'bg-red-500',     text: 'text-red-700',    ring: 'ring-red-300' },
  accepte:   { bg: 'from-emerald-100 to-emerald-50', accent: 'bg-emerald-500', text: 'text-emerald-700', ring: 'ring-emerald-300' },
}

const inputCls = 'w-full bg-white/70 border border-white/60 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-white/80 focus:bg-white transition placeholder:text-slate-300 shadow-sm'
const labelCls = 'text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block'

export default function ReviewMode({ candidatures, startIndex = 0, onUpdate, onTogglePriorite, onClose }) {
  const [idx, setIdx] = useState(() => Math.min(startIndex, candidatures.length - 1))
  const [form, setForm] = useState(null)

  const current = candidatures[idx]
  const theme = STATUS_THEME[current?.statut] ?? STATUS_THEME.a_envoyer

  useEffect(() => {
    if (!current) return
    setForm({
      entreprise:      current.entreprise      ?? '',
      poste:           current.poste           ?? '',
      type:            current.type            ?? 'classique',
      statut:          current.statut          ?? 'a_envoyer',
      dateCandidature: current.dateCandidature ?? '',
      dateRelance:     current.dateRelance     ?? '',
      dateEntretien:   current.dateEntretien   ?? '',
      contact: {
        nom:   current.contact?.nom   ?? '',
        email: current.contact?.email ?? '',
        tel:   current.contact?.tel   ?? '',
      },
      lienOffre: current.lienOffre ?? '',
      notes:     current.notes     ?? '',
    })
  }, [idx, current?.id])

  const save = useCallback((field, value) => {
    if (!current) return
    onUpdate(current.id, field === 'contact' ? { contact: value } : { [field]: value })
  }, [current, onUpdate])

  function set(field, value) { setForm(f => ({ ...f, [field]: value })) }
  function setContact(sub, value) { setForm(f => ({ ...f, contact: { ...f.contact, [sub]: value } })) }

  const goNext = useCallback(() => { if (idx < candidatures.length - 1) setIdx(i => i + 1) }, [idx, candidatures.length])
  const goPrev = useCallback(() => { if (idx > 0) setIdx(i => i - 1) }, [idx])

  useEffect(() => {
    function onKey(e) {
      const tag = e.target.tagName
      if (e.key === 'Escape') { onClose(); return }
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goNext, goPrev, onClose])

  if (!current || !form) return null

  const isPrio = current.priorite ?? false
  const heroBg = isPrio ? 'from-amber-200 via-yellow-100 to-amber-50' : theme.bg

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-100 overflow-hidden">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-white/80 backdrop-blur border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={17} />
          </button>
          <span className="text-sm font-semibold text-slate-500">
            Mode Review &nbsp;
            <span className="text-slate-900 tabular-nums">{idx + 1}</span>
            <span className="text-slate-400"> / {candidatures.length}</span>
          </span>
        </div>

        {/* Progress */}
        <div className="flex-1 mx-6 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${isPrio ? 'bg-amber-400' : theme.accent}`}
            style={{ width: `${((idx + 1) / candidatures.length) * 100}%` }}
          />
        </div>

        <div className="flex items-center gap-1">
          <button onClick={goPrev} disabled={idx === 0}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-25 rounded-lg transition-colors">
            <ChevronLeft size={15} /> Préc.
          </button>
          <button onClick={goNext} disabled={idx === candidatures.length - 1}
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-25 rounded-lg transition-colors">
            Suiv. <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className={`bg-gradient-to-br ${heroBg} px-8 pt-5 pb-4 shrink-0 border-b border-white/60`}>
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <input
              className="w-full text-2xl font-extrabold text-slate-900 bg-transparent border-b-2 border-transparent hover:border-slate-300 focus:border-slate-500 focus:outline-none pb-0.5 transition-colors placeholder:text-slate-300"
              value={form.entreprise}
              onChange={e => set('entreprise', e.target.value)}
              onBlur={e => save('entreprise', e.target.value)}
              placeholder="Entreprise"
            />
            <input
              className="w-full text-sm text-slate-500 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-slate-400 focus:outline-none mt-1 pb-0.5 transition-colors placeholder:text-slate-300"
              value={form.poste}
              onChange={e => set('poste', e.target.value)}
              onBlur={e => save('poste', e.target.value)}
              placeholder="Poste visé (optionnel)"
            />
          </div>

          {/* Priority toggle — gros et visible */}
          <button
            onClick={() => onTogglePriorite(current.id)}
            className={`flex flex-col items-center gap-1 px-4 py-2.5 rounded-2xl border-2 transition-all shrink-0
              ${isPrio
                ? 'bg-amber-400 border-amber-500 text-white shadow-lg shadow-amber-200 scale-105'
                : 'bg-white/60 border-slate-200 text-slate-300 hover:border-amber-300 hover:text-amber-400'}`}
          >
            <Star size={22} className={isPrio ? 'fill-white' : ''} />
            <span className={`text-[10px] font-bold uppercase tracking-wide ${isPrio ? 'text-white' : 'text-slate-400'}`}>
              {isPrio ? 'Try Hard' : 'Priorité'}
            </span>
          </button>
        </div>

        {/* Priority banner */}
        {isPrio && (
          <div className="mt-3 flex items-center gap-2 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl w-fit shadow">
            <Star size={12} className="fill-white" />
            CANDIDATURE PRIORITAIRE — TRY HARD
          </div>
        )}
      </div>

      {/* ── Body : 2 colonnes sans scroll ── */}
      <div className="flex-1 grid grid-cols-2 divide-x divide-slate-200 min-h-0 overflow-hidden">

        {/* Colonne gauche */}
        <div className={`flex flex-col gap-4 px-7 py-5 overflow-hidden bg-gradient-to-b ${heroBg} bg-opacity-30`}>

          {/* Statut + Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className={labelCls}>Statut</span>
              <select className={inputCls} value={form.statut}
                onChange={e => { set('statut', e.target.value); save('statut', e.target.value) }}>
                {STATUTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <span className={labelCls}>Type</span>
              <select className={inputCls} value={form.type}
                onChange={e => { set('type', e.target.value); save('type', e.target.value) }}>
                <option value="classique">Classique</option>
                <option value="spontanée">Spontanée</option>
              </select>
            </div>
          </div>

          {/* Dates */}
          <div>
            <span className={labelCls}>Chronologie</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Envoi',     field: 'dateCandidature' },
                { label: 'Relance',   field: 'dateRelance' },
                { label: 'Entretien', field: 'dateEntretien' },
              ].map(({ label, field }) => (
                <div key={field}>
                  <span className="text-[10px] text-slate-400 block mb-1">{label}</span>
                  <input type="date" className={inputCls} value={form[field]}
                    onChange={e => set(field, e.target.value)}
                    onBlur={e => save(field, e.target.value)} />
                </div>
              ))}
            </div>
          </div>

          {/* Lien offre */}
          <div>
            <span className={labelCls}>Lien de l'offre</span>
            <div className="flex gap-2">
              <input className={inputCls} value={form.lienOffre} placeholder="https://…"
                onChange={e => set('lienOffre', e.target.value)}
                onBlur={e => save('lienOffre', e.target.value)} />
              {form.lienOffre && (
                <a href={form.lienOffre} target="_blank" rel="noopener noreferrer"
                  className="flex items-center px-3 border border-white/60 bg-white/70 rounded-xl text-slate-500 hover:bg-white transition-colors shadow-sm shrink-0">
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Colonne droite */}
        <div className="flex flex-col gap-4 px-7 py-5 overflow-hidden bg-white/40">

          {/* Contact */}
          <div>
            <span className={labelCls}>Contact</span>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Nom',       sub: 'nom',   type: 'text',  ph: 'Prénom NOM' },
                { label: 'Email',     sub: 'email', type: 'email', ph: 'email@entreprise.com' },
                { label: 'Téléphone', sub: 'tel',   type: 'text',  ph: '06…' },
              ].map(({ label, sub, type, ph }) => (
                <div key={sub} className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 w-16 shrink-0 text-right">{label}</span>
                  <input type={type} className={inputCls} value={form.contact[sub]} placeholder={ph}
                    onChange={e => setContact(sub, e.target.value)}
                    onBlur={() => save('contact', form.contact)} />
                </div>
              ))}
            </div>
          </div>

          {/* Notes — remplit le reste */}
          <div className="flex flex-col flex-1 min-h-0">
            <span className={labelCls}>Notes & contexte</span>
            <textarea
              className={`${inputCls} flex-1 resize-none leading-relaxed`}
              value={form.notes}
              placeholder="Infos utiles, retours, impressions, prochaine action…"
              onChange={e => set('notes', e.target.value)}
              onBlur={e => save('notes', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-white/80 backdrop-blur border-t border-slate-200 shrink-0">
        <button onClick={goPrev} disabled={idx === 0}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-25 rounded-xl transition-colors">
          <ChevronLeft size={15} /> Précédent
        </button>
        <span className="text-xs text-slate-400">← → pour naviguer · Échap pour quitter · Sauvegarde auto</span>
        <button onClick={goNext} disabled={idx === candidatures.length - 1}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors shadow-sm disabled:opacity-25
            ${isPrio ? 'bg-amber-500 hover:bg-amber-600' : 'bg-violet-600 hover:bg-violet-700'}`}>
          Suivant <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}
