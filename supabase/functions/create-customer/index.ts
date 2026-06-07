// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  // Verify the caller is an authenticated HUB user
  const authHeader = req.headers.get('Authorization')!
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Validate the hub user's token
  const { data: { user: caller } } = await supabaseAdmin.auth.getUser(
    authHeader.replace('Bearer ', '')
  )
  if (!caller) return new Response('Unauthorized', { status: 401 })

  // Verify caller is a hub user
  const { data: hubProfile } = await supabaseAdmin
    .from('hub_profiles').select('role').eq('id', caller.id).single()
  if (!hubProfile) return new Response('Forbidden', { status: 403 })

  const { email, full_name, company_name, phone, address, send_email } = await req.json()

  // Generate temp password
  const tempPassword = Math.random().toString(36).slice(-8) +
    Math.random().toString(36).slice(-4).toUpperCase() + '!'

  // Create auth user (email confirmed, no verification email)
  const { data: { user }, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { portal: 'myaccount', full_name }
  })
  if (error) return new Response(JSON.stringify({ error: error.message }),
    { status: 400, headers: corsHeaders })

  // Create customer profile
  await supabaseAdmin.from('customer_profiles').insert({
    id: user!.id,
    full_name,
    company_name: company_name || null,
    phone: phone || null,
    address: address || null,
    created_by: caller.id,
  })

  // Send credentials email
  if (send_email) {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Your drinkaroo account is ready',
      html: `
        <h2>Welcome, ${full_name}!</h2>
        <p>Your account has been created. Login at:</p>
        <p><a href="${Deno.env.get('MYACCOUNT_URL')}/login">
          ${Deno.env.get('MYACCOUNT_URL')}/login
        </a></p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Temporary password:</strong> ${tempPassword}</p>
        <p>Please change your password after first login.</p>
      `
    })
  }

  return new Response(
    JSON.stringify({ success: true, userId: user!.id }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
})