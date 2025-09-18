import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function getUser(token: string) {
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error) throw error
  return user
}

export async function getTenantFromUser(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('tenantId')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data?.tenantId
}
