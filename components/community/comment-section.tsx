'use client'

import { useState, useEffect } from 'react'
import { Send, ThumbsUp } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useSession } from 'next-auth/react'

interface Comment {
    _id: string
    author: {
        _id?: string
        name: string
        role: string
    }
    content: string
    likes: string[]
    replies: Comment[]
    createdAt: string
}

interface CommentSectionProps {
    postId: string
    isOpen: boolean
    onClose: () => void
    onCommentAdded: () => void
}

export default function CommentSection({ postId, isOpen, onClose, onCommentAdded }: CommentSectionProps) {
    const { data: session } = useSession()
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (isOpen && postId) {
            fetchComments()
        }
    }, [isOpen, postId])

    const fetchComments = async () => {
        try {
            setIsLoading(true)
            const response = await fetch(`/api/community/posts/${postId}/comments`)
            const result = await response.json()

            if (result.success) {
                setComments(result.data)
            }
        } catch (error) {
            console.error('Fetch comments error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!newComment.trim() || !session) return

        try {
            setIsSubmitting(true)

            const response = await fetch(`/api/community/posts/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment }),
            })

            const result = await response.json()

            if (result.success) {
                setNewComment('')
                fetchComments() // Refresh comments
                onCommentAdded() // Notify parent to update post
            }
        } catch (error) {
            console.error('Comment submit error:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => (
        <div className={`${isReply ? 'ml-12' : ''} mb-4`}>
            <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-accent to-red-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    {comment.author.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-gray-900 text-sm">{comment.author.name}</span>
                        <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs rounded-full">
                            {comment.author.role}
                        </span>
                        <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">{comment.content}</p>
                    <div className="flex items-center space-x-4 text-xs">
                        <button className="text-gray-600 hover:text-accent transition-colors flex items-center space-x-1">
                            <ThumbsUp className="w-3 h-3" />
                            <span>{comment.likes.length}</span>
                        </button>
                        <button className="text-gray-600 hover:text-accent transition-colors">
                            Reply
                        </button>
                    </div>
                </div>
            </div>

            {/* Nested replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3">
                    {comment.replies.map((reply) => (
                        <CommentItem key={reply._id} comment={reply} isReply />
                    ))}
                </div>
            )}
        </div>
    )

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-primary">Comments</h2>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full mx-auto"></div>
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No comments yet. Be the first to comment!
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {comments.map((comment: Comment) => (
                                <CommentItem key={comment._id} comment={comment} />
                            ))}
                        </div>
                    )}
                </div>

                {session && (
                    <div className="p-6 border-t border-gray-200">
                        <form onSubmit={handleSubmitComment} className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-accent to-red-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                                Y
                            </div>
                            <div className="flex-1">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a comment..."
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none resize-none"
                                    maxLength={2000}
                                />
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-gray-500">{newComment.length}/2000</span>
                                    <button
                                        type="submit"
                                        disabled={!newComment.trim() || isSubmitting}
                                        className="flex items-center space-x-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send className="w-4 h-4" />
                                        <span>{isSubmitting ? 'Posting...' : 'Post'}</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}
