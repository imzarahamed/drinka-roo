import { createServerSupabase } from '@/lib/supabase'
import Link from 'next/link'

export default async function CustomersPage() {
  const supabase = await createServerSupabase()
  const { data: customers, error } = await supabase
    .from('customer_profiles')
    .select(`
      *,
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

      {error && (
        <p className="text-red-500 text-sm mb-4">Error: {error.message}</p>
      )}

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {customers?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No customers yet.
                </td>
              </tr>
            )}
            {customers?.map((c: any) => (
              <tr key={c.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium">{c.full_name}</td>
                <td className="px-4 py-3 text-gray-500">{c.company_name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500">{c.phone ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500">
                  {c.orders?.[0]?.count ?? 0}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                    ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}