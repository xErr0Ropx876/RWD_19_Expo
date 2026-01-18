import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/db/mongodb'
import Resource from '@/lib/models/Resource'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function GET(req: NextRequest) {
    try {
        await connectDB()

        const searchParams = req.nextUrl.searchParams
        const category = searchParams.get('category')
        const search = searchParams.get('search')
        const featured = searchParams.get('featured')
        const sort = searchParams.get('sort') || 'newest'
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '12')

        // Build query
        const query: any = {}

        if (category) {
            query.category = category
        }

        if (featured === 'true') {
            query.featured = true
        }

        if (search) {
            query.$text = { $search: search }
        }

        // Build sort
        let sortQuery: any = { createdAt: -1 } // newest by default
        if (sort === 'views') {
            sortQuery = { views: -1 }
        } else if (sort === 'enrollments') {
            sortQuery = { enrollments: -1 }
        }

        // Execute query with pagination
        const skip = (page - 1) * limit
        const resources = await Resource.find(query)
            .sort(sortQuery)
            .skip(skip)
            .limit(limit)
            .populate('uploadedBy', 'name email')

        const total = await Resource.countDocuments(query)

        return NextResponse.json({
            success: true,
            data: resources,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        })
    } catch (error: any) {
        console.error('Resources fetch error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch resources' },
            { status: 500 }
        )
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== 'tech') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            )
        }

        await connectDB()

        const body = await req.json()
        const { title, description, fileUrl, thumbnailUrl, folder, tags, featured } = body

        // Validate required fields
        if (!title || !description || !fileUrl || !folder) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Create new resource
        const resource = await Resource.create({
            title: title.trim(),
            description: description.trim(),
            fileUrl,
            thumbnailUrl: thumbnailUrl || undefined,
            folder,
            tags: tags || [],
            uploadedBy: session.user.id,
            featured: featured || false,
            views: 0,
            enrollments: 0,
        })

        await resource.populate('uploadedBy', 'name email')

        return NextResponse.json({
            success: true,
            message: 'Resource created successfully',
            data: resource,
        })
    } catch (error: any) {
        console.error('Resource creation error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create resource' },
            { status: 500 }
        )
    }
}
