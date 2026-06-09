import { createServerSupabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabase()

    // Get user email from auth
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(params.id)

    if (userError || !userData.user?.email) {
      return NextResponse.json(
        { error: 'User not found or email not available' },
        { status: 404 }
      )
    }

    // Send password reset email
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(userData.user.email)

    if (resetError) {
      return NextResponse.json(
        { error: `Failed to send reset email: ${resetError.message}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent successfully'
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}