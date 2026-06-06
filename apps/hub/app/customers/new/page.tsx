'use client'
import { useState } from 'react'
import { createClient } from '../../../lib/supabase-client'
import { useRouter } from 'next/navigation'

export default function NewCustomerPage() {
  const supabase = createClient()
  const router = useRouter()
  const [form, setForm] = useState({
    email: '', full_name: '', company_name: '',
    phone: '', send_email: true
  })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-customer`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session!.access_token}`,
        },
        body: JSON.stringify(form),
      }
    )
    const data = await res.json()
    if (data.success) {
      setDone(true)
      setTimeout(() => router.push('/customers'), 2000)
    }
    setLoading(false)
  }

  if (done) return <div className="text-green-600 p-8">Customer created & email sent!</div>

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold mb-6">New customer</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { name: 'full_name',     label: 'Full name',     type: 'text',  required: true },
          { name: 'email',         label: 'Email',         type: 'email', required: true },
          { name: 'company_name',  label: 'Company',       type: 'text',  required: false },
          { name: 'phone',         label: 'Phone',         type: 'tel',   required: false },
        ].map(f => (
          <div key={f.name}>
            <label className="text-sm font-medium">{f.label}</label>
            <input type={f.type} required={f.required}
              value={(form as any)[f.name]}
              onChange={e => setForm(x => ({ ...x, [f.name]: e.target.value }))}
              className="w-full mt-1 px-3 py-2 border rounded-lg text-sm" />
          </div>
        ))}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.send_email}
            onChange={e => setForm(x => ({ ...x, send_email: e.target.checked }))} />
          Email login credentials to customer
        </label>
        <button type="submit" disabled={loading}
          className="w-full bg-black text-white py-2 rounded-lg text-sm font-medium">
          {loading ? 'Creating...' : 'Create customer account'}
        </button>
      </form>
    </div>
  )
}