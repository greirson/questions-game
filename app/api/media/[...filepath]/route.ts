// File: app/api/media/[...filepath]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { lookup } from 'mime-types'; // For robust MIME type detection

export async function GET(
  request: NextRequest,
  { params }: { params: { filepath: string[] } }
) {
  const relativeFilePathParts = params.filepath;

  if (!relativeFilePathParts || relativeFilePathParts.length === 0) {
    return new NextResponse('File path required', { status: 400 });
  }

  const relativeFilePath = path.join(...relativeFilePathParts);

  // Basic security: Prevent directory traversal
  if (relativeFilePath.includes('..') || relativeFilePath.startsWith('/')) {
    return new NextResponse('Invalid path', { status: 400 });
  }

  // Assuming your uploads are always directly within public/uploads
  const fullFilePath = path.join(process.cwd(), 'public', 'uploads', relativeFilePath);

  try {
    // Check if file exists and is a file
    const fileStat = await fs.promises.stat(fullFilePath);
    if (!fileStat.isFile()) {
      // This handles cases where the path exists but is a directory
      return new NextResponse('Not a file', { status: 400 });
    }

    const fileBuffer = await fs.promises.readFile(fullFilePath);
    
    let contentType = lookup(fullFilePath);
    if (!contentType) {
      // Fallback for unknown types, or determine based on extension if lookup fails
      const ext = path.extname(fullFilePath).toLowerCase();
      if (ext === '.mp4') contentType = 'video/mp4';
      else if (ext === '.webm') contentType = 'video/webm';
      // Add more as needed, or stick to application/octet-stream
      else contentType = 'application/octet-stream';
    }
    
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Length', fileStat.size.toString());
    // Instruct browsers to cache. Adjust max-age as needed.
    // `public` allows shared caches (like CDNs if you use one) to cache.
    // `must-revalidate` means the cache must check with the origin server if the content is still fresh before using a stale version.
    headers.set('Cache-Control', 'public, max-age=604800, must-revalidate'); // Cache for 7 days

    return new NextResponse(fileBuffer, { status: 200, headers });

  } catch (error) {
    console.error(`Error serving file ${fullFilePath}:`, error);
    // Specifically check for ENOENT (file not found)
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
         return new NextResponse('File not found', { status: 404 });
    }
    // For other errors, return a generic 500
    return new NextResponse('Internal server error', { status: 500 });
  }
}