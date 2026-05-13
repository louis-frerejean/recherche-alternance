import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const DEFAULTS = [
  'LinkedIn', 'Indeed', 'Welcome to the Jungle', 'APEC', 'HelloWork',
]

function migrateFromLocalStorage(userId) {
  try {
    const raw = localStorage.getItem('alternance_platform_stats')
    if (!raw) return []
    const local = JSON.parse(raw)
    if (!Array.isArray(local) || !local.length) return []
    const rows = local.map(p => ({
      user_id:      userId,
      nom:          p.nom          ?? '',
      total:        p.total        ?? 0,
      refus:        p.refus        ?? 0,
      sans_reponse: p.sansReponse  ?? 0,
      entretiens:   p.entretiens   ?? 0,
    }))
    localStorage.removeItem('alternance_platform_stats')
    return rows
  } catch { return [] }
}

function fromDB(row) {
  return {
    id:          row.id,
    nom:         row.nom,
    total:       row.total       ?? 0,
    refus:       row.refus       ?? 0,
    sansReponse: row.sans_reponse ?? 0,
    entretiens:  row.entretiens  ?? 0,
  }
}

export function usePlatformStats(userId) {
  const [platforms, setPlatforms] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    if (!userId) return
    fetchAll()
  }, [userId])

  async function fetchAll() {
    setLoading(true)
    const { data, error } = await supabase
      .from('platform_stats')
      .select('*')
      .order('nom')

    if (!error) {
      if (!data?.length) {
        // Première ouverture : seed depuis localStorage ou defaults
        const localRows = migrateFromLocalStorage(userId)
        const rows = localRows.length
          ? localRows
          : DEFAULTS.map(nom => ({ user_id: userId, nom, total: 0, refus: 0, sans_reponse: 0, entretiens: 0 }))
        await supabase.from('platform_stats').insert(rows)
        const { data: seeded } = await supabase.from('platform_stats').select('*').order('nom')
        setPlatforms(seeded?.map(fromDB) ?? [])
      } else {
        // Supabase a déjà des lignes — vérifie si tout est à 0 et si localStorage a des vraies données
        const allZero = data.every(p => !p.total && !p.refus && !p.sans_reponse && !p.entretiens)
        const localRows = allZero ? migrateFromLocalStorage(userId) : []
        if (localRows.length) {
          // Remplace les lignes Supabase par les données localStorage
          await supabase.from('platform_stats').delete().eq('user_id', userId)
          await supabase.from('platform_stats').insert(localRows)
          const { data: restored } = await supabase.from('platform_stats').select('*').order('nom')
          setPlatforms(restored?.map(fromDB) ?? [])
        } else {
          setPlatforms(data.map(fromDB))
        }
      }
    }
    setLoading(false)
  }

  async function update(id, field, value) {
    setPlatforms(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
    const col = field === 'sansReponse' ? 'sans_reponse' : field
    await supabase.from('platform_stats').update({ [col]: value }).eq('id', id)
  }

  async function updateNom(id, nom) {
    setPlatforms(prev => prev.map(p => p.id === id ? { ...p, nom } : p))
    await supabase.from('platform_stats').update({ nom }).eq('id', id)
  }

  async function add() {
    const { data } = await supabase
      .from('platform_stats')
      .insert({ user_id: userId, nom: '', total: 0, refus: 0, sans_reponse: 0, entretiens: 0 })
      .select().single()
    if (data) setPlatforms(prev => [...prev, fromDB(data)])
  }

  async function remove(id) {
    setPlatforms(prev => prev.filter(p => p.id !== id))
    await supabase.from('platform_stats').delete().eq('id', id)
  }

  return { platforms, loading, update, updateNom, add, remove }
}
