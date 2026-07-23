/** robots.txt — генерируется Next.js по адресу /robots.txt */

import { SITE_URL } from '../config/site'

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
