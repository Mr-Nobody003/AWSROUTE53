/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ESLint errors won't fail production builds — fix them locally at your own pace
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Similarly, TS type errors won't block the build
    ignoreBuildErrors: true,
  },
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
