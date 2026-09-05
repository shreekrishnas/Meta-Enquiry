import { supabase } from '../lib/supabase'

export async function triggerAIPipeline(conversationId, tenantId) {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await supabase.functions.invoke('ai-pipeline', {
    body: { conversation_id: conversationId, tenant_id: tenantId },
    headers: { Authorization: `Bearer ${session?.access_token}` },
  })
  if (res.error) throw new Error(res.error.message)
  return res.data
}

export async function sendMetaMessage(conversationId, messageText, senderId) {
  const { data: { session } } = await supabase.auth.getSession()
  const res = await supabase.functions.invoke('meta-send', {
    body: { conversation_id: conversationId, message_text: messageText, sender_id: senderId },
    headers: { Authorization: `Bearer ${session?.access_token}` },
  })
  if (res.error) throw new Error(res.error.message)
  return res.data
}
