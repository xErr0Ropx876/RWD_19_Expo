'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function HeroSection() {
    return (
        <section className="relative gradient-hero py-24 md:py-32 overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-20 left-10 w-64 h-64 bg-accent rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white mb-6"
                    >
                        <Sparkles className="w-4 h-4 text-accent" />
                        <span className="text-sm font-medium">Your University Learning Hub</span>
                    </motion.div>

                    {/* Main Heading */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
                    >
                        Level up your{' '}
                        <span className="bg-gradient-to-r from-accent via-yellow-300 to-red-400 bg-clip-text text-transparent">
                            uni studies
                        </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto"
                    >
                        Access curated courses, notes, videos, and resources shared by your university's tech team.
                        Everything you need in one place.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link
                            href="/signup"
                            className="group px-8 py-4 bg-white text-primary rounded-xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                        >
                            <span>Get Started Free</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/resources"
                            className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300"
                        >
                            Browse Resources
                        </Link>
                    </motion.div>

                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
                    >
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-white mb-1">500+</div>
                            <div className="text-sm text-white/70">Resources</div>
                        </div>
                        <div className="text-center border-x border-white/20">
                            <div className="text-3xl md:text-4xl font-bold text-white mb-1">10K+</div>
                            <div className="text-sm text-white/70">Students</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-white mb-1">50+</div>
                            <div className="text-sm text-white/70">Categories</div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
