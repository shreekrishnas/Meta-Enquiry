import { supabase } from '../lib/supabase'

export async function getArticles(tenantId, { status, category, search, page = 1, limit = 20 } = {}) {
  let query = supabase
    .from('knowledge_articles')
    .select('*', { count: 'exact' })
    .eq('tenant_id', tenantId)
    .order('updated_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (status) query = query.eq('status', status)
  if (category) query = query.eq('category', category)
  if (search) query = query.ilike('title', `%${search}%`)

  const { data, error, count } = await query
  if (error) throw new Error(error.message)
  return { data, count }
}

export async function getArticle(id) {
  const { data, error } = await supabase
    .from('knowledge_articles')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function createArticle(tenantId, { title, content, category, owner_id }) {
  const { data, error } = await supabase
    .from('knowledge_articles')
    .insert({ tenant_id: tenantId, title, content, category, owner_id, status: 'DRAFT' })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateArticle(id, updates) {
  if (updates.content) {
    const { data: current, error: fetchError } = await supabase
      .from('knowledge_articles')
      .select('version')
      .eq('id', id)
      .single()
    if (fetchError) throw new Error(fetchError.message)
    updates.version = (current.version || 0) + 1
  }

  const { data, error } = await supabase
    .from('knowledge_articles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function publishArticle(id) {
  const { data, error } = await supabase
    .from('knowledge_articles')
    .update({ status: 'PUBLISHED', effective_from: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function archiveArticle(id) {
  const { data, error } = await supabase
    .from('knowledge_articles')
    .update({ status: 'ARCHIVED' })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteArticle(id) {
  const { error } = await supabase
    .from('knowledge_articles')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function searchArticles(tenantId, query) {
  const { data, error } = await supabase
    .from('knowledge_articles')
    .select('*')
    .eq('tenant_id', tenantId)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
  if (error) throw new Error(error.message)
  return data
}
