import { supabase } from '../lib/supabase'

export async function getAuditLog(tenantId, { conversationId, actorId, eventType, page = 1, limit = 50 } = {}) {
  let query = supabase
    .from('audit_events')
    .select('*, users:actor_id(id, name, email)', { count: 'exact' })
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (conversationId) query = query.eq('conversation_id', conversationId)
  if (actorId) query = query.eq('actor_id', actorId)
  if (eventType) query = query.eq('event_type', eventType)

  const { data, error, count } = await query
  if (error) throw new Error(error.message)
  return { data, count }
}

export async function createAuditEvent(tenantId, { conversation_id, actor_id, event_type, event_data }) {
  const { data, error } = await supabase
    .from('audit_events')
    .insert({ tenant_id: tenantId, conversation_id, actor_id, event_type, event_data })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}
