import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/db/mongodb'
import Folder from '@/lib/models/Folder'
import Resource from '@/lib/models/Resource'

// Helper function to recursively count resources in folder and all subfolders
async function getRecursiveResourceCount(folderId: string): Promise<number> {
    const directCount = await Resource.countDocuments({ folder: folderId })
    const subfolders = await Folder.find({ parentFolder: folderId }).lean()
    let subfoldersCount = 0
    for (const subfolder of subfolders) {
        subfoldersCount += await getRecursiveResourceCount(String(subfolder._id))
    }
    return directCount + subfoldersCount
}

// GET /api/folders/[id] - Get folder details with contents
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB()

        const { id } = await params

        const folder = await Folder.findById(id)
            .populate('createdBy', 'name')
            .lean()

        if (!folder) {
            return NextResponse.json(
                { success: false, error: 'Folder not found' },
                { status: 404 }
            )
        }

        // Get subfolders with recursive counts
        const subfolders = await Folder.find({ parentFolder: id })
            .sort({ order: 1, name: 1 })
            .lean()

        // Add recursive resource counts to each subfolder
        const subfoldersWithCounts = await Promise.all(
            subfolders.map(async (subfolder: any) => {
                const resourceCount = await getRecursiveResourceCount(String(subfolder._id))
                return {
                    ...subfolder,
                    resourceCount,
                }
            })
        )

        // Get resources in this folder
        const resources = await Resource.find({ folder: id })
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 })
            .lean()

        return NextResponse.json({
            success: true,
            data: {
                ...folder,
                subfolders: subfoldersWithCounts,
                resources,
            },
        })
    } catch (error: any) {
        console.error('Folder GET error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch folder' },
            { status: 500 }
        )
    }
}

// PUT /api/folders/[id] - Update folder (rename, reorder)
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'tech') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            )
        }

        await connectDB()

        const { id } = await params
        const body = await req.json()
        const { name, icon, order } = body

        const folder = await Folder.findById(id)

        if (!folder) {
            return NextResponse.json(
                { success: false, error: 'Folder not found' },
                { status: 404 }
            )
        }

        // Update allowed fields
        if (name) folder.name = name.trim()
        if (icon) folder.icon = icon
        if (order !== undefined) folder.order = order

        await folder.save()
        await folder.populate('createdBy', 'name')

        return NextResponse.json({
            success: true,
            message: 'Folder updated successfully',
            data: folder,
        })
    } catch (error: any) {
        console.error('Folder update error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update folder' },
            { status: 500 }
        )
    }
}

// DELETE /api/folders/[id] - Delete folder (only if empty)
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'tech') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            )
        }

        await connectDB()

        const { id } = await params

        // Check if folder has subfolders
        const subfoldersCount = await Folder.countDocuments({ parentFolder: id })

        if (subfoldersCount > 0) {
            return NextResponse.json(
                { success: false, error: 'Cannot delete folder with subfolders. Delete or move subfolders first.' },
                { status: 400 }
            )
        }

        // Check if folder has resources
        const resourcesCount = await Resource.countDocuments({ folder: id })

        if (resourcesCount > 0) {
            return NextResponse.json(
                { success: false, error: `Cannot delete folder with ${resourcesCount} resources. Delete or move resources first.` },
                { status: 400 }
            )
        }

        await Folder.findByIdAndDelete(id)

        return NextResponse.json({
            success: true,
            message: 'Folder deleted successfully',
        })
    } catch (error: any) {
        console.error('Folder delete error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete folder' },
            { status: 500 }
        )
    }
}
