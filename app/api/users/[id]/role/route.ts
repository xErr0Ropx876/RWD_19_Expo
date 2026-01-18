
import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import User from '@/lib/models/User'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> } // Corrected context type for Next.js 15+
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
        const { role } = body

        if (!role || !['student', 'tech'].includes(role)) {
            return NextResponse.json(
                { success: false, error: 'Invalid role' },
                { status: 400 }
            )
        }

        await connectDB()

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true }
        ).select('_id name email role image')

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
        console.error('Role update error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update user role' },
            { status: 500 }
        )
    }
}
