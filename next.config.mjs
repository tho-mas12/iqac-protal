/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/AAA/api/submission.php',
        destination: '/api/aaa/submission',
      },
      {
        source: '/AAA/api/departments.php',
        destination: '/api/aaa/departments',
      },
      {
        source: '/AAA',
        destination: '/AAA/index.html',
      },
      {
        source: '/AAA/',
        destination: '/AAA/index.html',
      },
      {
        source: '/course-plan',
        destination: '/course-plan/index.html',
      },
      {
        source: '/course-plan/',
        destination: '/course-plan/index.html',
      },
    ];
  },
};

export default nextConfig;
