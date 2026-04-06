import type { Metadata } from 'next'
import { DM_Sans, Syne } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '700'],
})

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['700', '800'],
})

export const metadata: Metadata = {
  title: 'HYPE Flow — Portal do Cliente',
  description: 'Acompanhe os seus resultados em tempo real',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={`${dmSans.variable} ${syne.variable}`}>
      <body>{children}</body>
    </html>
  )
}
