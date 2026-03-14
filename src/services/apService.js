import { supabase } from '../lib/supabase'

export function computeAP(exercises, sets, durationSec) {
  const baseAP = exercises.length * 10
  const totalVolume = exercises.reduce((acc, ex) => {
    const exSets = sets[ex.id] || []
    return acc + exSets.reduce((s, set) => s + (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0), 0)
  }, 0)
  const volumeAP = Math.floor(totalVolume / 100)
  const durationAP = Math.floor(durationSec / 60)
  return Math.max(10, baseAP + volumeAP + durationAP)
}

export function computeVolume(exercises, sets) {
  return exercises.reduce((acc, ex) => {
    const exSets = sets[ex.id] || []
    return acc + exSets.reduce((s, set) => s + (parseFloat(set.weight) || 0) * (parseInt(set.reps) || 0), 0)
  }, 0)
}

export async function awardWorkoutAP(userId, apEarned) {
  const { error } = await supabase.rpc('increment_ap_and_workouts', {
    p_user_id: userId,
    p_ap: apEarned,
  })
  return error
}
