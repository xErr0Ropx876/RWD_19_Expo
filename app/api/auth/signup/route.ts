import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import connectDB from '@/lib/db/mongodb'
import User from '@/lib/models/User'
import { signupSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        // Validate input
        const validatedData = signupSchema.parse(body)
        const { name, email, password } = validatedData

        await connectDB()

        // Check if user already exists
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'User with this email already exists' },
                { status: 400 }
            )
        }

        // Check if this is the first user (make them admin)
        const userCount = await User.countDocuments()
        const role = userCount === 0 ? 'admin' : 'user'

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create new user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
        })

        return NextResponse.json(
            {
                success: true,
                message: 'User created successfully',
                data: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            },
            { status: 201 }
        )
    } catch (error: any) {
        console.error('Signup error:', error)
        console.error('Error name:', error.name)
        console.error('Error message:', error.message)

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { success: false, error: 'Invalid input data', details: error.errors },
                { status: 400 }
            )
        }

        if (error.name === 'ValidationError') {
            return NextResponse.json(
                { success: false, error: 'Validation error: ' + error.message },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { success: false, error: 'Failed to create user: ' + error.message },
            { status: 500 }
        )
    }
}
