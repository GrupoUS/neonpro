import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
<<<<<<< Updated upstream
import { StagewiseProvider } from "@project-core/shared/stagewise"
=======
>>>>>>> Stashed changes

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NEONPRO - Horizon UI Theme',
  description: 'NEONPRO application with Horizon UI Pro theme system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background text-text">
          {children}
        </div>
<<<<<<< Updated upstream
        <StagewiseProvider projectName="neonpro" debug={process.env.NODE_ENV === 'development'} />
=======
>>>>>>> Stashed changes
      </body>
    </html>
  )
}
