'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Eye, BookmarkPlus } from 'lucide-react'
import { getCategoryColor, truncateText } from '@/lib/utils'
import type { Resource } from '@/types'

interface ResourceCardProps {
    resource: Resource
}

export default function ResourceCard({ resource }: ResourceCardProps) {
    const categoryColor = getCategoryColor(resource.category)

    return (
        <Link href={`/resources/${resource._id}`} className="group block">
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                {/* Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-primary to-purple-900 overflow-hidden">
                    {resource.thumbnailUrl ? (
                        <Image
                            src={resource.thumbnailUrl}
                            alt={resource.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-white/30 text-6xl font-bold">
                                {resource.category === 'Videos' ? '▶' : '📄'}
                            </div>
                        </div>
                    )}
                    {resource.featured && (
                        <div className="absolute top-3 right-3 px-3 py-1 bg-accent text-white text-xs font-bold rounded-full">
                            Featured
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className={`px-3 py-1 ${categoryColor} text-white text-xs font-semibold rounded-full`}>
                            {resource.category}
                        </span>
                        <div className="flex items-center space-x-3 text-gray-500 text-sm">
                            <div className="flex items-center space-x-1">
                                <Eye className="w-4 h-4" />
                                <span>{resource.views}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <BookmarkPlus className="w-4 h-4" />
                                <span>{resource.enrollments}</span>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-accent transition-colors">
                        {truncateText(resource.title, 60)}
                    </h3>

                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {truncateText(resource.description, 120)}
                    </p>

                    {/* Tags */}
                    {resource.tags && resource.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {resource.tags.slice(0, 3).map((tag, index) => (
                                <span
                                    key={index}
                                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                                >
                                    #{tag}
                                </span>
                            ))}
                            {resource.tags.length > 3 && (
                                <span className="px-2 py-1 text-gray-400 text-xs">
                                    +{resource.tags.length - 3} more
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    )
}
