import { NextResponse } from 'next/server';
import { writeFile, mkdir, chmod } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Validate file types and sizes
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: `Invalid file type: ${file.type}` }, { status: 400 });
      }
      if (file.size > maxSize) {
        return NextResponse.json({ error: `File too large: ${file.name}` }, { status: 400 });
      }
    }

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
      // Set directory permissions to 755
      await chmod(uploadDir, 0o755);
    } catch (error) {
      console.error('Error creating upload directory:', error);
      return NextResponse.json({ error: 'Failed to create upload directory' }, { status: 500 });
    }

    // Process all files
    const uploadedUrls = await Promise.all(
      files.map(async (file) => {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const extension = path.extname(file.name);
        const filename = `${uuidv4()}${extension}`;
        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);
        // Set file permissions to 644
        await chmod(filePath, 0o644);
        return `/uploads/${filename}`;
      })
    );

    return NextResponse.json({ urls: uploadedUrls });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload files' }, { status: 500 });
  }
} 