import { createServerSupabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const body = await request.json()

    const { full_name, email, role, is_active, password } = body

    if (!full_name || !email || !role || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // First create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name
        }
      }
    })

    if (authError) {
      return NextResponse.json(
        { error: `Failed to create auth user: ${authError.message}` },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 400 }
      )
    }

    // Then create the hub profile
    const { data: profileData, error: profileError } = await supabase
      .from('hub_profiles')
      .insert({
        id: authData.user.id,
        full_name,
        role,
        is_active: is_active !== false
      })
      .select()
      .single()

    if (profileError) {
      // If profile creation fails, we should ideally clean up the auth user
      return NextResponse.json(
        { error: `Failed to create hub profile: ${profileError.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json(profileData, { status: 201 })
  } catch (error) {
    console.error('Staff creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createServerSupabase()

    const { data: staff, error } = await supabase
      .from('hub_profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Staff fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}