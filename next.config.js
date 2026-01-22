/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    // Base URL for docs site
    // Production: https://docs.schedule-builder.xyz
    // Local development: http://localhost:5173
    const docsBaseUrl = process.env.NEXT_PUBLIC_DOCS_URL || 'http://localhost:5173';

    return [
      {
        source: '/privacy',
        destination: `${docsBaseUrl}/legal/privacy`,
        permanent: true,
      },
      {
        source: '/terms',
        destination: `${docsBaseUrl}/legal/terms`,
        permanent: true,
      },
      {
        source: '/contact',
        destination: `${docsBaseUrl}/legal/contact`,
        permanent: true,
      },
      {
        source: '/docs',
        destination: docsBaseUrl,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;