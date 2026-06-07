import { createServerSupabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import { updateCustomer } from '../../actions'

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabase()

  const { data: customer } = await supabase
    .from('customer_profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!customer) notFound()

  const action = updateCustomer.bind(null, id)

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Edit customer</h1>

      <form
        action={action}
        className="bg-white rounded-xl border shadow-sm p-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Full name *</label>
          <input
            name="full_name"
            required
            defaultValue={customer.full_name}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Company</label>
          <input
            name="company_name"
            defaultValue={customer.company_name ?? ''}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            name="phone"
            type="tel"
            defaultValue={customer.phone ?? ''}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <textarea
            name="address"
            rows={3}
            defaultValue={customer.address ?? ''}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            name="notes"
            rows={2}
            defaultValue={customer.notes ?? ''}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            name="is_active"
            type="checkbox"
            value="true"
            defaultChecked={customer.is_active ?? true}
            id="is_active"
            className="rounded"
          />
          <label htmlFor="is_active" className="text-sm font-medium">
            Active (can log in to MyAccount)
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
          >
            Save changes
          </button>
          <a
            href="/customers"
            className="px-5 py-2 rounded-lg text-sm font-medium border hover:bg-gray-50 transition"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  )
}