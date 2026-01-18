import mongoose, { Document, Model } from 'mongoose'

export interface IFolder extends Document {
    name: string
    type: 'semester' | 'course' | 'topic' | 'custom'
    parentFolder: mongoose.Types.ObjectId | null
    path: string[]  // Array of folder names for breadcrumb navigation
    createdBy: mongoose.Types.ObjectId
    order: number  // For custom sorting within same parent
    icon?: string  // Optional emoji or icon name
    createdAt: Date
    updatedAt: Date
}

const folderSchema = new mongoose.Schema<IFolder>(
    {
        name: {
            type: String,
            required: [true, 'Folder name is required'],
            trim: true,
            maxlength: [100, 'Folder name cannot exceed 100 characters'],
        },
        type: {
            type: String,
            enum: ['semester', 'course', 'topic', 'custom'],
            default: 'custom',
        },
        parentFolder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Folder',
            default: null,
        },
        path: {
            type: [String],
            default: [],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        order: {
            type: Number,
            default: 0,
        },
        icon: {
            type: String,
            default: '📁',
        },
    },
    {
        timestamps: true,
    }
)

// Indexes for efficient querying
folderSchema.index({ parentFolder: 1, order: 1 })
folderSchema.index({ createdBy: 1 })
folderSchema.index({ path: 1 })

// Pre-save middleware to update path array
folderSchema.pre('save', async function () {
    if (this.isModified('parentFolder') || this.isNew) {
        if (this.parentFolder) {
            const FolderModel = mongoose.models.Folder || mongoose.model('Folder', folderSchema)
            const parent = await FolderModel.findById(this.parentFolder)
            if (parent) {
                this.path = [...parent.path, parent.name]
            }
        } else {
            this.path = []
        }
    }
})

const Folder: Model<IFolder> = mongoose.models.Folder || mongoose.model<IFolder>('Folder', folderSchema)

export default Folder
