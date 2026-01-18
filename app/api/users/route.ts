
import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import User from '@/lib/models/User'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || (session.user.role !== 'tech' && session.user.role !== 'admin')) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            )
        }

        await connectDB()

        const users = await User.find({})
            .select('_id name email role image provider createdAt')
            .sort({ createdAt: -1 })

        const count = await User.countDocuments({})

        return NextResponse.json({
            success: true,
            data: users,
            count,
        })
    } catch (error: any) {
        console.error('Users fetch error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch users' },
            { status: 500 }
        )
    }
}
