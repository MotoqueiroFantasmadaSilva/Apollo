import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { computeAP, computeVolume, awardWorkoutAP } from '../services/apService'
import { updateStreak } from '../services/streakService'

export function useWorkouts(userId) {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    fetchWorkouts()
  }, [userId])

  async function fetchWorkouts() {
    setLoading(true)
    const { data } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(20)
    setWorkouts(data || [])
    setLoading(false)
  }

  async function saveWorkout({ name, exercises, sets, durationSec }) {
    const totalVolume = computeVolume(exercises, sets)
    const apEarned = computeAP(exercises, sets, durationSec)

    const exercisesJSON = exercises.map(ex => ({
      exercise_id: ex.id,
      exercise_name: ex.name,
      sets: (sets[ex.id] || []).map(s => ({
        weight: parseFloat(s.weight) || 0,
        reps: parseInt(s.reps) || 0,
        done: s.done,
      })),
    }))

    const payload = {
      user_id: userId,
      name: name || 'Workout',
      duration_sec: durationSec,
      total_volume: totalVolume,
      ap_earned: apEarned,
      finished_at: new Date().toISOString(),
      exercises: exercisesJSON,
    }

    const { data, error } = await supabase
      .from('workouts')
      .insert(payload)
      .select()
      .single()

    if (!error) {
      setWorkouts(prev => [data, ...prev])
      await awardWorkoutAP(userId, apEarned)
      await updateStreak(userId)
    }

    return { data, error, apEarned }
  }

  return { workouts, loading, saveWorkout, refetch: fetchWorkouts }
}
