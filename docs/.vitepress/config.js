export default {
  title: 'Schedule Builder Docs',
  description: 'Official documentation for Schedule Builder',

  // Theme configuration
  themeConfig: {
    // Logo and site title
    siteTitle: 'Schedule Builder',

    // Navigation bar
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Legal', link: '/legal/privacy' },
      { text: 'FAQ', link: '/faq' },
      { text: 'Main App', link: 'https://schedule-builder.xyz' }
    ],

    // Sidebar navigation
    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          collapsed: false,
          items: [
            { text: 'Introduction', link: '/getting-started/' },
            { text: 'Quick Start', link: '/getting-started/quick-start' }
          ]
        },
        {
          text: 'User Guide',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/guide/' },
            { text: 'Creating Schedules', link: '/guide/creating-schedules' },
            { text: 'Managing Teams', link: '/guide/managing-teams' }
          ]
        },
        {
          text: 'Troubleshooting',
          items: [
            { text: 'Common Issues', link: '/troubleshooting/' }
          ]
        }
      ],
      '/legal/': [
        {
          text: 'Legal',
          items: [
            { text: 'Privacy Policy', link: '/legal/privacy' },
            { text: 'Terms of Service', link: '/legal/terms' },
            { text: 'Contact Us', link: '/legal/contact' }
          ]
        }
      ]
    },

    // Enable local search with Cmd+K
    search: {
      provider: 'local'
    },

    // Social links
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ArsalanAnwer0' }
    ],

    // Footer
    footer: {
      message: 'Built with VitePress',
      copyright: 'Copyright © 2026 Schedule Builder'
    },

    // Edit link
    editLink: {
      pattern: 'https://github.com/ArsalanAnwer0/schedule-builder/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    // Last updated timestamp
    lastUpdated: {
      text: 'Last updated',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    }
  },

  // Markdown configuration
  markdown: {
    lineNumbers: false,
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  },

  // Head tags for SEO
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#14b8a6' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:site_name', content: 'Schedule Builder Docs' }],
    ['meta', { name: 'og:title', content: 'Schedule Builder Documentation' }],
    ['meta', { name: 'og:description', content: 'Official documentation for Schedule Builder - streamline your team scheduling' }]
  ]
}
