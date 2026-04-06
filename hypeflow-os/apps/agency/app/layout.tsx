import type { Metadata } from 'next'
import { Inter, Roboto_Mono, Syne, Manrope } from 'next/font/google'
import { TRPCProvider } from '@/components/providers/TRPCProvider'
import './globals.css'

/* Primary — Inter (same geometric precision as Geist / AIOX brand DNA) */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-geist',  // keep var name so CSS classes still work
  weight: ['300', '400', '500', '600', '700'],
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  weight: ['400', '500', '700'],
})

/* Display — Syne (approximates TASA Orbiter 800) */
const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  weight: ['700', '800'],
})

/* Metrics — Manrope */
const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'HYPE Flow OS',
  description: 'Plataforma Operacional HYPE Flow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body className={`${inter.variable} ${robotoMono.variable} ${syne.variable} ${manrope.variable} antialiased`}>
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  )
}
