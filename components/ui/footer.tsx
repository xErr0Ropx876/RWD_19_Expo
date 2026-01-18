'use client'

import Link from 'next/link'
import { Github, Twitter, Linkedin, Mail } from 'lucide-react'
import { useEffect, useState } from 'react'

interface FolderData {
    _id: string
    name: string
}

export default function Footer() {
    const [folders, setFolders] = useState<FolderData[]>([])
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
                setFolders(result.data.slice(0, 4)) // Show max 4 folders
            }
        } catch (error) {
            console.error('Error fetching folders:', error)
        }
    }

    return (
        <footer className="bg-primary text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-accent to-red-500 rounded-lg"></div>
                            <span className="text-xl font-bold">UniResources</span>
                        </div>
                        <p className="text-white/70 text-sm">
                            Your university's central hub for educational resources, courses, and learning materials.
                        </p>
                    </div>

                    {/* Resources */}
                    <div>
                        <h3 className="font-bold mb-4">Resources</h3>
                        <ul className="space-y-2 text-white/70 text-sm">
                            {!mounted ? (
                                <li className="text-white/50">Loading...</li>
                            ) : folders.length > 0 ? (
                                folders.map((folder) => (
                                    <li key={folder._id}>
                                        <Link href={`/resources?folder=${folder._id}`} className="hover:text-accent transition-colors">
                                            {folder.name}
                                        </Link>
                                    </li>
                                ))
                            ) : (
                                <li className="text-white/50">No resources yet</li>
                            )}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-bold mb-4">Support</h3>
                        <ul className="space-y-2 text-white/70 text-sm">
                            <li>
                                <Link href="/about" className="hover:text-accent transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-accent transition-colors">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="hover:text-accent transition-colors">
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link href="/help" className="hover:text-accent transition-colors">
                                    Help Center
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="font-bold mb-4">Legal</h3>
                        <ul className="space-y-2 text-white/70 text-sm">
                            <li>
                                <Link href="/privacy" className="hover:text-accent transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="hover:text-accent transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/cookies" className="hover:text-accent transition-colors">
                                    Cookie Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between">
                    <p className="text-white/70 text-sm mb-4 md:mb-0">
                        © 2026 UniResources Hub. All rights reserved.
                    </p>

                    <div className="flex items-center space-x-4">
                        <a href="https://github.com" className="text-white/70 hover:text-accent transition-colors">
                            <Github className="w-5 h-5" />
                        </a>
                        <a href="https://twitter.com" className="text-white/70 hover:text-accent transition-colors">
                            <Twitter className="w-5 h-5" />
                        </a>
                        <a href="https://linkedin.com" className="text-white/70 hover:text-accent transition-colors">
                            <Linkedin className="w-5 h-5" />
                        </a>
                        <a href="mailto:support@uniresources.com" className="text-white/70 hover:text-accent transition-colors">
                            <Mail className="w-5 h-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
