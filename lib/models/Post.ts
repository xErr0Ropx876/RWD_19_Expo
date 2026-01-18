import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IPost extends Document {
    author: mongoose.Types.ObjectId
    title: string
    content: string
    category?: string
    tags: string[]
    likes: mongoose.Types.ObjectId[]
    comments: mongoose.Types.ObjectId[]
    imageUrl?: string
    createdAt: Date
    updatedAt: Date
}

const PostSchema = new Schema<IPost>(
    {
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [300, 'Title must be less than 300 characters'],
        },
        content: {
            type: String,
            required: [true, 'Content is required'],
            trim: true,
            maxlength: [5000, 'Content must be less than 5000 characters'],
        },
        category: {
            type: String,
            enum: ['Discussion', 'Question', 'Study Tips', 'Project Showcase', 'News', 'General'],
            default: 'General',
        },
        tags: [
            {
                type: String,
                trim: true,
            },
        ],
        likes: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        comments: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Comment',
            },
        ],
        imageUrl: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
)

// Indexes for search and sorting
PostSchema.index({ title: 'text', content: 'text', tags: 'text' })
PostSchema.index({ createdAt: -1 })
PostSchema.index({ author: 1 })

const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema)

export default Post
