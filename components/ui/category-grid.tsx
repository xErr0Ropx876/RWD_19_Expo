'use client'

import Link from 'next/link'
import { BookOpen, Video, FileText, Calculator, Folder } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface FolderData {
    _id: string
    name: string
    type: string
    icon: string
    resourceCount?: number
}

const getColorForIndex = (index: number) => {
    const colors = [
        'from-blue-500 to-blue-600',
        'from-green-500 to-green-600',
        'from-purple-500 to-purple-600',
        'from-orange-500 to-orange-600',
        'from-red-500 to-red-600',
        'from-indigo-500 to-indigo-600',
        'from-pink-500 to-pink-600',
        'from-teal-500 to-teal-600',
    ]
    return colors[index % colors.length]
}

export default function CategoryGrid() {
    const [folders, setFolders] = useState<FolderData[]>([])
    const [loading, setLoading] = useState(true)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        fetchFolders()
    }, [])

    const fetchFolders = async () => {
        try {
            const response = await fetch('/api/folders?parent=null')
            const result = await response.json()

            if (result.success) {
                setFolders(result.data.slice(0, 8)) // Show max 8 folders
            }
        } catch (error) {
            console.error('Error fetching folders:', error)
        } finally {
            setLoading(false)
        }
    }

    if (!mounted || loading) {
        return (
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full mx-auto"></div>
                    </div>
                </div>
            </section>
        )
    }

    if (folders.length === 0) {
        return null // Don't show section if no folders
    }

    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                        Browse by Category
                    </h2>
                    <p className="text-gray-600 text-lg">
                        Find the right resources for your courses
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {folders.map((folder, index) => (
                        <motion.div
                            key={folder._id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                        >
                            <Link
                                href={`/resources?folder=${folder._id}`}
                                className="group block"
                            >
                                <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                                    <div className={`w-16 h-16 bg-gradient-to-br ${getColorForIndex(index)} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <span className="text-3xl">{folder.icon || '📁'}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-accent transition-colors">
                                        {folder.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4">
                                        {folder.resourceCount || 0} files
                                    </p>
                                    <div className="text-accent font-semibold flex items-center space-x-2 group-hover:translate-x-2 transition-transform">
                                        <span>Explore</span>
                                        <span>→</span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
