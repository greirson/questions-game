/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // This is for next/image component, not directly for your <img> tags with /api/media
    // If you ever use next/image with your API endpoint, you'd add it here.
    // For now, it's not strictly necessary for the current solution.
    // remotePatterns: [
    //   {
    //     protocol: 'http', // or https if your dev/prod uses it
    //     hostname: 'localhost', // or your domain
    //     port: '3000', // or your port
    //     pathname: '/api/media/**',
    //   },
    // ],
  },
  // The custom headers for /uploads/* are no longer needed
  // as /api/media/[...filepath]/route.ts sets its own cache headers.
  // You can keep this headers function if you have other global headers.
  // async headers() {
  //   return [
  //     // Add other global headers here if needed
  //   ];
  // },
}

module.exports = nextConfig