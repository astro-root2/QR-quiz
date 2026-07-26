'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    redirect('/admin/login?error=invalid_credentials')
  }

  const adminClient = createAdminClient()
  const { data: adminRow } = await adminClient
    .from('admins')
    .select('id')
    .eq('email', data.user.email)
    .maybeSingle()

  if (!adminRow) {
    await supabase.auth.signOut()
    redirect('/admin/login?error=not_admin')
  }

  redirect('/admin/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
