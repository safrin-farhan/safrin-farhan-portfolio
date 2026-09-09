import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'Safrin Farhan — Cloud Engineer & AI Systems',
  description: 'The portfolio of Safrin Farhan: aspiring cloud engineer and final-year AI & ML student exploring cloud infrastructure, retrieval-augmented generation, and intelligent systems.',
  applicationName: 'Safrin Farhan Portfolio',
  icons: { icon: '/icon.svg' },
  authors: [{ name: 'Safrin Farhan' }],
  keywords: ['Safrin Farhan', 'Cloud Engineer', 'RAG', 'AWS', 'AI', 'Machine Learning', 'Mangaluru', 'Portfolio'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    title: 'Safrin Farhan — Curiosity. Code. Cloud.',
    description: 'Connecting intelligent systems with the infrastructure that brings them to life. Explore my work, toolkit, and journey.',
    siteName: 'Safrin Farhan',
  },
  twitter: { card: 'summary_large_image', title: 'Safrin Farhan — Cloud & AI Systems', description: 'Curiosity. Code. Cloud. A portfolio of thoughtful technology and a reason to build.' },
}

export const viewport: Viewport = { themeColor: '#fafbfc', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`bg-background ${geist.variable} ${geistMono.variable}`}><body className="font-sans antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
