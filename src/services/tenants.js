import { supabase } from '../lib/supabase'

export async function getTenants() {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .order('name')
  if (error) throw new Error(error.message)
  return data
}

export async function getTenant(id) {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function createTenant({ name, slug, settings_json }) {
  const { data, error } = await supabase
    .from('tenants')
    .insert({ name, slug, settings_json })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateTenantSettings(id, settings) {
  const { data, error } = await supabase
    .from('tenants')
    .update({ settings_json: settings })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteTenant(id) {
  const { data, error } = await supabase
    .from('tenants')
    .update({ status: 'DELETED' })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function getTenantMembers(tenantId) {
  const { data, error } = await supabase
    .from('tenant_memberships')
    .select('*, users(*)')
    .eq('tenant_id', tenantId)
    .order('role')
  if (error) throw new Error(error.message)
  return data
}

export async function inviteMember(tenantId, email, role) {
  let { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (userError && userError.code === 'PGRST116') {
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({ email })
      .select()
      .single()
    if (createError) throw new Error(createError.message)
    user = newUser
  } else if (userError) {
    throw new Error(userError.message)
  }

  const { data, error } = await supabase
    .from('tenant_memberships')
    .insert({ tenant_id: tenantId, user_id: user.id, role })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateMemberRole(membershipId, role) {
  const { data, error } = await supabase
    .from('tenant_memberships')
    .update({ role })
    .eq('id', membershipId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function removeMember(membershipId) {
  const { data, error } = await supabase
    .from('tenant_memberships')
    .update({ active: false })
    .eq('id', membershipId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}
