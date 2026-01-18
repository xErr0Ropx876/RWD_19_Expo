import connectDB from '../lib/db/mongodb'
import Folder from '../lib/models/Folder'
import User from '../lib/models/User'
import Resource from '../lib/models/Resource'

async function seedFolders() {
    try {
        console.log('📁 Creating semester folder structure...')
        await connectDB()

        // Get a tech user for folder creation
        const techUser = await User.findOne({ role: 'tech' })

        if (!techUser) {
            console.error('❌ No tech user found. Please run the main seed script first.')
            process.exit(1)
        }

        // Clear existing folders
        await Folder.deleteMany({})
        console.log('✅ Cleared existing folders')

        // Create 8 semester folders
        const semesters = []
        for (let i = 1; i <= 8; i++) {
            const semester = await Folder.create({
                name: `Sem ${i}`,
                type: 'semester',
                parentFolder: null,
                createdBy: techUser._id,
                order: i,
                icon: '📚',
            })
            semesters.push(semester)
            console.log(`✅ Created ${semester.name}`)
        }

        // Add sample course folders for Sem 1
        const sem1Courses = [
            { name: 'Data Structures', icon: '💻', courses: ['Week 1 - Arrays', 'Week 2 - Linked Lists', 'Lab Assignments'] },
            { name: 'Calculus', icon: '📊', courses: ['Chapter 1 - Limits', 'Chapter 2 - Derivatives', 'Practice Problems'] },
            { name: 'Web Development', icon: '🌐', courses: ['HTML & CSS', 'JavaScript Basics', 'Projects'] },
            { name: 'Physics', icon: '⚡', courses: ['Mechanics', 'Thermodynamics', 'Lab Reports'] },
        ]

        for (const course of sem1Courses) {
            const courseFolder = await Folder.create({
                name: course.name,
                type: 'course',
                parentFolder: semesters[0]._id,
                createdBy: techUser._id,
                icon: course.icon,
                order: 0,
            })
            console.log(`  ├─ Created ${course.name}`)

            // Create topic subfolders
            for (let i = 0; i < course.courses.length; i++) {
                await Folder.create({
                    name: course.courses[i],
                    type: 'topic',
                    parentFolder: courseFolder._id,
                    createdBy: techUser._id,
                    icon: '📁',
                    order: i,
                })
                console.log(`  │  ├─ Created ${course.courses[i]}`)
            }
        }

        // Add sample course folders for Sem 2
        const sem2Courses = [
            { name: 'Algorithms', icon: '🔬' },
            { name: 'Linear Algebra', icon: '📐' },
            { name: 'Digital Electronics', icon: '⚙️' },
        ]

        for (const course of sem2Courses) {
            await Folder.create({
                name: course.name,
                type: 'course',
                parentFolder: semesters[1]._id,
                createdBy: techUser._id,
                icon: course.icon,
                order: 0,
            })
            console.log(`  ├─ Created ${course.name} in Sem 2`)
        }

        // Migrate existing resources to appropriate folders
        console.log('\n📦 Migrating existing resources to folders...')

        // Get Data Structures folder
        const dsFolder = await Folder.findOne({
            name: 'Data Structures',
            parentFolder: semesters[0]._id
        })

        // Get Calculus folder
        const calculusFolder = await Folder.findOne({
            name: 'Calculus',
            parentFolder: semesters[0]._id
        })

        // Get Web Development folder
        const webDevFolder = await Folder.findOne({
            name: 'Web Development',
            parentFolder: semesters[0]._id
        })

        if (dsFolder && calculusFolder && webDevFolder) {
            // Update resources (this assumes you have existing resources from previous seed)
            const resources = await Resource.find({})

            for (const resource of resources) {
                let targetFolder = null

                if (resource.title.toLowerCase().includes('data structures') ||
                    resource.title.toLowerCase().includes('algorithm')) {
                    targetFolder = dsFolder._id
                } else if (resource.title.toLowerCase().includes('calculus') ||
                    resource.title.toLowerCase().includes('math')) {
                    targetFolder = calculusFolder._id
                } else if (resource.title.toLowerCase().includes('web') ||
                    resource.title.toLowerCase().includes('react')) {
                    targetFolder = webDevFolder._id
                } else {
                    // Default to Sem 1 root for unmatched resources
                    targetFolder = semesters[0]._id
                }

                await Resource.findByIdAndUpdate(resource._id, { folder: targetFolder })
            }

            console.log(`✅ Migrated ${resources.length} resources to folders`)
        }

        const totalFolders = await Folder.countDocuments()
        console.log(`\n🎉 Folder structure created successfully!`)
        console.log(`📊 Total folders: ${totalFolders}`)
        console.log(`   • Semesters: 8`)
        console.log(`   • Courses: ${sem1Courses.length + sem2Courses.length}`)
        console.log(`   • Topics: ${sem1Courses.reduce((acc, c) => acc + c.courses.length, 0)}`)

        process.exit(0)
    } catch (error) {
        console.error('❌ Error seeding folders:', error)
        process.exit(1)
    }
}

seedFolders()
