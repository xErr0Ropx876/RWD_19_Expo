
import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import User from '@/lib/models/User'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || (session.user.role !== 'tech' && session.user.role !== 'admin')) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            )
        }

        const params = await context.params
        const { id } = params
        const body = await req.json()
        const { durationInMinutes } = body

        await connectDB()

        let bannedUntil: Date | null = null

        if (durationInMinutes && durationInMinutes > 0) {
            bannedUntil = new Date(Date.now() + durationInMinutes * 60 * 1000)
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { bannedUntil },
            { new: true }
        )

        if (!updatedUser) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            data: updatedUser,
        })
    } catch (error: any) {
        console.error('Ban user error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to ban user' },
            { status: 500 }
        )
    }
}
