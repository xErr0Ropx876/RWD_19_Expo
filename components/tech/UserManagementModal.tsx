import { useState, useEffect } from 'react'
import { X, Shield, ShieldCheck, User as UserIcon, AlertCircle, Trash2, Ban, Clock, Check } from 'lucide-react'

interface User {
    _id: string
    name: string
    email: string
    role: 'student' | 'tech' | 'admin'
    image?: string
    provider?: string
    bannedUntil?: string
}

const BAN_DURATIONS = [
    { label: '10 Mins', value: 10 },
    { label: '30 Mins', value: 30 },
    { label: '1 Hr', value: 60 },
    { label: '5 Hrs', value: 300 },
    { label: '15 Hrs', value: 900 },
    { label: '20 Hrs', value: 1200 },
    { label: '40 Hrs', value: 2400 },
    { label: '80 Hrs', value: 4800 },
    { label: '100 Hrs', value: 6000 },
]

interface UserManagementModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function UserManagementModal({ isOpen, onClose }: UserManagementModalProps) {
    const [users, setUsers] = useState<User[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [banMenuOpen, setBanMenuOpen] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            fetchUsers()
        }
    }, [isOpen])

    const fetchUsers = async () => {
        try {
            setIsLoading(true)
            const response = await fetch('/api/users')
            const data = await response.json()
            if (data.success) {
                setUsers(data.data)
            } else {
                setError('Failed to load users')
            }
        } catch (err) {
            setError('An error occurred loading users')
        } finally {
            setIsLoading(false)
        }
    }

    const handleRoleUpdate = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'student' ? 'tech' : 'student'

        // Prevent accidental self-lockout or weird states if needed, but for now simple toggle
        if (currentRole === 'admin') return // Can't change admin for now

        try {
            setUpdatingId(userId)
            const response = await fetch(`/api/users/${userId}/role`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            })

            const result = await response.json()

            if (result.success) {
                // Update local state
                setUsers(users.map(u =>
                    u._id === userId ? { ...u, role: newRole as any } : u
                ))
            }
        } catch (err) {
            console.error('Failed to update role', err)
        } finally {
            setUpdatingId(null)
        }
    }

    const handleBan = async (userId: string, minutes: number) => {
        try {
            setUpdatingId(userId)
            const response = await fetch(`/api/users/${userId}/ban`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ durationInMinutes: minutes }),
            })
            const result = await response.json()
            if (result.success) {
                setUsers(users.map(u =>
                    u._id === userId ? { ...u, bannedUntil: result.data.bannedUntil } : u
                ))
                setBanMenuOpen(null)
            }
        } catch (err) {
            console.error('Failed to ban user', err)
        } finally {
            setUpdatingId(null)
        }
    }

    const handleDelete = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

        try {
            setDeletingId(userId)
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
            })
            const result = await response.json()
            if (result.success) {
                setUsers(users.filter(u => u._id !== userId))
            }
        } catch (err) {
            console.error('Failed to delete user', err)
        } finally {
            setDeletingId(null)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                        <p className="text-gray-500 text-sm">Manage user access and roles</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-6">
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full"></div>
                        </div>
                    ) : (
                        <div className="overflow-hidden border border-gray-200 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        {user.image ? (
                                                            <img className="h-10 w-10 rounded-full object-cover" src={user.image} alt="" />
                                                        ) : (
                                                            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                                                                <span className="text-accent font-bold">{user.name.charAt(0)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                        <div className="text-xs text-gray-500 capitalize">{user.provider || 'email'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'tech' || user.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                                {user.bannedUntil && new Date(user.bannedUntil) > new Date() && (
                                                    <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                        Banned
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {user.role !== 'admin' && (
                                                    <div className="flex items-center justify-end space-x-2">
                                                        {/* Role Toggle */}
                                                        <button
                                                            onClick={() => handleRoleUpdate(user._id, user.role)}
                                                            disabled={updatingId === user._id || !!user.bannedUntil}
                                                            className={`p-1.5 rounded-lg transition-colors ${user.role === 'student'
                                                                ? 'text-accent hover:bg-accent/10'
                                                                : 'text-gray-500 hover:bg-gray-100'
                                                                }`}
                                                            title={user.role === 'student' ? 'Promote to Tech' : 'Demote to Student'}
                                                        >
                                                            {user.role === 'student' ? <ShieldCheck className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                                                        </button>

                                                        {/* Ban Menu */}
                                                        <div className="relative">
                                                            <button
                                                                onClick={() => setBanMenuOpen(banMenuOpen === user._id ? null : user._id)}
                                                                className={`p-1.5 rounded-lg transition-colors ${user.bannedUntil && new Date(user.bannedUntil) > new Date()
                                                                    ? 'bg-red-100 text-red-600'
                                                                    : 'text-gray-500 hover:bg-red-50 hover:text-red-600'
                                                                    }`}
                                                                title="Ban User"
                                                            >
                                                                <Ban className="w-4 h-4" />
                                                            </button>

                                                            {banMenuOpen === user._id && (
                                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1 max-h-60 overflow-y-auto">
                                                                    <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase border-b border-gray-50">
                                                                        Select Duration
                                                                    </div>
                                                                    {BAN_DURATIONS.map(duration => (
                                                                        <button
                                                                            key={duration.value}
                                                                            onClick={() => handleBan(user._id, duration.value)}
                                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                                                        >
                                                                            <Clock className="w-3 h-3 text-gray-400" />
                                                                            <span>{duration.label}</span>
                                                                        </button>
                                                                    ))}
                                                                    <button
                                                                        onClick={() => handleBan(user._id, 0)}
                                                                        className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-green-50 flex items-center space-x-2 border-t border-gray-50"
                                                                    >
                                                                        <Check className="w-3 h-3" />
                                                                        <span>Unban</span>
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Delete Button */}
                                                        <button
                                                            onClick={() => handleDelete(user._id)}
                                                            disabled={deletingId === user._id}
                                                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
