import { supabase } from '../lib/supabase'

export async function getDashboardStats(tenantId) {
  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select('status, priority, created_at')
    .eq('tenant_id', tenantId)
  if (convError) throw new Error(convError.message)

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString()

  const byStatus = {}
  const byPriority = {}
  let createdToday = 0
  let createdThisWeek = 0

  for (const c of conversations) {
    byStatus[c.status] = (byStatus[c.status] || 0) + 1
    byPriority[c.priority] = (byPriority[c.priority] || 0) + 1
    if (c.created_at >= todayStart) createdToday++
    if (c.created_at >= weekStart) createdThisWeek++
  }

  const { data: messages, error: msgError } = await supabase
    .from('messages')
    .select('conversation_id, created_at, direction')
    .eq('direction', 'OUTBOUND')
    .limit(1000)
  if (msgError) throw new Error(msgError.message)

  return {
    total: conversations.length,
    byStatus,
    byPriority,
    createdToday,
    createdThisWeek,
    outboundMessages: messages.length,
  }
}

export async function getConversationTrends(tenantId, days = 30) {
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data, error } = await supabase
    .from('conversations')
    .select('created_at')
    .eq('tenant_id', tenantId)
    .gte('created_at', since.toISOString())
  if (error) throw new Error(error.message)

  const trends = {}
  for (const c of data) {
    const date = c.created_at.slice(0, 10)
    trends[date] = (trends[date] || 0) + 1
  }
  return trends
}

export async function getCategoryDistribution(tenantId) {
  const { data, error } = await supabase
    .from('conversations')
    .select('category')
    .eq('tenant_id', tenantId)
  if (error) throw new Error(error.message)

  const distribution = {}
  for (const c of data) {
    const cat = c.category || 'Uncategorized'
    distribution[cat] = (distribution[cat] || 0) + 1
  }
  return distribution
}

export async function getTeamPerformance(tenantId) {
  const { data, error } = await supabase
    .from('conversations')
    .select('assigned_to, status, created_at, resolved_at')
    .eq('tenant_id', tenantId)
    .not('assigned_to', 'is', null)
  if (error) throw new Error(error.message)

  const byUser = {}
  for (const c of data) {
    if (!byUser[c.assigned_to]) {
      byUser[c.assigned_to] = { total: 0, resolved: 0, totalResolveTime: 0 }
    }
    byUser[c.assigned_to].total++
    if (c.status === 'RESOLVED' && c.resolved_at) {
      byUser[c.assigned_to].resolved++
      byUser[c.assigned_to].totalResolveTime += new Date(c.resolved_at) - new Date(c.created_at)
    }
  }

  const userIds = Object.keys(byUser)
  if (userIds.length === 0) return []

  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, name, email')
    .in('id', userIds)
  if (usersError) throw new Error(usersError.message)

  const userMap = {}
  for (const u of users) userMap[u.id] = u

  return userIds.map((uid) => {
    const stats = byUser[uid]
    return {
      user: userMap[uid] || { id: uid },
      total: stats.total,
      resolved: stats.resolved,
      avgResolveTimeMs: stats.resolved > 0 ? stats.totalResolveTime / stats.resolved : null,
    }
  })
}

export async function getAIMetrics(tenantId) {
  const { data, error } = await supabase
    .from('ai_runs')
    .select('confidence_score, latency_ms, status')
    .eq('tenant_id', tenantId)
  if (error) throw new Error(error.message)

  if (data.length === 0) {
    return { total: 0, avgConfidence: null, avgLatency: null, byStatus: {}, acceptanceRate: null }
  }

  let totalConfidence = 0
  let totalLatency = 0
  let confidenceCount = 0
  let latencyCount = 0
  const byStatus = {}

  for (const run of data) {
    if (run.confidence_score != null) { totalConfidence += run.confidence_score; confidenceCount++ }
    if (run.latency_ms != null) { totalLatency += run.latency_ms; latencyCount++ }
    byStatus[run.status] = (byStatus[run.status] || 0) + 1
  }

  return {
    total: data.length,
    avgConfidence: confidenceCount > 0 ? totalConfidence / confidenceCount : null,
    avgLatency: latencyCount > 0 ? totalLatency / latencyCount : null,
    byStatus,
    acceptanceRate: data.length > 0 ? (byStatus['ACCEPTED'] || 0) / data.length : null,
  }
}
