import { useEffect, useState, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight, Star, ExternalLink, User, Mail, Phone } from 'lucide-react'
import { STATUTS } from './StatusBadge'
import { PLATEFORMES } from './CandidatureModal'
import { groupByCompany, groupBestStatut, groupIsPriority } from '../utils/groupCandidatures'

const STATUS_THEME = {
  a_envoyer: 'from-slate-100 to-slate-50',
  envoye:    'from-blue-100 to-blue-50',
  relance:   'from-amber-100 to-amber-50',
  entretien: 'from-violet-100 to-violet-50',
  refus:     'from-red-100 to-red-50',
  accepte:   'from-emerald-100 to-emerald-50',
}

const inputCls = 'w-full bg-white/70 border border-white/60 rounded-xl px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-white/80 focus:bg-white transition placeholder:text-slate-300 shadow-sm'
const labelCls = 'text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block'

export default function ReviewMode({ candidatures, startIndex = 0, onUpdate, onTogglePriorite, setGroupPriorite, onClose }) {
  const groups = groupByCompany(candidatures)
  const [idx, setIdx] = useState(() => Math.min(startIndex, Math.max(0, groups.length - 1)))

  const group = groups[idx]
  const isPrio = group ? groupIsPriority(group.items) : false
  const bestStatut = group ? groupBestStatut(group.items) : 'a_envoyer'
  const heroBg = isPrio ? 'from-amber-200 via-yellow-100 to-amber-50' : (STATUS_THEME[bestStatut] ?? STATUS_THEME.a_envoyer)

  const goNext = useCallback(() => { if (idx < groups.length - 1) setIdx(i => i + 1) }, [idx, groups.length])
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

  if (!group) return null

  const progress = ((idx + 1) / groups.length) * 100

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-100 overflow-hidden">

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-white/80 backdrop-blur border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={17} />
          </button>
          <span className="text-sm font-semibold text-slate-500">
            Mode Review &nbsp;
            <span className="text-slate-900 tabular-nums">{idx + 1}</span>
            <span className="text-slate-400"> / {groups.length} entreprises</span>
          </span>
        </div>
        <div className="flex-1 mx-6 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${isPrio ? 'bg-amber-400' : 'bg-violet-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center gap-1">
          <NavBtn onClick={goPrev} disabled={idx === 0}><ChevronLeft size={15} /> Préc.</NavBtn>
          <NavBtn onClick={goNext} disabled={idx === groups.length - 1}>Suiv. <ChevronRight size={15} /></NavBtn>
        </div>
      </div>

      {/* Hero */}
      <div className={`bg-gradient-to-br ${heroBg} px-8 pt-5 pb-4 shrink-0 border-b border-white/60`}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">{group.entreprise}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{group.items.length} contact{group.items.length > 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setGroupPriorite(group.items.map(c => c.id), !isPrio)}
            className={`flex flex-col items-center gap-1 px-4 py-2.5 rounded-2xl border-2 transition-all shrink-0
              ${isPrio ? 'bg-amber-400 border-amber-500 shadow-lg shadow-amber-200 scale-105' : 'bg-white/60 border-slate-200 hover:border-amber-300'}`}
          >
            <Star size={20} className={isPrio ? 'fill-white text-white' : 'text-slate-300'} />
            <span className={`text-[10px] font-bold uppercase tracking-wide ${isPrio ? 'text-white' : 'text-slate-400'}`}>
              {isPrio ? 'Try Hard' : 'Priorité'}
            </span>
          </button>
        </div>
        {isPrio && (
          <div className="mt-3 inline-flex items-center gap-2 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow">
            <Star size={11} className="fill-white" /> CANDIDATURE PRIORITAIRE — TRY HARD
          </div>
        )}
      </div>

      {/* Contacts — scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-6 flex flex-col gap-6">
          {group.items.map((item, i) => (
            <ContactCard
              key={item.id}
              item={item}
              index={group.items.length > 1 ? i + 1 : null}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="bg-white/80 backdrop-blur border-t border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
        <NavBtn onClick={goPrev} disabled={idx === 0} large><ChevronLeft size={15} /> Précédent</NavBtn>
        <span className="text-xs text-slate-400">← → pour naviguer · Échap pour quitter</span>
        <NavBtn onClick={goNext} disabled={idx === groups.length - 1} large primary={!isPrio} amber={isPrio}>
          Suivant <ChevronRight size={15} />
        </NavBtn>
      </div>
    </div>
  )
}

function NavBtn({ onClick, disabled, children, large, primary, amber }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1 font-medium disabled:opacity-25 rounded-xl transition-colors
        ${large ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-sm'}
        ${primary ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-sm'
          : amber ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
          : 'text-slate-600 hover:bg-slate-100'}`}
    >
      {children}
    </button>
  )
}

// Carte éditable par contact ──────────────────────────────────────────────

function ContactCard({ item, index, onUpdate }) {
  const [form, setForm] = useState({
    statut:          item.statut          ?? 'a_envoyer',
    type:            item.type            ?? 'classique',
    plateforme:      item.plateforme      ?? '',
    dateCandidature: item.dateCandidature ?? '',
    dateRelance:     item.dateRelance     ?? '',
    dateEntretien:   item.dateEntretien   ?? '',
    contact: {
      nom:   item.contact?.nom   ?? '',
      email: item.contact?.email ?? '',
      tel:   item.contact?.tel   ?? '',
    },
    lienOffre: item.lienOffre ?? '',
    notes:     item.notes     ?? '',
  })

  function set(field, value) { setForm(f => ({ ...f, [field]: value })) }
  function setContact(sub, value) { setForm(f => ({ ...f, contact: { ...f.contact, [sub]: value } })) }
  function save(field, value) { onUpdate(item.id, field === 'contact' ? { contact: value } : { [field]: value }) }

  const theme = { a_envoyer: 'border-slate-200', envoye: 'border-blue-200', relance: 'border-amber-200', entretien: 'border-violet-300', refus: 'border-red-200', accepte: 'border-emerald-200' }

  return (
    <div className={`bg-white rounded-2xl border-2 ${theme[form.statut] ?? 'border-slate-200'} overflow-hidden shadow-sm`}>
      {index && (
        <div className="px-5 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Contact #{index}</span>
        </div>
      )}
      <div className="px-5 py-4 flex flex-col gap-4">

        {/* Statut + Type + Plateforme */}
        <div className="grid grid-cols-3 gap-3">
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
          <div>
            <span className={labelCls}>Plateforme</span>
            <input className={inputCls} list={`pl-${item.id}`} value={form.plateforme} placeholder="LinkedIn…"
              onChange={e => set('plateforme', e.target.value)}
              onBlur={e => save('plateforme', e.target.value)} />
            <datalist id={`pl-${item.id}`}>{PLATEFORMES.map(p => <option key={p} value={p} />)}</datalist>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-3 gap-3">
          {[['dateCandidature','Envoi'],['dateRelance','Relance'],['dateEntretien','Entretien']].map(([f, l]) => (
            <div key={f}>
              <span className={labelCls}>{l}</span>
              <input type="date" className={inputCls} value={form[f]}
                onChange={e => set(f, e.target.value)}
                onBlur={e => save(f, e.target.value)} />
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Nom', sub: 'nom', type: 'text', ph: 'Prénom NOM', Icon: User },
            { label: 'Email', sub: 'email', type: 'email', ph: 'email@…', Icon: Mail },
            { label: 'Tél', sub: 'tel', type: 'text', ph: '06…', Icon: Phone },
          ].map(({ label, sub, type, ph }) => (
            <div key={sub}>
              <span className={labelCls}>{label}</span>
              <input type={type} className={inputCls} value={form.contact[sub]} placeholder={ph}
                onChange={e => setContact(sub, e.target.value)}
                onBlur={() => save('contact', form.contact)} />
            </div>
          ))}
        </div>

        {/* Lien + Notes */}
        <div>
          <span className={labelCls}>Lien de l'offre</span>
          <div className="flex gap-2">
            <input className={inputCls} value={form.lienOffre} placeholder="https://…"
              onChange={e => set('lienOffre', e.target.value)}
              onBlur={e => save('lienOffre', e.target.value)} />
            {form.lienOffre && (
              <a href={form.lienOffre} target="_blank" rel="noopener noreferrer"
                className="flex items-center px-3 border border-white/60 bg-white/70 rounded-xl text-slate-400 hover:bg-white shadow-sm shrink-0">
                <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>

        <div>
          <span className={labelCls}>Notes</span>
          <textarea className={`${inputCls} resize-none leading-relaxed`} rows={4}
            value={form.notes} placeholder="Infos utiles, retours, prochaine action…"
            onChange={e => set('notes', e.target.value)}
            onBlur={e => save('notes', e.target.value)} />
        </div>

      </div>
    </div>
  )
}
