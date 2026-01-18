'use client'

import HeroSection from '@/components/ui/hero-section'
import CategoryGrid from '@/components/ui/category-grid'
import ResourceCard from '@/components/ui/resource-card'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Resource } from '@/types'

export default function HomePage() {
    const [featuredResources, setFeaturedResources] = useState<Resource[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchFeaturedResources()
    }, [])

    const fetchFeaturedResources = async () => {
        try {
            const response = await fetch('/api/resources?featured=true&limit=3')
            const result = await response.json()

            if (result.success && result.data.length > 0) {
                setFeaturedResources(result.data)
            }
        } catch (error) {
            console.error('Error fetching featured resources:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <HeroSection />

            {/* Featured Resources */}
            {!loading && featuredResources.length > 0 && (
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
                                Featured Resources
                            </h2>
                            <p className="text-gray-600 text-lg">
                                Hand-picked by our tech team for exceptional quality
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {featuredResources.map((resource) => (
                                <ResourceCard key={resource._id} resource={resource} />
                            ))}
                        </div>

                        <div className="text-center mt-10">
                            <Link
                                href="/resources"
                                className="inline-block px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-light transition-colors"
                            >
                                View All Resources
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            <CategoryGrid />



            {/* Final CTA */}
            <section className="py-20 bg-gradient-to-br from-primary via-blue-900 to-purple-900">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                            Ready to elevate your learning?
                        </h2>
                        <p className="text-xl text-white/90 mb-8">
                            Join UniResources Hub today and get access to all premium educational content.
                        </p>
                        <Link
                            href="/signup"
                            className="inline-block px-10 py-4 bg-white text-primary rounded-xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                        >
                            Get Started for Free
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
