import 'next-auth'

declare module 'next-auth' {
    interface User {
        role?: 'student' | 'tech' | 'admin'
    }

    interface Session {
        user: {
            id: string
            name?: string | null
            email?: string | null
            image?: string | null
            role: 'student' | 'tech' | 'admin'
        }
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id?: string
        role?: 'student' | 'tech' | 'admin'
    }
}
