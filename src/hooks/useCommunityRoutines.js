import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useCommunityRoutines(userId) {
  const [routines, setRoutines] = useState([])
  const [bookmarked, setBookmarked] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('popular')

  useEffect(() => {
    fetchRoutines()
    if (userId) fetchBookmarks()
  }, [sort, userId])

  async function fetchRoutines() {
    setLoading(true)
    const orderCol = sort === 'popular' ? 'downloads' : sort === 'rated' ? 'rating' : 'created_at'
    const { data } = await supabase
      .from('routines')
      .select('*, profiles(username)')
      .eq('is_public', true)
      .order(orderCol, { ascending: false })
      .limit(50)
    setRoutines(data || [])
    setLoading(false)
  }

  async function fetchBookmarks() {
    const { data } = await supabase
      .from('bookmarks')
      .select('routine_id')
      .eq('user_id', userId)
    if (data) setBookmarked(new Set(data.map(b => b.routine_id)))
  }

  async function toggleBookmark(routineId) {
    if (!userId) return
    if (bookmarked.has(routineId)) {
      await supabase.from('bookmarks').delete().eq('user_id', userId).eq('routine_id', routineId)
      setBookmarked(prev => { const n = new Set(prev); n.delete(routineId); return n })
    } else {
      await supabase.from('bookmarks').insert({ user_id: userId, routine_id: routineId })
      setBookmarked(prev => new Set([...prev, routineId]))
    }
  }

  async function incrementDownload(routineId) {
    await supabase.rpc('increment_routine_downloads', { p_routine_id: routineId })
  }

  return { routines, bookmarked, loading, sort, setSort, toggleBookmark, incrementDownload }
}
