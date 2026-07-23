/** Страница «О нас» */

import Hero        from '../../components/Hero'
import Breadcrumbs from '../../components/Breadcrumbs'
import JsonLd      from '../../components/JsonLd'
import { SITE_URL } from '../../config/site'

export const metadata = {
  title: 'О нас',
  description: 'СТЕПАН — производитель декоративных стеновых панелей и настенных вешалок.',
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
    <main className="pt-16">
      <JsonLd data={aboutJsonLd} />
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'О нас' }]} bg="bg-stone-50" />
      <Hero />
    </main>
  )
}
