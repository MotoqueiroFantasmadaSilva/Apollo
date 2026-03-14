import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useLeaderboard() {
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('ap')

  useEffect(() => {
    fetchLeaderboard()
  }, [tab])

  async function fetchLeaderboard() {
    setLoading(true)
    const orderCol = tab === 'ap' ? 'ap_rank' : tab === 'streak' ? 'streak_rank' : 'routines_rank'
    const { data } = await supabase
      .from('leaderboard')
      .select('*')
      .order(orderCol, { ascending: true })
      .limit(50)
    setLeaders(data || [])
    setLoading(false)
  }

  return { leaders, loading, tab, setTab }
}
