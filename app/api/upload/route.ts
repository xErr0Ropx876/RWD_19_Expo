import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { mkdir } from 'fs/promises'

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file uploaded' },
                { status: 400 }
            )
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const filename = Date.now() + '-' + file.name.replace(/\s+/g, '-')

        // Ensure directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        try {
            await mkdir(uploadDir, { recursive: true })
        } catch (error) {
            // Ignore if exists
        }

        const filepath = path.join(uploadDir, filename)
        await writeFile(filepath, buffer)

        const fileUrl = `/uploads/${filename}`

        return NextResponse.json({
            success: true,
            fileUrl,
        })
    } catch (error) {
        console.error('Error uploading file:', error)
        return NextResponse.json(
            { success: false, error: 'File upload failed' },
            { status: 500 }
        )
    }
}
