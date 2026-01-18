
import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import User from '@/lib/models/User'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function DELETE(
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

        await connectDB()

        const deletedUser = await User.findByIdAndDelete(id)

        if (!deletedUser) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'User deleted successfully',
        })
    } catch (error: any) {
        console.error('Delete user error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete user' },
            { status: 500 }
        )
    }
}
