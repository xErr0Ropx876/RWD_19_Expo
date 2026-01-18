import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IComment extends Document {
    author: mongoose.Types.ObjectId
    post: mongoose.Types.ObjectId
    content: string
    likes: mongoose.Types.ObjectId[]
    parentComment?: mongoose.Types.ObjectId
    replies: mongoose.Types.ObjectId[]
    createdAt: Date
    updatedAt: Date
}

const CommentSchema = new Schema<IComment>(
    {
        author: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        post: {
            type: Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
        },
        content: {
            type: String,
            required: [true, 'Comment content is required'],
            trim: true,
            maxlength: [2000, 'Comment must be less than 2000 characters'],
        },
        likes: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        parentComment: {
            type: Schema.Types.ObjectId,
            ref: 'Comment',
        },
        replies: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Comment',
            },
        ],
    },
    {
        timestamps: true,
    }
)

// Indexes
CommentSchema.index({ post: 1, createdAt: -1 })
CommentSchema.index({ author: 1 })

const Comment: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema)

export default Comment
