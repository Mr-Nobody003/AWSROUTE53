/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // In production, NEXT_PUBLIC_BACKEND_URL is set so rewrites are not used.
    // In local dev, proxy /api/* to the local uvicorn server.
    if (process.env.NEXT_PUBLIC_BACKEND_URL) {
      return [];
    }
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
