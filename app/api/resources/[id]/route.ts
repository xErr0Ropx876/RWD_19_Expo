import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Resource from '@/lib/models/Resource'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import '@/lib/models/Folder' // Ensure Folder model is registered

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB()

        const { id } = await params

        const resource = await Resource.findById(id)
            .populate('uploadedBy', 'name email')
            .populate('folder', 'name type')
            .lean() as any

        if (!resource) {
            return NextResponse.json(
                { success: false, error: 'Resource not found' },
                { status: 404 }
            )
        }

        // Map folder name to category for frontend compatibility
        if (resource.folder && resource.folder.name) {
            resource.category = resource.folder.name
        }

        // Increment views in background (using separate update to avoid blocking response too much, or just await it)
        try {
            await Resource.findByIdAndUpdate(id, { $inc: { views: 1 } })
        } catch (err) {
            console.error('Failed to increment views:', err)
        }

        return NextResponse.json({ success: true, data: resource })
    } catch (error: any) {
        console.error('Error fetching resource:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch resource' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'tech') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        await connectDB()

        const { id } = await params

        console.log('DELETE Resource - ID received:', id)

        const resource = await Resource.findById(id)

        console.log('DELETE Resource - Found:', resource ? 'YES' : 'NO')

        if (!resource) {
            return NextResponse.json(
                { success: false, error: 'Resource not found' },
                { status: 404 }
            )
        }

        await Resource.findByIdAndDelete(id)

        console.log('DELETE Resource - Deleted successfully')

        return NextResponse.json({
            success: true,
            message: 'Resource deleted successfully',
        })
    } catch (error: any) {
        console.error('Resource deletion error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete resource' },
            { status: 500 }
        )
    }
}
