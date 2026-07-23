/** sitemap.xml — генерируется Next.js по адресу /sitemap.xml */

import { SITE_URL } from '../config/site'

export default function sitemap() {
  const routes = [
    { path: '',          priority: 1.0 },
    { path: '/catalog',  priority: 0.9 },
    { path: '/gallery',  priority: 0.7 },
    { path: '/about',    priority: 0.6 },
    { path: '/reviews',  priority: 0.6 },
    { path: '/contacts', priority: 0.6 },
    { path: '/partner',  priority: 0.5 },
  ]

  return routes.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}/`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority,
  }))
}
