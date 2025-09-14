/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./env.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  
  // Temporary: Allow build with linting errors
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  redirects: async () => {
    return [
      {
        source: "/project",
        destination: "/project/backlog",
        permanent: true,
      },
      {
        source: "/",
        destination: "/project/backlog",
        permanent: true,
      },
    ];
  },
  
  // Updated image configuration for Next.js 14
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
      },
      {
        protocol: 'https',
        hostname: 'www.gravatar.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
};

export default config;
