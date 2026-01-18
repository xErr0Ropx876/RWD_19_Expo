
import connectDB from '../lib/db/mongodb'
import User from '../lib/models/User'

async function listUsers() {
    try {
        await connectDB()
        const users = await User.find({}).sort({ createdAt: -1 }).limit(5)
        console.log('Recent Users:')
        users.forEach(user => {
            console.log(`- ${user.name} (${user.email}) [Role: ${user.role}] [Provider: ${user.provider || 'credentials'}]`)
        })
    } catch (error) {
        console.error('Error listing users:', error)
    } finally {
        process.exit()
    }
}

listUsers()
