'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react'

export default function Navigation() {
    const { data: session, status } = useSession()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-accent to-red-500 rounded-lg"></div>
                        <span className="text-xl font-bold text-primary">UniResources</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/" className="text-gray-700 hover:text-accent transition-colors font-medium">
                            Home
                        </Link>
                        <Link href="/resources" className="text-gray-700 hover:text-accent transition-colors font-medium">
                            Resources
                        </Link>
                        <Link href="/community" className="text-gray-700 hover:text-accent transition-colors font-medium">
                            Community
                        </Link>
                        {session && (
                            <>
                                <Link href="/dashboard" className="text-gray-700 hover:text-accent transition-colors font-medium">
                                    Dashboard
                                </Link>
                                {(session.user.role === 'tech' || session.user.role === 'admin') && (
                                    <Link href="/dashboard/tech" className="text-gray-700 hover:text-accent transition-colors font-medium">
                                        Tech Dashboard
                                    </Link>
                                )}
                                {session.user.role === 'admin' && (
                                    <Link href="/dashboard/admin" className="text-gray-700 hover:text-accent transition-colors font-medium">
                                        Admin Panel
                                    </Link>
                                )}
                            </>
                        )}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        {status === 'loading' ? (
                            <div className="w-20 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                        ) : session ? (
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                                    <User className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-700">{session.user.name}</span>
                                    <span className="text-xs px-2 py-0.5 bg-accent/20 text-accent rounded-full">
                                        {session.user.role}
                                    </span>
                                </div>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-red-600 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-gray-700 hover:text-accent transition-colors font-medium"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="px-6 py-2 bg-gradient-to-r from-accent to-red-500 text-white rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-semibold"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200 animate-slide-up">
                        <div className="flex flex-col space-y-4">
                            <Link
                                href="/"
                                className="text-gray-700 hover:text-accent transition-colors font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link
                                href="/resources"
                                className="text-gray-700 hover:text-accent transition-colors font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Resources
                            </Link>
                            <Link
                                href="/community"
                                className="text-gray-700 hover:text-accent transition-colors font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Community
                            </Link>
                            {session && (
                                <>
                                    <Link
                                        href="/dashboard"
                                        className="text-gray-700 hover:text-accent transition-colors font-medium"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                    {(session.user.role === 'tech' || session.user.role === 'admin') && (
                                        <Link
                                            href="/dashboard/tech"
                                            className="text-gray-700 hover:text-accent transition-colors font-medium"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Tech Dashboard
                                        </Link>
                                    )}
                                    {session.user.role === 'admin' && (
                                        <Link
                                            href="/dashboard/admin"
                                            className="text-gray-700 hover:text-accent transition-colors font-medium"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Admin Panel
                                        </Link>
                                    )}
                                </>
                            )}
                            <div className="pt-4 border-t border-gray-200">
                                {session ? (
                                    <>
                                        <div className="mb-3 p-3 bg-gray-100 rounded-lg">
                                            <div className="font-medium text-gray-900">{session.user.name}</div>
                                            <div className="text-sm text-gray-600">{session.user.email}</div>
                                            <span className="inline-block mt-2 text-xs px-2 py-1 bg-accent/20 text-accent rounded-full">
                                                {session.user.role}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                signOut({ callbackUrl: '/' })
                                                setMobileMenuOpen(false)
                                            }}
                                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Logout</span>
                                        </button>
                                    </>
                                ) : (
                                    <div className="space-y-2">
                                        <Link
                                            href="/login"
                                            className="block text-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            href="/signup"
                                            className="block text-center px-6 py-2 bg-gradient-to-r from-accent to-red-500 text-white rounded-lg font-semibold"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Get Started
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
