# Shower Game

A mobile-first web application for displaying interactive questions and content. Built with Next.js and TypeScript.

## Features

- Clean, minimalist design with white background
- Responsive layout optimized for mobile devices
- Dynamic content rendering (text, images, videos)
- Automatic content type detection
- Questions sorted by ID

## Project Structure

```
shower-game/
├── app/
│   ├── api/
│   │   └── questions/
│   │       └── route.ts      # API endpoint for questions
│   │   ├── globals.css           # Global styles
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.module.css       # Page-specific styles
│   │   └── page.tsx              # Main page component
│   ├── public/
│   │   └── header.png            # Header image
│   ├── questions.json            # Question data
│   └── package.json              # Project dependencies
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

Content types are automatically detected based on the content field:
- Text: Plain text content
- Images: URLs ending with .jpg, .jpeg, .png, .gif, .webp
- Videos: YouTube URLs (youtube.com, youtu.be)
- Links: Other URLs are rendered as clickable links

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development

- The application is built with Next.js 14
- TypeScript for type safety
- CSS Modules for scoped styling
- Mobile-first responsive design

## Customization

To modify the questions:
1. Edit `questions.json` with your content
2. Place your header image in the `public` directory as `header.png`

## License

MIT 