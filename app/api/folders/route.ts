import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
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

async function getRecursiveFolderCount(folderId: string): Promise<number> {
    // Find all subfolders
    const subfolders = await Folder.find({ parentFolder: folderId }).lean()

    let count = subfolders.length

    // Recursively count sub-sub folders
    for (const subfolder of subfolders) {
        count += await getRecursiveFolderCount(String(subfolder._id))
    }

    return count
}

// GET /api/folders - List all folders or get folder tree
export async function GET(req: NextRequest) {
    try {
        await connectDB()

        const { searchParams } = new URL(req.url)
        const parentId = searchParams.get('parent')
        const treeView = searchParams.get('tree') === 'true'

        if (treeView) {
            // Return complete folder tree
            const folders = await Folder.find({})
                .populate('createdBy', 'name')
                .sort({ order: 1, name: 1 })
                .lean()

            // Build tree structure
            const buildTree = (parentId: string | null = null): any[] => {
                return folders
                    .filter((folder: any) =>
                        String(folder.parentFolder) === String(parentId)
                    )
                    .map((folder: any) => ({
                        ...folder,
                        children: buildTree(folder._id),
                    }))
            }

            const tree = buildTree(null)

            return NextResponse.json({
                success: true,
                data: tree,
            })
        }

        // Return folders in specific parent (or root if no parent)
        const query = parentId && parentId !== 'null' ? { parentFolder: parentId } : { parentFolder: null }

        const folders = await Folder.find(query)
            .populate('createdBy', 'name')
            .sort({ order: 1, name: 1 })
            .lean()

        // Count resources in each folder (recursively - including all subfolders)
        const foldersWithCounts = await Promise.all(
            folders.map(async (folder: any) => {
                try {
                    const resourceCount = await getRecursiveResourceCount(String(folder._id))

                    // Simple count of direct subfolders for now, or recursive?
                    // "no. folders along with the files" - usually implies direct or total contained.
                    // Let's do a recursive count of all folders inside.
                    const subfolderCount = await getRecursiveFolderCount(String(folder._id))

                    return {
                        ...folder,
                        resourceCount,
                        subfolderCount
                    }
                } catch (error) {
                    console.error(`Error counting stats for folder ${folder._id}:`, error)
                    return {
                        ...folder,
                        resourceCount: 0,
                        subfolderCount: 0
                    }
                }
            })
        )

        return NextResponse.json({
            success: true,
            data: foldersWithCounts,
        })
    } catch (error: any) {
        console.error('Folders GET error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch folders' },
            { status: 500 }
        )
    }
}

// POST /api/folders - Create new folder
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'tech') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized. Tech team access required.' },
                { status: 403 }
            )
        }

        await connectDB()

        const body = await req.json()
        const { name, type, parentFolder, icon, order } = body

        if (!name || !name.trim()) {
            return NextResponse.json(
                { success: false, error: 'Folder name is required' },
                { status: 400 }
            )
        }

        // Check if folder with same name exists in same parent
        const existing = await Folder.findOne({
            name: name.trim(),
            parentFolder: parentFolder || null,
        })

        if (existing) {
            return NextResponse.json(
                { success: false, error: 'A folder with this name already exists in this location' },
                { status: 409 }
            )
        }

        const folder = await Folder.create({
            name: name.trim(),
            type: type || 'custom',
            parentFolder: parentFolder || null,
            createdBy: session.user.id,
            icon: icon || '📁',
            order: order || 0,
        })

        await folder.populate('createdBy', 'name')

        return NextResponse.json({
            success: true,
            message: 'Folder created successfully',
            data: folder,
        }, { status: 201 })
    } catch (error: any) {
        console.error('Folder creation error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create folder' },
            { status: 500 }
        )
    }
}
