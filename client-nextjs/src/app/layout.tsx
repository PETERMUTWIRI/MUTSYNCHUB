
import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
import { AuthProvider } from '@/context/AuthContext'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import FloatingHomeButton from '@/components/ui/FloatingHomeButton'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <html lang="en">
          <body className={inter.className + " bg-neutral-950 min-h-screen flex flex-col"}>
            <Navbar />
            <div className="flex-1 flex flex-col">
              {children}
            </div>
            <FloatingHomeButton />
            <Footer />
        </body>
      </html>
    </AuthProvider>
  )
}
