
import connectDB from '../lib/db/mongodb'
import User from '../lib/models/User'

const email = 'admin@university.edu'

async function deleteAdmin() {
    try {
        await connectDB()
        const result = await User.findOneAndDelete({ email })
        if (result) {
            console.log(`Successfully deleted user: ${email}`)
        } else {
            console.log(`User not found: ${email}`)
        }
    } catch (error) {
        console.error('Error deleting user:', error)
    } finally {
        process.exit()
    }
}

deleteAdmin()
