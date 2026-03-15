import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useFollows(currentUserId) {
  const [followingIds, setFollowingIds] = useState(new Set())
  const [followerIds, setFollowerIds] = useState(new Set())
  const [loading, setLoading] = useState(true)

  const fetchFollows = useCallback(async () => {
    if (!currentUserId) {
      setLoading(false)
      return
    }
    setLoading(true)
    const [followingRes, followerRes] = await Promise.all([
      supabase.from('follows').select('following_id').eq('follower_id', currentUserId),
      supabase.from('follows').select('follower_id').eq('following_id', currentUserId),
    ])
    if (followingRes.data) setFollowingIds(new Set(followingRes.data.map(r => r.following_id)))
    if (followerRes.data) setFollowerIds(new Set(followerRes.data.map(r => r.follower_id)))
    setLoading(false)
  }, [currentUserId])

  useEffect(() => {
    fetchFollows()
  }, [fetchFollows])

  async function follow(targetUserId) {
    if (!currentUserId || !targetUserId || currentUserId === targetUserId) return { error: new Error('Invalid') }
    const { error } = await supabase.from('follows').insert({
      follower_id: currentUserId,
      following_id: targetUserId,
    })
    if (!error) setFollowingIds(prev => new Set([...prev, targetUserId]))
    return { error }
  }

  async function unfollow(targetUserId) {
    if (!currentUserId || !targetUserId) return { error: new Error('Invalid') }
    const { error } = await supabase.from('follows').delete()
      .eq('follower_id', currentUserId)
      .eq('following_id', targetUserId)
    if (!error) setFollowingIds(prev => { const n = new Set(prev); n.delete(targetUserId); return n })
    return { error }
  }

  function isFollowing(targetUserId) {
    return Boolean(targetUserId && followingIds.has(targetUserId))
  }

  return {
    followingIds,
    followerIds,
    followersCount: followerIds.size,
    followingCount: followingIds.size,
    loading,
    follow,
    unfollow,
    isFollowing,
    refetch: fetchFollows,
  }
}
