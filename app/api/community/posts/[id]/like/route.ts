import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/db/mongodb'
import Post from '@/lib/models/Post'

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const params = await context.params

        await connectDB()

        const post = await Post.findById(params.id)

        if (!post) {
            return NextResponse.json(
                { success: false, error: 'Post not found' },
                { status: 404 }
            )
        }

        const userId = session.user.id
        const hasLiked = post.likes.some((id) => id.toString() === userId)

        if (hasLiked) {
            // Unlike
            post.likes = post.likes.filter((id) => id.toString() !== userId)
        } else {
            // Like
            post.likes.push(userId as any)
        }

        await post.save()

        return NextResponse.json({
            success: true,
            liked: !hasLiked,
            likesCount: post.likes.length,
        })
    } catch (error: any) {
        console.error('Like post error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to like post' },
            { status: 500 }
        )
    }
}
