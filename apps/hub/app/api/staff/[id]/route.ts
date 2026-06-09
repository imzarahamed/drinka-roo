import { createServerSupabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabase()

    const { data: staff, error } = await supabase
      .from('hub_profiles')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    if (!staff) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabase()
    const body = await request.json()

    const { full_name, role, is_active, reset_password } = body

    // Update hub profile
    const { data: staff, error } = await supabase
      .from('hub_profiles')
      .update({
        full_name,
        role,
        is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Handle password reset if requested
    if (reset_password) {
      // Get user email from auth
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(params.id)

      if (userError || !userData.user?.email) {
        return NextResponse.json(
          { error: 'Could not send password reset email' },
          { status: 400 }
        )
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(userData.user.email)

      if (resetError) {
        console.error('Password reset error:', resetError)
      }
    }

    return NextResponse.json(staff)
  } catch (error) {
    console.error('Staff update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabase()

    // First delete the hub profile
    const { error: profileError } = await supabase
      .from('hub_profiles')
      .delete()
      .eq('id', params.id)

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      )
    }

    // Then delete the auth user (requires service role key)
    const { error: authError } = await supabase.auth.admin.deleteUser(params.id)

    if (authError) {
      console.error('Auth user deletion error:', authError)
      // Don't fail the whole operation if auth deletion fails
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Staff deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}