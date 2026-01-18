import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IResource extends Document {
    title: string
    description: string
    fileUrl: string
    thumbnailUrl?: string
    folder: mongoose.Types.ObjectId  // NEW: Reference to Folder
    tags: string[]
    uploadedBy: mongoose.Types.ObjectId
    views: number
    enrollments: number
    featured: boolean
    createdAt: Date
    updatedAt: Date
}

const ResourceSchema = new Schema<IResource>(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [200, 'Title must be less than 200 characters'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
            maxlength: [2000, 'Description must be less than 2000 characters'],
        },
        fileUrl: {
            type: String,
            required: [true, 'File URL is required'],
        },
        thumbnailUrl: {
            type: String,
        },
        folder: {
            type: Schema.Types.ObjectId,
            ref: 'Folder',
            required: [true, 'Folder is required'],
        },
        tags: [
            {
                type: String,
                trim: true,
            },
        ],
        uploadedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        views: {
            type: Number,
            default: 0,
            min: 0,
        },
        enrollments: {
            type: Number,
            default: 0,
            min: 0,
        },
        featured: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
)

// Indexes for search optimization
ResourceSchema.index({ title: 'text', description: 'text', tags: 'text' })
ResourceSchema.index({ folder: 1 })
ResourceSchema.index({ featured: 1 })
ResourceSchema.index({ createdAt: -1 })
ResourceSchema.index({ uploadedBy: 1 })

const Resource: Model<IResource> = mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema)

export default Resource
