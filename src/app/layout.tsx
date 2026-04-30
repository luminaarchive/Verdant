import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Verdant — AI Environmental Research',
  description: 'AI-powered environmental research platform. Ask anything academic about ecology, biodiversity, botany, mycology, geology, and oceanography.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body style={{ fontFamily: 'system-ui, sans-serif', background: '#FAFAF7' }}>
        {children}
      </body>
    </html>
  )
}
