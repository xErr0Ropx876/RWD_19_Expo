'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, Filter, TrendingUp, Clock, MessageSquare } from 'lucide-react'
import PostCard from '@/components/community/post-card'
import CreatePostModal from '@/components/community/create-post-modal'
import CommentSection from '@/components/community/comment-section'

const categories = ['All', 'Discussion', 'Question', 'Study Tips', 'Project Showcase', 'News', 'General']

export default function CommunityPage() {
    const { data: session } = useSession()
    const [posts, setPosts] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [sortBy, setSortBy] = useState('newest')
    const [selectedPostForComments, setSelectedPostForComments] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

    // Fetch posts from API
    const fetchPosts = async () => {
        try {
            setIsLoading(true)
            const params = new URLSearchParams({
                category: selectedCategory,
                search: searchQuery,
                sort: sortBy,
            })

            const response = await fetch(`/api/community/posts?${params}`)
            const result = await response.json()

            if (result.success) {
                setPosts(result.data)
            }
        } catch (error) {
            console.error('Error fetching posts:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchPosts()
    }, [selectedCategory, sortBy, searchQuery])

    const handlePostCreated = () => {
        // Refresh posts after creating new one
        fetchPosts()
    }

    const handleLike = async (postId: string) => {
        if (!session) return

        try {
            const response = await fetch(`/api/community/posts/${postId}/like`, {
                method: 'POST',
            })

            const result = await response.json()

            if (result.success) {
                // Update local state optimistically
                setPosts(posts.map(post => {
                    if (post._id === postId) {
                        return {
                            ...post,
                            likes: result.liked
                                ? [...post.likes, session.user.id]
                                : post.likes.filter((id: string) => id !== session.user.id)
                        }
                    }
                    return post
                }))
            }
        } catch (error) {
            console.error('Like error:', error)
        }
    }

    const handleCommentAdded = () => {
        // Refresh posts to get updated comment counts
        fetchPosts()
    }

    const handleCommentClick = (postId: string) => {
        setSelectedPostForComments(postId)
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-bold text-primary mb-2">Community</h1>
                            <p className="text-gray-600 text-lg">
                                Connect, discuss, and learn with fellow students
                            </p>
                        </div>
                        {session && (
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-accent to-red-500 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-semibold"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Create Post</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar - Filters */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                                <Filter className="w-5 h-5" />
                                <span>Filters</span>
                            </h3>

                            {/* Categories */}
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Categories</h4>
                                <div className="space-y-2">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedCategory === cat
                                                    ? 'bg-accent text-white'
                                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sort */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Sort By</h4>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setSortBy('newest')}
                                        className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${sortBy === 'newest'
                                                ? 'bg-accent text-white'
                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Clock className="w-4 h-4" />
                                        <span>Newest</span>
                                    </button>
                                    <button
                                        onClick={() => setSortBy('popular')}
                                        className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${sortBy === 'popular'
                                                ? 'bg-accent text-white'
                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <TrendingUp className="w-4 h-4" />
                                        <span>Popular</span>
                                    </button>
                                    <button
                                        onClick={() => setSortBy('discussed')}
                                        className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${sortBy === 'discussed'
                                                ? 'bg-accent text-white'
                                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        <span>Most Discussed</span>
                                    </button>
                                </div>
                            </div>

                            {/* Community Stats */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Community Stats</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Total Posts</span>
                                        <span className="font-semibold text-gray-900">{posts.length}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Active Members</span>
                                        <span className="font-semibold text-gray-900">4</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Posts Today</span>
                                        <span className="font-semibold text-accent">
                                            {posts.filter(p => {
                                                const today = new Date().toDateString()
                                                return new Date(p.createdAt).toDateString() === today
                                            }).length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Posts Feed */}
                    <div className="lg:col-span-3">
                        {/* Search */}
                        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                            <input
                                type="text"
                                placeholder="Search posts, topics, or tags..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                            />
                        </div>

                        {/* Posts */}
                        <div className="space-y-6">
                            {isLoading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full mx-auto"></div>
                                    <p className="text-gray-600 mt-4">Loading posts...</p>
                                </div>
                            ) : posts.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">No posts found</h3>
                                    <p className="text-gray-600 mb-6">
                                        {selectedCategory !== 'All'
                                            ? `No posts in "${selectedCategory}" category yet.`
                                            : 'Be the first to start a discussion!'}
                                    </p>
                                    {session && (
                                        <button
                                            onClick={() => setIsCreateModalOpen(true)}
                                            className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
                                        >
                                            Create Post
                                        </button>
                                    )}
                                </div>
                            ) : (
                                posts.map((post) => (
                                    <PostCard
                                        key={post._id}
                                        post={post}
                                        onCommentClick={handleCommentClick}
                                        onLike={handleLike}
                                        currentUserId={session?.user.id}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreatePostModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onPostCreated={handlePostCreated}
            />

            {selectedPostForComments && (
                <CommentSection
                    postId={selectedPostForComments}
                    isOpen={!!selectedPostForComments}
                    onClose={() => setSelectedPostForComments(null)}
                    onCommentAdded={handleCommentAdded}
                />
            )}
        </div>
    )
}
