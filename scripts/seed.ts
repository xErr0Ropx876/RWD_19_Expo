import connectDB from '../lib/db/mongodb'
import User from '../lib/models/User'
import Resource from '../lib/models/Resource'
import Post from '../lib/models/Post'
import Comment from '../lib/models/Comment'
import bcrypt from 'bcryptjs'

async function seed() {
    try {
        console.log('🌱 Connecting to MongoDB...')
        await connectDB()
        console.log('✅ Connected to MongoDB successfully!')

        // Clear existing data
        console.log('🗑️  Clearing existing data...')
        await User.deleteMany({})
        await Resource.deleteMany({})
        await Post.deleteMany({})
        await Comment.deleteMany({})
        console.log('✅ Cleared all collections')

        // Create users
        console.log('👥 Creating users...')
        const hashedPassword = await bcrypt.hash('password123', 10)

        const adminUser = await User.create({
            name: 'Admin',
            email: 'admin@university.edu',
            password: hashedPassword,
            role: 'admin',
        })

        const techUser = await User.create({
            name: 'Tech Admin',
            email: 'tech@university.edu',
            password: hashedPassword,
            role: 'tech',
        })

        const students = await User.create([
            {
                name: 'Sarah Chen',
                email: 'sarah@university.edu',
                password: hashedPassword,
                role: 'user',
            },
            {
                name: 'Michael Park',
                email: 'michael@university.edu',
                password: hashedPassword,
                role: 'user',
            },
            {
                name: 'Emily Rodriguez',
                email: 'emily@university.edu',
                password: hashedPassword,
                role: 'user',
            },
        ])

        console.log(`✅ Created ${students.length + 2} users`)

        // Create resources
        console.log('📚 Creating resources...')
        const resources = await Resource.create([
            {
                title: 'Data Structures Complete Guide',
                description: 'Comprehensive guide covering arrays, linked lists, trees, graphs, and more.',
                fileUrl: 'https://example.com/data-structures.pdf',
                thumbnailUrl: 'https://via.placeholder.com/400x300?text=Data+Structures',
                category: 'CS Notes',
                tags: ['data-structures', 'algorithms', 'computer-science'],
                uploadedBy: techUser._id,
                views: 1250,
                enrollments: 450,
                featured: true,
            },
            {
                title: 'Calculus 101 - Integration Techniques',
                description: 'Master integration with step-by-step examples and practice problems.',
                fileUrl: 'https://example.com/calculus-101.pdf',
                thumbnailUrl: 'https://via.placeholder.com/400x300?text=Calculus',
                category: 'Math Tutorials',
                tags: ['calculus', 'mathematics', 'integration'],
                uploadedBy: techUser._id,
                views: 980,
                enrollments: 320,
                featured: true,
            },
            {
                title: 'React & Next.js Web Development',
                description: 'Build modern web applications with React and Next.js from scratch.',
                fileUrl: 'https://example.com/react-nextjs.mp4',
                thumbnailUrl: 'https://via.placeholder.com/400x300?text=Web+Dev',
                category: 'Videos',
                tags: ['react', 'nextjs', 'web-development'],
                uploadedBy: techUser._id,
                views: 2100,
                enrollments: 780,
                featured: true,
            },
            {
                title: 'Python Programming Basics',
                description: 'Learn Python from zero to hero with practical examples.',
                fileUrl: 'https://example.com/python-basics.pdf',
                thumbnailUrl: 'https://via.placeholder.com/400x300?text=Python',
                category: 'CS Notes',
                tags: ['python', 'programming', 'beginner'],
                uploadedBy: techUser._id,
                views: 1500,
                enrollments: 600,
                featured: false,
            },
            {
                title: 'Linear Algebra Lecture Series',
                description: 'Complete video lecture series on linear algebra concepts.',
                fileUrl: 'https://example.com/linear-algebra.mp4',
                thumbnailUrl: 'https://via.placeholder.com/400x300?text=Linear+Algebra',
                category: 'Videos',
                tags: ['linear-algebra', 'mathematics', 'vectors'],
                uploadedBy: techUser._id,
                views: 750,
                enrollments: 280,
                featured: false,
            },
        ])

        console.log(`✅ Created ${resources.length} resources`)

        // Create community posts
        console.log('💬 Creating community posts...')
        const posts = await Post.create([
            {
                author: students[0]._id,
                title: 'Best study techniques for Data Structures?',
                content: "I'm struggling with understanding binary trees and graph algorithms. What methods have worked for you? I've tried visualizing them on paper but still finding it challenging.",
                category: 'Question',
                tags: ['data-structures', 'study-tips', 'algorithms'],
                likes: [students[1]._id, students[2]._id],
                comments: [],
            },
            {
                author: techUser._id,
                title: 'New Web Development resources added!',
                content: "We've just uploaded a comprehensive React and Next.js tutorial series. Check out the Resources section for modern web development best practices.",
                category: 'News',
                tags: ['web-dev', 'react', 'nextjs'],
                likes: [students[0]._id, students[1]._id, students[2]._id],
                comments: [],
            },
            {
                author: students[2]._id,
                title: 'My Machine Learning Project - Feedback Welcome!',
                content: "Just finished my ML project on sentiment analysis. Used Python, TensorFlow, and deployed it on Heroku. Would love to get feedback from the community!",
                category: 'Project Showcase',
                tags: ['machine-learning', 'python', 'tensorflow'],
                likes: [students[0]._id],
                comments: [],
            },
            {
                author: students[1]._id,
                title: 'Study group for Calculus this weekend?',
                content: "Anyone interested in forming a study group for Calculus 2? We can meet in the library or online. Topics: integration techniques, sequences and series.",
                category: 'Discussion',
                tags: ['calculus', 'study-group', 'mathematics'],
                likes: [],
                comments: [],
            },
        ])

        console.log(`✅ Created ${posts.length} community posts`)

        // Create some comments
        console.log('💭 Creating comments...')
        const comment1 = await Comment.create({
            author: students[1]._id,
            post: posts[0]._id,
            content: 'I find it helpful to use online visualizers like VisuAlgo. Also, try implementing the algorithms yourself!',
            likes: [students[0]._id],
            replies: [],
        })

        const comment2 = await Comment.create({
            author: students[2]._id,
            post: posts[0]._id,
            content: 'Practice with LeetCode problems. Start easy and gradually increase difficulty.',
            likes: [],
            replies: [],
        })

        // Add comments to post
        posts[0].comments.push(comment1._id, comment2._id)
        await posts[0].save()

        console.log(`✅ Created ${2} comments`)

        // Update student enrollments
        console.log('📝 Adding student enrollments...')
        students[0].enrolledResources = [resources[0]._id, resources[2]._id]
        students[0].recentViews = [
            { resourceId: resources[0]._id, viewedAt: new Date() },
            { resourceId: resources[1]._id, viewedAt: new Date(Date.now() - 86400000) },
        ]
        await students[0].save()

        students[1].enrolledResources = [resources[1]._id, resources[3]._id]
        await students[1].save()

        console.log('✅ Updated student enrollments')

        console.log('\n🎉 Database seeded successfully!')
        console.log('\n📊 Summary:')
        console.log(`   • Users: ${students.length + 1}`)
        console.log(`   • Resources: ${resources.length}`)
        console.log(`   • Posts: ${posts.length}`)
        console.log(`   • Comments: 2`)
        console.log('\n🔐 Login credentials:')
        console.log('   Tech: tech@university.edu / password123')
        console.log('   Student: sarah@university.edu / password123')

        process.exit(0)
    } catch (error) {
        console.error('❌ Error seeding database:', error)
        process.exit(1)
    }
}

seed()
