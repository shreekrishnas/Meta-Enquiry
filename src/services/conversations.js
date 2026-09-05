import { supabase } from '../lib/supabase'

export async function getConversations(tenantId, { status, priority, category, search, page = 1, limit = 20 } = {}) {
  let query = supabase
    .from('conversations')
    .select('*, customers(*)', { count: 'exact' })
    .eq('tenant_id', tenantId)
    .order('updated_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (status) query = query.eq('status', status)
  if (priority) query = query.eq('priority', priority)
  if (category) query = query.eq('category', category)
  if (search) query = query.ilike('subject', `%${search}%`)

  const { data, error, count } = await query
  if (error) throw new Error(error.message)
  return { data, count }
}

export async function getConversation(id) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*, customers(*)')
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function getConversationMessages(conversationId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  if (error) throw new Error(error.message)
  return data
}

export async function updateConversationStatus(id, status, extras = {}) {
  const updates = { status, ...extras }
  const { data, error } = await supabase
    .from('conversations')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)

  const { error: auditError } = await supabase
    .from('audit_events')
    .insert({
      conversation_id: id,
      event_type: 'STATUS_CHANGE',
      event_data: { new_status: status, ...extras },
      tenant_id: data.tenant_id,
    })
  if (auditError) throw new Error(auditError.message)

  return data
}

export async function assignConversation(id, userId) {
  const { data, error } = await supabase
    .from('conversations')
    .update({ assigned_to: userId })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function createMessage(msg) {
  const { data, error } = await supabase
    .from('messages')
    .insert(msg)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function getConversationStats(tenantId) {
  const { data, error } = await supabase
    .from('conversations')
    .select('status')
    .eq('tenant_id', tenantId)
  if (error) throw new Error(error.message)

  const stats = {}
  for (const row of data) {
    stats[row.status] = (stats[row.status] || 0) + 1
  }
  return stats
}

export function subscribeToConversations(tenantId, callback) {
  const channel = supabase
    .channel(`conversations:${tenantId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'conversations', filter: `tenant_id=eq.${tenantId}` },
      callback
    )
    .subscribe()
  return channel
}

export function subscribeToMessages(conversationId, callback) {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      callback
    )
    .subscribe()
  return channel
}
