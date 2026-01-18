'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Users, Search, Shield, UserCog, RefreshCw, Grid3x3, List, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import RoleAssignmentModal from '@/components/admin/role-assignment-modal'

interface UserData {
    _id: string
    name: string
    email: string
    role: 'user' | 'tech' | 'admin'
    createdAt: string
}

type ViewMode = 'discord' | 'table'

export default function AdminDashboard() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [users, setUsers] = useState<UserData[]>([])
    const [filteredUsers, setFilteredUsers] = useState<UserData[]>([])
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState<ViewMode>('discord')
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null)

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
        } else if (session?.user.role !== 'admin') {
            router.push('/dashboard')
        } else {
            fetchUsers()
        }
    }, [session, status, router])

    useEffect(() => {
        // Filter users based on search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            setFilteredUsers(
                users.filter(
                    (user) =>
                        user.name.toLowerCase().includes(query) ||
                        user.email.toLowerCase().includes(query)
                )
            )
        } else {
            setFilteredUsers(users)
        }
    }, [searchQuery, users])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/users')
            const result = await response.json()

            if (result.success) {
                setUsers(result.data)
                setFilteredUsers(result.data)
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            setUpdating(userId)
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            })

            const result = await response.json()

            if (result.success) {
                // Update local state
                setUsers((prev) =>
                    prev.map((user) =>
                        user._id === userId ? { ...user, role: newRole as any } : user
                    )
                )
            }
        } catch (error) {
            console.error('Error updating role:', error)
        } finally {
            setUpdating(null)
        }
    }

    const handleUserClick = (user: UserData) => {
        if (user._id !== session?.user.id) {
            setSelectedUser(user)
        }
    }

    const groupUsersByRole = () => {
        const grouped = {
            admin: filteredUsers.filter(u => u.role === 'admin'),
            tech: filteredUsers.filter(u => u.role === 'tech'),
            user: filteredUsers.filter(u => u.role === 'user'),
        }
        return grouped
    }

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin': return 'Administrators'
            case 'tech': return 'Tech Team'
            default: return 'Students'
        }
    }

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return Shield
            case 'tech': return UserCog
            default: return User
        }
    }

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'text-red-500'
            case 'tech': return 'text-blue-500'
            default: return 'text-gray-500'
        }
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800 border-red-300'
            case 'tech':
                return 'bg-blue-100 text-blue-800 border-blue-300'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300'
        }
    }

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full"></div>
            </div>
        )
    }

    if (session?.user.role !== 'admin') {
        return null
    }

    const groupedUsers = groupUsersByRole()

    return (
        <>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center space-x-3 mb-2">
                                    <Shield className="w-8 h-8 text-accent" />
                                    <h1 className="text-3xl font-bold text-primary">Admin Panel</h1>
                                </div>
                                <p className="text-gray-600">
                                    Manage user roles and permissions
                                </p>
                            </div>
                            
                            {/* View Toggle */}
                            <div className="flex items-center space-x-2 bg-white rounded-lg shadow-sm p-1">
                                <button
                                    onClick={() => setViewMode('discord')}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                                        viewMode === 'discord'
                                            ? 'bg-accent text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <Grid3x3 className="w-4 h-4" />
                                    <span className="font-medium">Member View</span>
                                </button>
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                                        viewMode === 'table'
                                            ? 'bg-accent text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    <List className="w-4 h-4" />
                                    <span className="font-medium">Table View</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <Users className="w-8 h-8 text-gray-500" />
                                <span className="text-2xl font-bold text-gray-900">
                                    {users.filter((u) => u.role === 'user').length}
                                </span>
                            </div>
                            <div className="text-gray-600 text-sm mt-2">Students</div>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <UserCog className="w-8 h-8 text-blue-500" />
                                <span className="text-2xl font-bold text-gray-900">
                                    {users.filter((u) => u.role === 'tech').length}
                                </span>
                            </div>
                            <div className="text-gray-600 text-sm mt-2">Tech Team</div>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-6">
                            <div className="flex items-center justify-between">
                                <Shield className="w-8 h-8 text-red-500" />
                                <span className="text-2xl font-bold text-gray-900">
                                    {users.filter((u) => u.role === 'admin').length}
                                </span>
                            </div>
                            <div className="text-gray-600 text-sm mt-2">Administrators</div>
                        </div>
                    </div>

                    {/* Search and Refresh */}
                    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                            {/* Search Bar */}
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
                                />
                            </div>
                            <button
                                onClick={fetchUsers}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>Refresh</span>
                            </button>
                        </div>
                    </div>

                    {/* Discord-Style Member View */}
                    {viewMode === 'discord' && (
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Members — {filteredUsers.length}</h2>
                                
                                <div className="space-y-6">
                                    {(['admin', 'tech', 'user'] as const).map((roleKey) => {
                                        const roleUsers = groupedUsers[roleKey]
                                        if (roleUsers.length === 0) return null
                                        
                                        const RoleIcon = getRoleIcon(roleKey)
                                        
                                        return (
                                            <div key={roleKey}>
                                                <div className="flex items-center space-x-2 mb-3">
                                                    <RoleIcon className={`w-4 h-4 ${getRoleColor(roleKey)}`} />
                                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                                                        {getRoleLabel(roleKey)} — {roleUsers.length}
                                                    </h3>
                                                </div>
                                                
                                                <div className="space-y-1">
                                                    {roleUsers.map((user) => {
                                                        const isCurrentUser = user._id === session?.user.id
                                                        
                                                        return (
                                                            <button
                                                                key={user._id}
                                                                onClick={() => handleUserClick(user)}
                                                                disabled={isCurrentUser}
                                                                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
                                                                    isCurrentUser
                                                                        ? 'bg-gray-50 cursor-not-allowed opacity-75'
                                                                        : 'hover:bg-gray-50 hover:shadow-sm cursor-pointer'
                                                                }`}
                                                            >
                                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                                                                    roleKey === 'admin' ? 'bg-gradient-to-br from-red-500 to-red-600' :
                                                                    roleKey === 'tech' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                                                                    'bg-gradient-to-br from-gray-500 to-gray-600'
                                                                }`}>
                                                                    {user.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="flex-1 text-left">
                                                                    <div className="flex items-center space-x-2">
                                                                        <span className={`font-medium ${
                                                                            isCurrentUser ? 'text-gray-500' : 'text-gray-900'
                                                                        }`}>
                                                                            {user.name}
                                                                        </span>
                                                                        {isCurrentUser && (
                                                                            <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full font-medium">
                                                                                You
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                                </div>
                                                                {!isCurrentUser && (
                                                                    <div className="text-gray-400 text-sm">
                                                                        Click to manage
                                                                    </div>
                                                                )}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {filteredUsers.length === 0 && (
                                    <div className="text-center py-12 text-gray-500">
                                        {searchQuery ? 'No users found matching your search.' : 'No users yet.'}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Table View */}
                    {viewMode === 'table' && (
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Role
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredUsers.map((user) => (
                                            <tr key={user._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900">{user.name}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-gray-600">{user.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user.role)}`}>
                                                        {user.role === 'user' ? 'STUDENT' : user.role.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                        disabled={updating === user._id || user._id === session.user.id}
                                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <option value="user">Student</option>
                                                        <option value="tech">Tech Team</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                    {updating === user._id && (
                                                        <span className="ml-2 text-sm text-gray-500">Updating...</span>
                                                    )}
                                                    {user._id === session.user.id && (
                                                        <span className="ml-2 text-sm text-gray-500">(You)</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {filteredUsers.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    {searchQuery ? 'No users found matching your search.' : 'No users yet.'}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Role Assignment Modal */}
            {selectedUser && (
                <RoleAssignmentModal
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                    onRoleUpdate={handleRoleChange}
                />
            )}
        </>
    )
}
