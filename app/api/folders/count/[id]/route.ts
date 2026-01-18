import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Folder from '@/lib/models/Folder'
import Resource from '@/lib/models/Resource'

// Helper function to recursively count resources in folder and all subfolders
async function getRecursiveResourceCount(folderId: string): Promise<number> {
    // Count direct resources in this folder
    const directCount = await Resource.countDocuments({ folder: folderId })

    // Find all subfolders
    const subfolders = await Folder.find({ parentFolder: folderId }).lean()

    // Recursively count resources in each subfolder
    let subfoldersCount = 0
    for (const subfolder of subfolders) {
        subfoldersCount += await getRecursiveResourceCount(String(subfolder._id))
    }

    return directCount + subfoldersCount
}

// GET /api/folders/count/[id] - Get recursive resource count for a folder
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB()

        const { id } = await params

        const count = await getRecursiveResourceCount(id)

        return NextResponse.json({
            success: true,
            count,
        })
    } catch (error: any) {
        console.error('Resource count error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to count resources' },
            { status: 500 }
        )
    }
}
