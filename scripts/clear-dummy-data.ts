import connectDB from '../lib/db/mongodb'
import Resource from '../lib/models/Resource'

async function clearResources() {
    try {
        console.log('🗑️  Clearing all resources (dummy data)...')
        await connectDB()

        // Only deleting resources, keeping users/folders/posts to avoid breaking everything
        // Or should I delete everything? The user said "we dont need the dummy data".
        // Let's delete Resources and Posts (as they also have dummy content).
        // I will keep Users and Folders so the structure is there.

        // Check if any resources exist with "example.com"
        const result = await Resource.deleteMany({ fileUrl: { $regex: 'example.com' } })
        console.log(`✅ Deleted ${result.deletedCount} dummy resources`)

        process.exit(0)
    } catch (error) {
        console.error('❌ Error clearing resources:', error)
        process.exit(1)
    }
}

clearResources()
