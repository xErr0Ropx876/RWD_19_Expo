
import connectDB from '../lib/db/mongodb'
import User from '../lib/models/User'

async function findGithubUsers() {
    try {
        await connectDB()
        // Find users where provider is github OR just list all strictly with email
        const users = await User.find({})

        console.log('--- USERS ---')
        users.forEach(u => {
            console.log(`Email: ${u.email} | Role: ${u.role}`)
        })
        console.log('-------------')
    } catch (error) {
        console.error(error)
    } finally {
        process.exit()
    }
}

findGithubUsers()
