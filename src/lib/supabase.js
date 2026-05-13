import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Adapters camelCase ↔ snake_case
export function fromDB(row) {
  return {
    id:              row.id,
    entreprise:      row.entreprise,
    poste:           row.poste ?? '',
    type:            row.type ?? 'classique',
    statut:          row.statut ?? 'a_envoyer',
    priorite:        row.priorite ?? false,
    plateforme:      row.plateforme ?? '',
    dateCandidature: row.date_candidature ?? '',
    dateRelance:     row.date_relance ?? '',
    dateEntretien:   row.date_entretien ?? '',
    contact:         row.contact ?? { nom: '', email: '', tel: '' },
    lienOffre:       row.lien_offre ?? '',
    notes:           row.notes ?? '',
    createdAt:       row.created_at,
  }
}

export function toDB(c, userId) {
  return {
    id:               c.id,
    user_id:          userId,
    entreprise:       c.entreprise,
    poste:            c.poste ?? '',
    type:             c.type ?? 'classique',
    statut:           c.statut ?? 'a_envoyer',
    priorite:         c.priorite ?? false,
    plateforme:       c.plateforme ?? '',
    date_candidature: c.dateCandidature ?? '',
    date_relance:     c.dateRelance ?? '',
    date_entretien:   c.dateEntretien ?? '',
    contact:          c.contact ?? { nom: '', email: '', tel: '' },
    lien_offre:       c.lienOffre ?? '',
    notes:            c.notes ?? '',
  }
}
