import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useRoutines(userId) {
  const [routines, setRoutines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    fetchRoutines()
  }, [userId])

  async function fetchRoutines() {
    setLoading(true)
    const { data } = await supabase
      .from('routines')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setRoutines(data || [])
    setLoading(false)
  }

  async function createRoutine(form) {
    const payload = {
      user_id: userId,
      name: form.name,
      description: form.description,
      exercises: form.exercises.map(e => ({ exercise_id: e.id, exercise_name: e.name })),
      is_public: form.isPublic,
    }
    const { data, error } = await supabase.from('routines').insert(payload).select().single()
    if (!error) {
      setRoutines(prev => [data, ...prev])
      if (form.isPublic) {
        await supabase.rpc('increment_routines_created', { p_user_id: userId })
      }
    }
    return { data, error }
  }

  async function updateRoutine(id, form) {
    const payload = {
      name: form.name,
      description: form.description,
      exercises: form.exercises.map(e => ({ exercise_id: e.id, exercise_name: e.name })),
      is_public: form.isPublic,
    }
    const { data, error } = await supabase.from('routines').update(payload).eq('id', id).select().single()
    if (!error) {
      setRoutines(prev => prev.map(r => r.id === id ? data : r))
      if (form.isPublic) {
        await supabase.rpc('increment_routines_created', { p_user_id: userId })
      }
    }
    return { data, error }
  }

  async function deleteRoutine(id) {
    const { error } = await supabase.from('routines').delete().eq('id', id)
    if (!error) setRoutines(prev => prev.filter(r => r.id !== id))
    return { error }
  }

  return { routines, loading, createRoutine, updateRoutine, deleteRoutine, refetch: fetchRoutines }
}
