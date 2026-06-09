import { createServerSupabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Logout error:', error)
    }

    return redirect('/login')
  } catch (error) {
    console.error('Logout error:', error)
    return redirect('/login')
  }
}