'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Eye, BookmarkPlus, Share2, FileText, ExternalLink } from 'lucide-react'
import { getCategoryColor } from '@/lib/utils'
import type { Resource } from '@/types'
import { useSession } from 'next-auth/react'

export default function ResourcePage() {
    const params = useParams()
    const { data: session } = useSession()
    const [resource, setResource] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [relatedResources, setRelatedResources] = useState<any[]>([])

    useEffect(() => {
        if (params.id) {
            fetchResource()
        }
    }, [params.id])

    const fetchResource = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/resources/${params.id}`)
            const result = await response.json()

            if (result.success) {
                setResource(result.data)
                // Fetch related resources (same category/folder)
                fetchRelatedResources(result.data.category)
            }
        } catch (error) {
            console.error('Error fetching resource:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchRelatedResources = async (category: string) => {
        try {
            const response = await fetch(`/api/resources?limit=3`)
            const result = await response.json()
            if (result.success) {
                setRelatedResources(result.data.filter((r: any) => r._id !== params.id).slice(0, 3))
            }
        } catch (error) {
            console.error('Error fetching related resources:', error)
        }
    }

    const getFileType = (url: string) => {
        if (!url) return 'unknown'
        const extension = url.split('.').pop()?.toLowerCase()
        if (['pdf'].includes(extension || '')) return 'pdf'
        if (['mp4', 'webm', 'ogg'].includes(extension || '')) return 'video'
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return 'image'
        if (['doc', 'docx'].includes(extension || '')) return 'document'
        return 'unknown'
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full"></div>
            </div>
        )
    }

    if (!resource) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Resource not found</h2>
                    <p className="text-gray-600">This resource doesn't exist or has been removed.</p>
                </div>
            </div>
        )
    }

    const categoryColor = getCategoryColor(resource.category)

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <div className="mb-6 text-sm text-gray-600">
                    <a href="/resources" className="hover:text-accent">Resources</a>
                    <span className="mx-2">/</span>
                    <span className={`px-2 py-1 ${categoryColor} text-white rounded`}>
                        {resource.category}
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Resource Header */}
                        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
                            {resource.featured && (
                                <div className="inline-block px-3 py-1 bg-accent/10 text-accent text-sm font-semibold rounded-full mb-4">
                                    ⭐ Featured Resource
                                </div>
                            )}

                            <h1 className="text-4xl font-bold text-primary mb-4">
                                {resource.title}
                            </h1>

                            <div className="flex items-center space-x-6 text-gray-600 mb-6">
                                <div className="flex items-center space-x-2">
                                    <Eye className="w-5 h-5" />
                                    <span>{resource.views.toLocaleString()} views</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <BookmarkPlus className="w-5 h-5" />
                                    <span>{resource.enrollments.toLocaleString()} enrolled</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {resource.tags?.map((tag: string, index: number) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            <div className="prose max-w-none mb-6">
                                <p className="text-gray-700 whitespace-pre-line">{resource.description}</p>
                            </div>

                            <div className="flex items-center space-x-4">
                                <a
                                    href={resource.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-8 py-3 bg-gradient-to-r from-accent to-red-500 text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                                >
                                    <FileText className="w-5 h-5" />
                                    <span>View File</span>
                                </a>
                                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                    <Share2 className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Preview/Embed Section */}
                        <div className="bg-white rounded-xl shadow-md p-8">
                            <h2 className="text-2xl font-bold text-primary mb-6">Resource Viewer</h2>

                            <div className="space-y-4">
                                {getFileType(resource.fileUrl) === 'pdf' && (
                                    <div className="border rounded-lg overflow-hidden" style={{ height: '600px' }}>
                                        <iframe
                                            src={resource.fileUrl}
                                            className="w-full h-full"
                                            title={resource.title}
                                        />
                                    </div>
                                )}

                                {getFileType(resource.fileUrl) === 'video' && (
                                    <div className="rounded-lg overflow-hidden">
                                        <video
                                            controls
                                            className="w-full"
                                            src={resource.fileUrl}
                                        >
                                            Your browser does not support the video tag.
                                        </video>
                                    </div>
                                )}

                                {getFileType(resource.fileUrl) === 'image' && (
                                    <div className="rounded-lg overflow-hidden">
                                        <img
                                            src={resource.fileUrl}
                                            alt={resource.title}
                                            className="w-full h-auto"
                                        />
                                    </div>
                                )}

                                {getFileType(resource.fileUrl) === 'document' && (
                                    <div className="border rounded-lg overflow-hidden" style={{ height: '600px' }}>
                                        <iframe
                                            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(resource.fileUrl)}`}
                                            className="w-full h-full"
                                            title={resource.title}
                                        />
                                    </div>
                                )}

                                {getFileType(resource.fileUrl) === 'unknown' && (
                                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                                        <div className="text-center text-gray-600">
                                            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                            <p className="text-lg mb-2">Unable to preview this file type</p>
                                            <a
                                                href={resource.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center space-x-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                <span>Open in New Tab</span>
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        {/* Resource Info */}
                        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                            <h3 className="text-lg font-bold text-primary mb-4">Resource Details</h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="text-gray-600">Category:</span>
                                    <span className={`ml-2 px-2 py-1 ${categoryColor} text-white rounded text-xs`}>
                                        {resource.category}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Uploaded:</span>
                                    <span className="ml-2 text-gray-900">
                                        {new Date(resource.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Last Updated:</span>
                                    <span className="ml-2 text-gray-900">
                                        {new Date(resource.updatedAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">By:</span>
                                    <span className="ml-2 text-gray-900 font-medium">
                                        {resource.uploadedBy?.name || 'Tech Team'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Related Resources */}
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <h3 className="text-lg font-bold text-primary mb-4">Related Resources</h3>
                            <div className="space-y-4">
                                {relatedResources.map((related) => (
                                    <a
                                        key={related._id}
                                        href={`/resources/${related._id}`}
                                        className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                                            {related.title}
                                        </h4>
                                        <div className="flex items-center space-x-3 text-xs text-gray-600">
                                            <span className="flex items-center space-x-1">
                                                <Eye className="w-3 h-3" />
                                                <span>{related.views}</span>
                                            </span>
                                            <span className="flex items-center space-x-1">
                                                <BookmarkPlus className="w-3 h-3" />
                                                <span>{related.enrollments}</span>
                                            </span>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
