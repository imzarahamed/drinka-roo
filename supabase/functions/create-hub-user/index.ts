// @ts-nocheck
// Same pattern as create-customer, but:
// 1. Validates caller has super_admin role
// 2. Creates auth user with portal: 'hub' metadata
// 3. Inserts into hub_profiles with the chosen role
// 4. Emails credentials to the new hub user

const { role } = await req.json() // 'manager' | 'order_viewer' | 'staff'
// Validate caller is super_admin before proceeding
const { data: callerProfile } = await supabaseAdmin
  .from('hub_profiles').select('role').eq('id', caller.id).single()
if (callerProfile?.role !== 'super_admin') {
  return new Response('Forbidden', { status: 403 })
}