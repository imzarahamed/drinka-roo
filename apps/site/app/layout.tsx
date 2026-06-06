import type { Metadata } from 'next'
import { Navbar } from '../components/navbar'

export const metadata: Metadata = {
  title: 'WholesaleCo — Quality products',
  description: 'Browse our full product catalog',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}