import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/components/providers'
import Navigation from '@/components/ui/navigation'
import Footer from '@/components/ui/footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'UniResources Hub - Level up your uni studies',
    description: 'Access curated educational resources, courses, notes, and videos for university students',
    keywords: ['university', 'education', 'resources', 'courses', 'notes', 'learning'],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>
                    <div className="flex flex-col min-h-screen">
                        <Navigation />
                        <main className="flex-grow">{children}</main>
                        <Footer />
                    </div>
                </Providers>
            </body>
        </html>
    )
}
