import { useState, useEffect } from 'react'

const KEY = 'alternance_platform_stats'

const DEFAULT_PLATFORMS = [
  { id: '1', nom: 'LinkedIn', total: 0, refus: 0, sansReponse: 0, entretiens: 0 },
  { id: '2', nom: 'Indeed', total: 0, refus: 0, sansReponse: 0, entretiens: 0 },
  { id: '3', nom: 'Welcome to the Jungle', total: 0, refus: 0, sansReponse: 0, entretiens: 0 },
  { id: '4', nom: 'APEC', total: 0, refus: 0, sansReponse: 0, entretiens: 0 },
]

export function usePlatformStats() {
  const [platforms, setPlatforms] = useState(() => {
    try {
      const s = localStorage.getItem(KEY)
      return s ? JSON.parse(s) : DEFAULT_PLATFORMS
    } catch { return DEFAULT_PLATFORMS }
  })

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(platforms))
  }, [platforms])

  function update(id, field, value) {
    setPlatforms(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  function add() {
    setPlatforms(prev => [...prev, {
      id: crypto.randomUUID(),
      nom: '', total: 0, refus: 0, sansReponse: 0, entretiens: 0,
    }])
  }

  function remove(id) {
    setPlatforms(prev => prev.filter(p => p.id !== id))
  }

  return { platforms, update, add, remove }
}
