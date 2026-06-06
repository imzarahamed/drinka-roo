import { createServerSupabase } from '../../lib/supabase'
import Link from 'next/link'

export default async function CustomersPage() {
  const supabase = createServerSupabase()
  const { data: customers } = await supabase
    .from('customer_profiles')
    .select(`
      *, 
      auth_users:id(email),
      orders(count)
    `)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <Link href="/customers/new"
          className="bg-black text-white px-4 py-2 rounded-lg text-sm">
          + Add customer
        </Link>
      </div>
      {/* Customer table here */}
    </div>
  )
}