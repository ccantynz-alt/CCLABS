import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CCLABS - AI Website Builder',
  description: 'Build websites with AI assistance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
