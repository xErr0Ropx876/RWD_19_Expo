import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/db/mongodb'
import User from '@/lib/models/User'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        await connectDB()

        // Fetch all users, excluding passwords
        const users = await User.find({}).select('-password').sort({ createdAt: -1 })

        return NextResponse.json({
            success: true,
            data: users,
        })
    } catch (error: any) {
        console.error('Admin users fetch error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch users' },
            { status: 500 }
        )
    }
}
