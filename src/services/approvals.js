import { supabase } from '../lib/supabase'

export async function getPendingApprovals(tenantId) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*, customers(*), ai_runs(*)')
    .eq('tenant_id', tenantId)
    .in('status', ['WAITING_FOR_POC'])
    .order('updated_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function getApprovalHistory(tenantId, { decision, page = 1, limit = 20 } = {}) {
  let query = supabase
    .from('approvals')
    .select('*, conversations(*)', { count: 'exact' })
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (decision) query = query.eq('decision', decision)

  const { data, error, count } = await query
  if (error) throw new Error(error.message)
  return { data, count }
}

export async function createApproval(tenantId, { conversation_id, ai_run_id, reviewer_id, decision, instructions, original_draft, final_draft }) {
  const { data, error } = await supabase
    .from('approvals')
    .insert({ tenant_id: tenantId, conversation_id, ai_run_id, reviewer_id, decision, instructions, original_draft, final_draft })
    .select()
    .single()
  if (error) throw new Error(error.message)

  const statusMap = {
    APPROVED: 'POC_APPROVED',
    REJECTED: 'UNDER_REVIEW',
    CHANGES_REQUESTED: 'CHANGES_REQUESTED',
    ESCALATED: 'ESCALATED',
  }

  const newStatus = statusMap[decision]
  if (newStatus) {
    const { error: convError } = await supabase
      .from('conversations')
      .update({ status: newStatus })
      .eq('id', conversation_id)
    if (convError) throw new Error(convError.message)
  }

  const { error: auditError } = await supabase
    .from('audit_events')
    .insert({
      tenant_id: tenantId,
      conversation_id,
      actor_id: reviewer_id,
      event_type: 'APPROVAL_DECISION',
      event_data: { decision, ai_run_id },
    })
  if (auditError) throw new Error(auditError.message)

  return data
}
