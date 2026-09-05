import { supabase } from '../lib/supabase'

export async function getNotifications(userId, { status, limit = 50 } = {}) {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('recipient_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

export async function markAsRead(id) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ status: 'READ', read_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function markAllAsRead(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ status: 'READ', read_at: new Date().toISOString() })
    .eq('recipient_id', userId)
    .eq('status', 'UNREAD')
    .select()
  if (error) throw new Error(error.message)
  return data
}

export async function getUnreadCount(userId) {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .eq('status', 'UNREAD')
  if (error) throw new Error(error.message)
  return count
}

export function subscribeToNotifications(userId, callback) {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${userId}` },
      callback
    )
    .subscribe()
  return channel
}
