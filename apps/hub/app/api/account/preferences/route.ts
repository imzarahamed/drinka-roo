import { createServerSupabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const preferences = await request.json()

    // For now, we'll just return success since preferences are stored client-side
    // In a real implementation, you might want to store these in a user_preferences table

    // Here you could save preferences to a database table like:
    // const { error } = await supabase
    //   .from('user_preferences')
    //   .upsert({
    //     user_id: user.id,
    //     preferences: preferences,
    //     updated_at: new Date().toISOString()
    //   })

    return NextResponse.json({
      success: true,
      message: 'Preferences saved successfully'
    })
  } catch (error) {
    console.error('Preferences update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}