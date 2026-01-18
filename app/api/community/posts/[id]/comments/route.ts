import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import connectDB from '@/lib/db/mongodb'
import Post from '@/lib/models/Post'
import Comment from '@/lib/models/Comment'

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

        const body = await req.json()
        const { content, parentCommentId } = body

        if (!content) {
            return NextResponse.json(
                { success: false, error: 'Comment content is required' },
                { status: 400 }
            )
        }

        // Create comment
        const comment = await Comment.create({
            author: session.user.id,
            post: params.id,
            content,
            parentComment: parentCommentId || null,
            likes: [],
            replies: [],
        })

        await comment.populate('author', 'name email role')

        // Add comment to post
        post.comments.push(comment._id as any)
        await post.save()

        // If reply, add to parent comment
        if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId)
            if (parentComment) {
                parentComment.replies.push(comment._id as any)
                await parentComment.save()
            }
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Comment added successfully',
                data: comment,
            },
            { status: 201 }
        )
    } catch (error: any) {
        console.error('Comment creation error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to add comment' },
            { status: 500 }
        )
    }
}

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB()

        const params = await context.params

        const comments = await Comment.find({ post: params.id, parentComment: null })
            .sort({ createdAt: -1 })
            .populate('author', 'name email role')
            .populate({
                path: 'replies',
                populate: { path: 'author', select: 'name email role' }
            })

        return NextResponse.json({
            success: true,
            data: comments,
        })
    } catch (error: any) {
        console.error('Comments fetch error:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch comments' },
            { status: 500 }
        )
    }
}
