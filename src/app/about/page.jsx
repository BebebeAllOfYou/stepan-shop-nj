/**
 * Страница «О нас» — server component с метаданными
 * Клиентский контент вынесен в ./AboutContent.jsx
 */

import AboutContent from './AboutContent'
import JsonLd       from '../../components/JsonLd'
import { SITE_URL } from '../../config/site'

export const metadata = {
  title: 'О нас',
  description: 'Производитель декоративных стеновых панелей и настенных вешалок из МДФ.',
  alternates: { canonical: '/about/' },
}

const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'О нас',
  url: `${SITE_URL}/about/`,
  mainEntity: { '@id': `${SITE_URL}/#organization` },
}

export default function AboutPage() {
  return (
    <>
      <JsonLd data={aboutJsonLd} />
      <AboutContent />
    </>
  )
}
