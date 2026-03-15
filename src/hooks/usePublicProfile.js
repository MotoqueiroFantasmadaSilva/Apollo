import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function usePublicProfile(userId) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setProfile(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return
        if (!error && data) setProfile(data)
        else setProfile(null)
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [userId])

  return { profile, loading }
}
