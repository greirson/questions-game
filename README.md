# Shower Game

A mobile-first web application for displaying interactive questions and content. Built with Next.js and TypeScript.

## Features

- Clean, minimalist design with white background
- Responsive layout optimized for mobile devices
- Dynamic content rendering (text, images, videos)
- Automatic content type detection
- Admin panel for content management
- Docker support for easy deployment
- Persistent data storage

## Project Structure

```
shower-game/
├── app/
│   ├── api/
│   │   ├── questions/
│   │   │   ├── route.ts          # API endpoint for questions
│   │   │   └── reorder/route.ts  # API endpoint for reordering
│   │   ├── title/route.ts        # API endpoint for title updates
│   │   └── upload/route.ts       # API endpoint for file uploads
│   ├── admin/
│   │   ├── page.tsx              # Admin panel component
│   │   └── admin.module.css      # Admin panel styles
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   ├── page.module.css           # Page-specific styles
│   └── page.tsx                  # Main page component
├── public/
│   ├── header.png                # Header image
│   └── uploads/                  # Uploaded media directory
├── questions.json                # Question data
├── Dockerfile                    # Docker build configuration
├── docker-compose.yml            # Docker compose configuration
└── package.json                  # Project dependencies
```

## Data Structure

The application uses a JSON file (`questions.json`) with the following structure:

```json
{
  "title": "Game Title",
  "questions": [
    {
      "id": 1,
      "title": "Question Title",
      "subtitle": "Question Subtitle",
      "content": "Content (text, image URL, or video URL)"
    }
  ]
}
```

### Content Types

Content types are automatically detected based on the content field:
- Text: Plain text content
- Images: 
  - Local files in `/public/uploads/`
  - Remote URLs ending with .jpg, .jpeg, .png, .gif, .webp
- Videos: 
  - YouTube URLs (youtube.com, youtu.be)
  - Local video files in `/public/uploads/`
- Links: Other URLs are rendered as clickable links

## Admin Features

The admin panel (`/admin`) provides the following functionality:
- Add, edit, and delete questions
- Reorder questions using up/down arrows
- Upload images and videos
- Update site title
- Preview content before saving
- Automatic content type detection

## Setup

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Docker Deployment

1. Build and start the container:
   ```bash
   docker compose up -d
   ```

2. Access the application at [http://localhost:3000](http://localhost:3000)

3. Access the admin panel at [http://localhost:3000/admin](http://localhost:3000/admin)

## Development

- The application is built with Next.js 14
- TypeScript for type safety
- CSS Modules for scoped styling
- Mobile-first responsive design
- Docker for containerization
- Persistent data storage using volumes

## Customization

### Content Management
1. Access the admin panel at `/admin`
2. Use the interface to:
   - Add/edit/delete questions
   - Upload media files
   - Reorder questions
   - Update the site title

### Media Files
- Place header image in the `public` directory as `header.png`
- Uploaded media files are stored in `public/uploads/`
- Remote image URLs are supported

## License

MIT 