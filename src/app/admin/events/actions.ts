'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createEvent(formData: FormData) {
  const name = (formData.get('name') as string)?.trim()

  if (!name) {
    redirect('/admin/events?error=name_required')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  const { data: event, error } = await supabase
    .from('events')
    .insert({ name, owner_id: user.id })
    .select('id')
    .single()

  if (error || !event) {
    redirect('/admin/events?error=create_failed')
  }

  redirect(`/e/${event.id}/admin/dashboard`)
}

