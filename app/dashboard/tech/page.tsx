'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Upload, FileText, Users, Eye, TrendingUp, Edit, Trash2, Folder, FolderPlus, X, AlertTriangle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { resourceUploadSchema, type ResourceUploadInput } from '@/lib/validations'
import UserManagementModal from '@/components/tech/UserManagementModal'

interface FolderData {
    _id: string
    name: string
    type: string
    parentFolder?: string
    path?: string[]
    icon?: string
}

interface ResourceData {
    _id: string
    title: string
    description: string
    folder: string
    views: number
    enrollments: number
    createdAt: string
}

export default function TechDashboard() {
    const { data: session } = useSession()
    const [isUploading, setIsUploading] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState(false)
    const [uploadError, setUploadError] = useState('')
    const [folders, setFolders] = useState<FolderData[]>([])
    const [resources, setResources] = useState<ResourceData[]>([])
    const [loadingFolders, setLoadingFolders] = useState(true)
    const [loadingResources, setLoadingResources] = useState(true)
    const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<{ type: 'folder' | 'resource', id: string, name: string } | null>(null)
    const [creatingFolder, setCreatingFolder] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [newFolder, setNewFolder] = useState({
        name: '',
        type: 'custom',
        parentFolder: '',
        icon: '📁',
    })
    const [isUserModalOpen, setIsUserModalOpen] = useState(false)
    const [stats, setStats] = useState({
        totalResources: 0,
        totalViews: 0,
        totalEnrollments: 0,
        growth: 0,
    })
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [dragActive, setDragActive] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ResourceUploadInput>({
        resolver: zodResolver(resourceUploadSchema),
    })

    useEffect(() => {
        fetchFolders()
        fetchResources()
        fetchStats()
    }, [])

    const fetchFolders = async () => {
        try {
            setLoadingFolders(true)
            const response = await fetch('/api/folders?tree=true')
            const result = await response.json()
            if (result.success) {
                const flattenedFolders = flattenTree(result.data)
                setFolders(flattenedFolders)
            }
        } catch (error) {
            console.error('Error fetching folders:', error)
        } finally {
            setLoadingFolders(false)
        }
    }

    const fetchResources = async () => {
        try {
            setLoadingResources(true)
            const response = await fetch('/api/resources')
            const result = await response.json()
            if (result.success) {
                setResources(result.data.slice(0, 5)) // Get latest 5
            }
        } catch (error) {
            console.error('Error fetching resources:', error)
        } finally {
            setLoadingResources(false)
        }
    }

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/resources')
            const result = await response.json()
            if (result.success) {
                const totalResources = result.total || 0
                const totalViews = result.data.reduce((sum: number, r: ResourceData) => sum + r.views, 0)

                // Fetch user count
                const usersResponse = await fetch('/api/users')
                const usersResult = await usersResponse.json()
                const totalUsers = usersResult.success ? usersResult.count : 0

                setStats({
                    totalResources,
                    totalViews,
                    totalEnrollments: totalUsers, // Using this field for total users now
                    growth: 0,
                })
            }
        } catch (error) {
            console.error('Error fetching stats:', error)
        }
    }

    const flattenTree = (tree: any[], level = 0, parentPath: string[] = []): FolderData[] => {
        let result: FolderData[] = []
        for (const folder of tree) {
            // Use non-breaking spaces for visible indentation in select options
            const indent = '\u00A0\u00A0\u00A0\u00A0'.repeat(level)
            const prefix = level > 0 ? '└─ ' : ''

            result.push({
                _id: folder._id,
                name: indent + prefix + (folder.icon || '📁') + ' ' + folder.name,
                type: folder.type,
                parentFolder: folder.parentFolder,
                path: [...parentPath, folder.name],
                icon: folder.icon,
            })
            if (folder.children && folder.children.length > 0) {
                result = result.concat(flattenTree(folder.children, level + 1, [...parentPath, folder.name]))
            }
        }
        return result
    }

    const handleCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreatingFolder(true)

        try {
            const response = await fetch('/api/folders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newFolder.name,
                    type: newFolder.type,
                    parentFolder: newFolder.parentFolder || null,
                    icon: newFolder.icon,
                }),
            })

            const result = await response.json()

            if (result.success) {
                await fetchFolders()
                setShowCreateFolderModal(false)
                setNewFolder({ name: '', type: 'custom', parentFolder: '', icon: '📁' })
                alert('Folder created successfully!')
            } else {
                alert('Error creating folder: ' + result.error)
            }
        } catch (error) {
            console.error('Error creating folder:', error)
            alert('Failed to create folder')
        } finally {
            setCreatingFolder(false)
        }
    }

    const handleDeleteClick = (type: 'folder' | 'resource', id: string, name: string) => {
        setDeleteTarget({ type, id, name })
        setShowDeleteConfirm(true)
    }

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return

        setDeleting(true)
        try {
            const endpoint = deleteTarget.type === 'folder'
                ? `/api/folders/${deleteTarget.id}`
                : `/api/resources/${deleteTarget.id}`

            const response = await fetch(endpoint, { method: 'DELETE' })
            const result = await response.json()

            if (result.success) {
                if (deleteTarget.type === 'folder') {
                    await fetchFolders()
                } else {
                    await fetchResources()
                }
                setShowDeleteConfirm(false)
                setDeleteTarget(null)
                alert(`${deleteTarget.type === 'folder' ? 'Folder' : 'Resource'} deleted successfully!`)
            } else {
                alert('Error deleting: ' + result.error)
            }
        } catch (error) {
            console.error('Error deleting:', error)
            alert('Failed to delete')
        } finally {
            setDeleting(false)
        }
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0])
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0])
        }
    }

    const onSubmit = async (data: ResourceUploadInput) => {
        setIsUploading(true)
        setUploadError('')

        try {
            if (!selectedFile) {
                setUploadError('Please select a file to upload')
                setIsUploading(false)
                return
            }

            // Upload file first
            const formData = new FormData()
            formData.append('file', selectedFile)

            const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            const uploadResult = await uploadResponse.json()

            if (!uploadResult.success) {
                throw new Error(uploadResult.error || 'Failed to upload file')
            }

            const fileUrl = uploadResult.fileUrl

            // Create resource with real file URL
            const response = await fetch('/api/resources', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: data.title,
                    description: data.description,
                    fileUrl,
                    folder: data.folder,
                    tags: data.tags,
                    featured: data.featured,
                }),
            })

            const result = await response.json()

            if (result.success) {
                setUploadSuccess(true)
                reset()
                setSelectedFile(null) // Clear selected file
                await fetchResources() // Refresh the resources list

                setTimeout(() => {
                    setUploadSuccess(false)
                }, 3000)
            } else {
                setUploadError(result.error || 'Failed to create resource')
            }
        } catch (error: any) {
            console.error('Upload error:', error)
            setUploadError(error.message || 'Failed to upload resource. Please try again.')
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Welcome Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-primary mb-2">Tech Team Dashboard</h1>
                    <p className="text-gray-600">
                        Welcome back, <span className="font-semibold">{session?.user.name}</span>! Manage your resources and track engagement.
                    </p>
                </div>

                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-2">
                            <FileText className="w-8 h-8 text-blue-500" />
                            <span className="text-2xl font-bold text-gray-900">{stats.totalResources}</span>
                        </div>
                        <div className="text-gray-600 text-sm">Total Resources</div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-2">
                            <Eye className="w-8 h-8 text-green-500" />
                            <span className="text-2xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</span>
                        </div>
                        <div className="text-gray-600 text-sm">Total Views</div>
                    </div>

                    <div
                        className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setIsUserModalOpen(true)}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <Users className="w-8 h-8 text-purple-500" />
                            <span className="text-2xl font-bold text-gray-900">{stats.totalEnrollments.toLocaleString()}</span>
                        </div>
                        <div className="text-gray-600 text-sm">Total Users</div>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp className="w-8 h-8 text-accent" />
                            <span className="text-2xl font-bold text-gray-900">{stats.growth > 0 ? `+${stats.growth}%` : 'N/A'}</span>
                        </div>
                        <div className="text-gray-600 text-sm">Growth this month</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Upload Form */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <Upload className="w-6 h-6 text-accent" />
                                <h2 className="text-2xl font-bold text-primary">Upload New Resource</h2>
                            </div>
                            <button
                                onClick={() => setShowCreateFolderModal(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                                <FolderPlus className="w-5 h-5" />
                                <span className="hidden sm:inline">New Folder</span>
                            </button>
                        </div>

                        {uploadSuccess && (
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                                Resource uploaded successfully!
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                <input
                                    {...register('title')}
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                                    placeholder="e.g., Data Structures Complete Guide"
                                />
                                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    {...register('description')}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                                    placeholder="Describe the resource..."
                                />
                                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    File Upload
                                </label>
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${dragActive
                                        ? 'border-accent bg-accent/5 scale-105'
                                        : selectedFile
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-300 hover:border-accent/50'
                                        }`}
                                >
                                    <input
                                        type="file"
                                        id="file-upload"
                                        onChange={handleFileChange}
                                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar,.mp4,.mp3"
                                        className="hidden"
                                    />

                                    {selectedFile ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-center">
                                                <FileText className="w-12 h-12 text-green-500" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                                                <p className="text-sm text-gray-600">
                                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedFile(null)}
                                                className="text-sm text-red-600 hover:text-red-700 font-medium"
                                            >
                                                Remove file
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                                            <div>
                                                <label
                                                    htmlFor="file-upload"
                                                    className="cursor-pointer text-accent hover:text-red-600 font-semibold"
                                                >
                                                    Click to upload
                                                </label>
                                                <span className="text-gray-600"> or drag and drop</span>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                PDF, DOC, PPT, Excel, ZIP, or video files (up to 100MB)
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                                    <Folder className="w-4 h-4" />
                                    <span>Select Folder</span>
                                </label>
                                <select
                                    {...register('folder')}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none font-mono text-sm"
                                >
                                    <option value="">Select a folder</option>
                                    {folders.map((folder) => (
                                        <option key={folder._id} value={folder._id}>{folder.name}</option>
                                    ))}
                                </select>
                                {errors.folder && <p className="mt-1 text-sm text-red-600">{errors.folder.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                                <input
                                    {...register('tags', {
                                        setValueAs: (v) => (typeof v === 'string' && v) ? v.split(',').map((t: string) => t.trim()) : [],
                                    })}
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                                    placeholder="algorithms, data-structures, coding"
                                />
                            </div>

                            <div className="flex items-center">
                                <input {...register('featured')} type="checkbox" id="featured" className="w-4 h-4 text-accent border-gray-300 rounded" />
                                <label htmlFor="featured" className="ml-2 text-sm text-gray-700">Mark as featured</label>
                            </div>

                            <button
                                type="submit"
                                disabled={isUploading || uploadSuccess}
                                className={`w-full py-3 px-4 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 ${uploadSuccess
                                    ? 'bg-green-500 hover:bg-green-600 scale-105 shadow-lg'
                                    : 'bg-gradient-to-r from-accent to-red-500'
                                    }`}
                            >
                                {isUploading ? 'Uploading...' : uploadSuccess ? 'Upload Successful! 🎉' : 'Upload Resource'}
                            </button>
                        </form>
                    </div>

                    {/* Toast Notification */}
                    {uploadSuccess && (
                        <div className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-3 animate-bounce-in z-50">
                            <div className="bg-white/20 p-2 rounded-full">
                                <Upload className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold">Success!</h4>
                                <p className="text-green-50 text-sm">Resource uploaded successfully</p>
                            </div>
                            <button onClick={() => setUploadSuccess(false)} className="ml-4 hover:bg-white/10 p-1 rounded-full">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {/* Recent Uploads */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h2 className="text-2xl font-bold text-primary mb-6">Recent Uploads</h2>
                        {loadingResources ? (
                            <div className="text-center py-8 text-gray-500">Loading...</div>
                        ) : resources.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No resources yet</div>
                        ) : (
                            <div className="space-y-4">
                                {resources.map((resource) => (
                                    <div key={resource._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 mb-1">{resource.title}</h3>
                                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                <span className="flex items-center space-x-1">
                                                    <Eye className="w-4 h-4" />
                                                    <span>{resource.views}</span>
                                                </span>
                                                <span className="flex items-center space-x-1">
                                                    <Users className="w-4 h-4" />
                                                    <span>{resource.enrollments}</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleDeleteClick('resource', resource._id, resource.title)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete resource"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Folder Management Section */}
                <div className="mt-8 bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-2xl font-bold text-primary mb-6 flex items-center space-x-2">
                        <Folder className="w-6 h-6" />
                        <span>Manage Folders</span>
                    </h2>
                    {loadingFolders ? (
                        <div className="text-center py-8 text-gray-500">Loading...</div>
                    ) : (
                        <div className="max-h-[600px] overflow-y-auto pr-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {folders.map((folder) => (
                                    <div key={folder._id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-2xl">{folder.icon || '📁'}</span>
                                            <div>
                                                <p className="font-medium text-gray-900">{folder.name.trim()}</p>
                                                <p className="text-xs text-gray-500">{folder.type}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteClick('folder', folder._id, folder.name)}
                                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                            title="Delete folder"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Folder Modal */}
            {showCreateFolderModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-primary flex items-center space-x-2">
                                <FolderPlus className="w-6 h-6 text-accent" />
                                <span>Create New Folder</span>
                            </h3>
                            <button onClick={() => setShowCreateFolderModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateFolder} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Folder Name</label>
                                <input
                                    type="text"
                                    value={newFolder.name}
                                    onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent outline-none"
                                    placeholder="e.g., Sem 3, Algorithms"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                                <select
                                    value={newFolder.type}
                                    onChange={(e) => setNewFolder({ ...newFolder, type: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
                                >
                                    <option value="semester">Semester</option>
                                    <option value="course">Course</option>
                                    <option value="topic">Topic</option>
                                    <option value="custom">Custom</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Parent Folder</label>
                                <select
                                    value={newFolder.parentFolder}
                                    onChange={(e) => setNewFolder({ ...newFolder, parentFolder: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none font-mono text-sm"
                                >
                                    <option value="">None (Root Level)</option>
                                    {folders.map((folder) => (
                                        <option key={folder._id} value={folder._id}>{folder.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                                <div className="grid grid-cols-8 gap-2 mb-2">
                                    {['📚', '📁', '💻', '📊', '📐', '🔬', '⚡', '🌐'].map((emoji) => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => setNewFolder({ ...newFolder, icon: emoji })}
                                            className={`text-2xl p-2 rounded-lg ${newFolder.icon === emoji ? 'bg-accent text-white' : 'bg-gray-100'}`}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex space-x-3 pt-4">
                                <button type="button" onClick={() => setShowCreateFolderModal(false)} className="flex-1 py-2 border rounded-lg">
                                    Cancel
                                </button>
                                <button type="submit" disabled={creatingFolder} className="flex-1 py-2 bg-accent text-white rounded-lg">
                                    {creatingFolder ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && deleteTarget && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-3 bg-red-100 rounded-full">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Confirm Deletion</h3>
                        </div>

                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete <span className="font-semibold">"{deleteTarget.name}"</span>?
                            {deleteTarget.type === 'folder' && (
                                <span className="block mt-2 text-sm text-red-600">
                                    Note: You can only delete empty folders.
                                </span>
                            )}
                        </p>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false)
                                    setDeleteTarget(null)
                                }}
                                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={deleting}
                                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <UserManagementModal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
            />
        </div>
    )
}
