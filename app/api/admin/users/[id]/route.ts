import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/db/mongodb'
import User from '@/lib/models/User'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        await connectDB()

        const { id } = await params
        const body = await req.json()
        const { role } = body

        // Validate role
        if (!['user', 'tech', 'admin'].includes(role)) {
            return NextResponse.json(
                { success: false, error: 'Invalid role' },
                { status: 400 }
            )
        }

        // Update user role
        const user = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true, select: '-password' }
        )

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'User role updated successfully',
            data: user,
        })
    } catch (error: any) {
        console.error('User role update error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update user role' },
            { status: 500 }
        )
    }
}
