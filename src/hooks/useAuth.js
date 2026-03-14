import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  // Effect 1: manage session via onAuthStateChange only (fires INITIAL_SESSION on mount)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (!session) {
        setProfile(null)
        setLoading(false)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // Effect 2: fetch profile whenever the logged-in user changes
  useEffect(() => {
    if (!session?.user?.id) return

    let cancelled = false

    async function loadProfile() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (cancelled) return
        if (!error && data) setProfile(data)
      } catch (_) {
        // network or unexpected error — fall through to finally
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadProfile()
    return () => { cancelled = true }
  }, [session?.user?.id])

  async function refreshProfile() {
    if (!session?.user?.id) return
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    if (!error && data) setProfile(data)
  }

  async function signIn(email, password) {
    setAuthError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setAuthError(error.message)
    return !error
  }

  async function signUp(email, password, username) {
    setAuthError(null)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    if (error) setAuthError(error.message)
    return !error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return { session, profile, loading, authError, signIn, signUp, signOut, refreshProfile }
}
