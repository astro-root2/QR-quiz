'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    redirect('/admin/login?error=invalid_credentials')
  }

  // admins テーブルによる固定許可リストは廃止した。
  // ログインできた = そのユーザーは自分のイベントのオーナーとして扱う。
  redirect('/admin/events')
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    redirect('/admin/signup?error=invalid_input')
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    redirect(`/admin/signup?error=${encodeURIComponent(error.message)}`)
  }

  if (!data.session) {
    // Supabase側の「Confirm email」が有効なままだと、サインアップ直後は
    // セッションが発行されずメール確認待ちになる。
    redirect('/admin/signup?error=confirm_email_required')
  }

  redirect('/admin/events')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}

