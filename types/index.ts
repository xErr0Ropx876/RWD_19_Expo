export type UserRole = 'tech' | 'student'

export interface User {
    _id: string
    name: string
    email: string
    role: UserRole
    preferences?: {
        theme?: 'light' | 'dark'
        notifications?: boolean
    }
    enrolledResources: string[]
    recentViews: {
        resourceId: string
        viewedAt: Date
    }[]
    createdAt: Date
    updatedAt: Date
}

export type Category = 'CS Notes' | 'Math Tutorials' | 'Videos' | 'PDFs'

export interface Resource {
    _id: string
    title: string
    description: string
    fileUrl: string
    thumbnailUrl?: string
    category: Category
    tags: string[]
    uploadedBy: User | string
    views: number
    enrollments: number
    featured: boolean
    createdAt: Date
    updatedAt: Date
}

export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
    message?: string
}

export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    totalPages: number
}

export interface SearchFilters {
    category?: Category
    tags?: string[]
    search?: string
    sort?: 'newest' | 'views' | 'enrollments'
}
