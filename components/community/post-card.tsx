'use client'

import { ThumbsUp, MessageCircle, Share2, MoreHorizontal } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface PostCardProps {
    post: {
        _id: string
        author: {
            _id?: string
            name: string
            role: string
        }
        title: string
        content: string
        category: string
        tags: string[]
        likes: string[]
        comments: any[]
        createdAt: string
    }
    onCommentClick: (postId: string) => void
    onLike: (postId: string) => void
    currentUserId?: string
}

export default function PostCard({ post, onCommentClick, onLike, currentUserId }: PostCardProps) {
    const liked = currentUserId ? post.likes.includes(currentUserId) : false
    const likesCount = post.likes.length

    const handleLike = () => {
        if (!currentUserId) return
        onLike(post._id)
    }

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            Discussion: 'bg-blue-100 text-blue-700',
            Question: 'bg-purple-100 text-purple-700',
            'Study Tips': 'bg-green-100 text-green-700',
            'Project Showcase': 'bg-orange-100 text-orange-700',
            News: 'bg-red-100 text-red-700',
            General: 'bg-gray-100 text-gray-700',
        }
        return colors[category] || colors.General
    }

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {post.author.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                            <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs rounded-full">
                                {post.author.role}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
                    </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreHorizontal className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            {/* Category */}
            <div className="mb-3">
                <span className={`inline-block px-3 py-1 ${getCategoryColor(post.category)} rounded-full text-xs font-semibold`}>
                    {post.category}
                </span>
            </div>

            {/* Content */}
            <h2 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h2>
            <p className="text-gray-700 mb-4 whitespace-pre-wrap line-clamp-4">{post.content}</p>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-6 pt-4 border-t border-gray-200">
                <button
                    onClick={handleLike}
                    disabled={!currentUserId}
                    className={`flex items-center space-x-2 transition-colors ${liked
                        ? 'text-accent'
                        : 'text-gray-600 hover:text-accent'
                        } disabled:opacity-50`}
                >
                    <ThumbsUp className={`w-5 h-5 ${liked ? 'fill-accent' : ''}`} />
                    <span className="font-medium">{likesCount}</span>
                </button>

                <button
                    onClick={() => onCommentClick(post._id)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-accent transition-colors"
                >
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-medium">{post.comments.length}</span>
                </button>

                <button className="flex items-center space-x-2 text-gray-600 hover:text-accent transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span className="font-medium">Share</span>
                </button>
            </div>
        </div>
    )
}
