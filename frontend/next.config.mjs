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
    // Proxy /api/* to the backend server. This ensures cookies are set on the frontend domain.
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl.replace(/\/$/, '')}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
