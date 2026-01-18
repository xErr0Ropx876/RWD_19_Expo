import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/db/mongodb'
import Post from '@/lib/models/Post'
import '@/lib/models/Comment' // Ensure Comment model is registered

export async function GET(req: NextRequest) {
    try {
        await connectDB()

        const searchParams = req.nextUrl.searchParams
        const category = searchParams.get('category')
        const search = searchParams.get('search')
        const sort = searchParams.get('sort') || 'newest'
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')

        // Build query
        const query: any = {}

        if (category && category !== 'All') {
            query.category = category
        }

        if (search) {
            query.$text = { $search: search }
        }

        // Build sort
        let sortQuery: any = { createdAt: -1 } // newest by default
        if (sort === 'popular') {
            sortQuery = { likes: -1 }
        } else if (sort === 'discussed') {
            sortQuery = { comments: -1 }
        }

        // Execute query with pagination
        const skip = (page - 1) * limit
        const posts = await Post.find(query)
            .sort(sortQuery)
            .skip(skip)
            .limit(limit)
            .populate('author', 'name email role')
            .populate({
                path: 'comments',
                options: { limit: 3 },
                populate: { path: 'author', select: 'name' }
            })

        const total = await Post.countDocuments(query)

        return NextResponse.json({
            success: true,
            data: posts,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        })
    } catch (error: any) {
        console.error('Posts fetch error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch posts' },
            { status: 500 }
        )
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        await connectDB()

        const body = await req.json()
        const { title, content, category, tags, imageUrl } = body

        // Validation
        if (!title || !content) {
            return NextResponse.json(
                { success: false, error: 'Title and content are required' },
                { status: 400 }
            )
        }

        // Create post
        const post = await Post.create({
            author: session.user.id,
            title,
            content,
            category: category || 'General',
            tags: tags || [],
            imageUrl,
            likes: [],
            comments: [],
        })

        await post.populate('author', 'name email role')

        return NextResponse.json(
            {
                success: true,
                message: 'Post created successfully',
                data: post,
            },
            { status: 201 }
        )
    } catch (error: any) {
        console.error('Post creation error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create post' },
            { status: 500 }
        )
    }
}
