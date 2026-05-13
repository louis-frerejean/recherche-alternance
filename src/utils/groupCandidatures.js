const STATUT_RANK = { accepte: 6, entretien: 5, relance: 4, envoye: 3, a_envoyer: 2, refus: 1 }

export function groupByCompany(candidatures) {
  const map = {}
  for (const c of candidatures) {
    const key = c.entreprise.trim().toLowerCase()
    if (!map[key]) map[key] = { key, entreprise: c.entreprise, items: [] }
    map[key].items.push(c)
  }
  return Object.values(map)
}

export function groupBestStatut(items) {
  return items.reduce((best, c) =>
    (STATUT_RANK[c.statut] ?? 0) > (STATUT_RANK[best.statut] ?? 0) ? c : best
  ).statut
}

export function groupIsPriority(items) {
  return items.some(c => c.priorite)
}
