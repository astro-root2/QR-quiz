import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) {
    return null
  }

  const adminClient = createAdminClient()
  const { data: adminRow } = await adminClient
    .from('admins')
    .select('id')
    .eq('email', user.email)
    .maybeSingle()

  if (!adminRow) {
    return null
  }

  return { userId: user.id, email: user.email }
}
