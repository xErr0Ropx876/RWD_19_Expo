'use client'

import { useSession } from 'next-auth/react'
import { Search, BookOpen, Clock, TrendingUp, Star, FileText } from 'lucide-react'
import ResourceCard from '@/components/ui/resource-card'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function StudentDashboard() {
    const { data: session } = useSession()
    const [recentResources, setRecentResources] = useState<any[]>([])
    const [featuredResources, setFeaturedResources] = useState<any[]>([])
    const [stats, setStats] = useState({
        totalResources: 0,
        featuredCount: 0,
        totalViews: 0
    })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setIsLoading(true)
            // Fetch recent resources
            const recentRes = await fetch('/api/resources?limit=6&sort=newest')
            const recentData = await recentRes.json()
            if (recentData.success) {
                setRecentResources(recentData.data)
                setStats(prev => ({ ...prev, totalResources: recentData.total }))
            }

            // Fetch featured resources
            const featuredRes = await fetch('/api/resources?featured=true&limit=3')
            const featuredData = await featuredRes.json()
            if (featuredData.success) {
                setFeaturedResources(featuredData.data)
                setStats(prev => ({ ...prev, featuredCount: featuredData.total }))
            }

            // Calculate total views from recent data (approximation for now, or could require a separate aggregation API)
            // For now, let's just use what we have in the recent list to not make extra heavy calls
            // actually stats.totalResources is better.

        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Welcome Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary mb-2">
                        Welcome back, {session?.user.name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-gray-600">
                        Explore the latest educational resources and materials.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-2">
                            <BookOpen className="w-8 h-8 text-blue-500" />
                            <span className="text-2xl font-bold text-gray-900">{stats.totalResources}</span>
                        </div>
                        <div className="text-gray-600 text-sm">Total Resources Available</div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-2">
                            <Clock className="w-8 h-8 text-green-500" />
                            <span className="text-2xl font-bold text-gray-900">{recentResources.length}</span>
                        </div>
                        <div className="text-gray-600 text-sm">New This Week</div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-2">
                            <Star className="w-8 h-8 text-accent" />
                            <span className="text-2xl font-bold text-gray-900">{stats.featuredCount}</span>
                        </div>
                        <div className="text-gray-600 text-sm">Featured Resources</div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for resources, courses, notes..."
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                        <span className="text-sm text-gray-600">Popular:</span>
                        {['Data Structures', 'Calculus', 'Web Development', 'Physics'].map((tag) => (
                            <Link
                                key={tag}
                                href={`/resources?search=${tag}`}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-accent hover:text-white transition-colors"
                            >
                                {tag}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Recent Uploads (Previously My Resources) */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-primary">Recently Added</h2>
                        <Link href="/resources" className="text-accent font-semibold hover:underline">
                            Browse All →
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentResources.slice(0, 6).map((resource) => (
                            <ResourceCard key={resource._id} resource={resource} />
                        ))}

                        {recentResources.length === 0 && (
                            <div className="col-span-full text-center py-10 bg-white rounded-xl shadow-sm">
                                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No resources found yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Featured / Recommended */}
                {featuredResources.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-primary mb-6">Featured Resources</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {featuredResources.map((resource) => (
                                <ResourceCard key={resource._id} resource={resource} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
