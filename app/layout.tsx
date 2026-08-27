import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'TakeStage — Buy Time. Take the Stage. Be Seen.',
    template: '%s | TakeStage',
  },
  description:
    'The live public internet stage. Pay for time, get your website in front of everyone. Someone can take over at any moment.',
  keywords: ['takestage', 'live stage', 'buy time', 'internet stage', 'takeover'],
  authors: [{ name: 'TakeStage' }],
  openGraph: {
    title: 'TakeStage — Buy Time. Take the Stage. Be Seen.',
    description:
      'The live public internet stage. Pay for time, get your website in front of everyone.',
    url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://takestage.app',
    siteName: 'TakeStage',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TakeStage — Buy Time. Take the Stage. Be Seen.',
    description: 'The live public internet stage.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-stage-black text-white min-h-screen">
        {children}
      </body>
    </html>
  )
}
