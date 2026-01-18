'use client'

import { useState } from 'react'
import { X, Shield, UserCog, User, Check } from 'lucide-react'

interface RoleAssignmentModalProps {
    user: {
        _id: string
        name: string
        email: string
        role: 'user' | 'tech' | 'admin'
        createdAt: string
    }
    onClose: () => void
    onRoleUpdate: (userId: string, newRole: string) => Promise<void>
}

export default function RoleAssignmentModal({ user, onClose, onRoleUpdate }: RoleAssignmentModalProps) {
    const [selectedRole, setSelectedRole] = useState(user.role)
    const [updating, setUpdating] = useState(false)

    const roles = [
        {
            value: 'user',
            label: 'Student',
            description: 'Can access resources and participate in community',
            icon: User,
            color: 'text-gray-600',
            bgColor: 'bg-gray-50 hover:bg-gray-100',
            borderColor: 'border-gray-300',
        },
        {
            value: 'tech',
            label: 'Tech Team',
            description: 'Can upload resources and moderate content',
            icon: UserCog,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 hover:bg-blue-100',
            borderColor: 'border-blue-300',
        },
        {
            value: 'admin',
            label: 'Administrator',
            description: 'Full access to all features including user management',
            icon: Shield,
            color: 'text-red-600',
            bgColor: 'bg-red-50 hover:bg-red-100',
            borderColor: 'border-red-300',
        },
    ]

    const handleSave = async () => {
        if (selectedRole === user.role) {
            onClose()
            return
        }

        setUpdating(true)
        try {
            await onRoleUpdate(user._id, selectedRole)
            onClose()
        } catch (error) {
            console.error('Error updating role:', error)
        } finally {
            setUpdating(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-accent to-accent/80 p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">Assign Role</h2>
                            <p className="text-white/90 text-sm mt-1">Manage user permissions</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* User Info */}
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent/60 rounded-full flex items-center justify-center text-white font-bold text-xl">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{user.name}</h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                    </div>
                </div>

                {/* Role Options */}
                <div className="p-6 space-y-3 max-h-[400px] overflow-y-auto">
                    {roles.map((role) => {
                        const Icon = role.icon
                        const isSelected = selectedRole === role.value

                        return (
                            <button
                                key={role.value}
                                onClick={() => setSelectedRole(role.value as any)}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                                    isSelected
                                        ? `${role.bgColor} ${role.borderColor} shadow-md`
                                        : 'bg-white border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-3 flex-1">
                                        <div className={`mt-1 ${role.color}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2">
                                                <h4 className={`font-semibold ${isSelected ? role.color : 'text-gray-900'}`}>
                                                    {role.label}
                                                </h4>
                                                {user.role === role.value && (
                                                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                                                        Current
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {role.description}
                                            </p>
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <div className={`${role.color} ml-2`}>
                                            <Check className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>
                            </button>
                        )
                    })}
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={updating || selectedRole === user.role}
                        className="px-6 py-2.5 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        {updating ? (
                            <>
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                <span>Updating...</span>
                            </>
                        ) : (
                            <span>Save Changes</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
