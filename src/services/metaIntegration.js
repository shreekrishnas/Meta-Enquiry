import { supabase } from '../lib/supabase'

export async function getIntegrations(tenantId) {
  const { data, error } = await supabase
    .from('meta_integrations')
    .select('*')
    .eq('tenant_id', tenantId)
  if (error) throw new Error(error.message)
  return data
}

export async function connectPage(tenantId, { meta_page_id, meta_page_name, channel, access_token_secret_ref }) {
  const { data, error } = await supabase
    .from('meta_integrations')
    .insert({ tenant_id: tenantId, meta_page_id, meta_page_name, channel, access_token_secret_ref })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function disconnectPage(integrationId) {
  const { data, error } = await supabase
    .from('meta_integrations')
    .update({ status: 'DISCONNECTED', disconnected_at: new Date().toISOString() })
    .eq('id', integrationId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}
