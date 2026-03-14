import { supabase } from '../lib/supabase'

export async function updateStreak(userId) {
  const { error } = await supabase.rpc('update_streak', { p_user_id: userId })
  return error
}
