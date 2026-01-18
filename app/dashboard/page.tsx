'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === 'loading') return

        if (!session) {
            router.push('/login')
        } else {
            // Everyone goes to student view by default (to see the "user side")
            // Tech/Admin users can use the "Tech Dashboard" link in navbar to get to management
            router.push('/dashboard/student')
        }
    }, [session, status, router])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full"></div>
        </div>
    )
}
