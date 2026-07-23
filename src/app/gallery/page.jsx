/** Страница интерьеров */

import InteriorGallery from '../../components/InteriorGallery'
import Breadcrumbs     from '../../components/Breadcrumbs'
import JsonLd          from '../../components/JsonLd'
import { SITE_URL } from '../../config/site'

export const metadata = {
  title: 'Интерьеры',
  description: 'Готовые проекты интерьеров со стеновыми панелями и вешалками СТЕПАН.',
  alternates: { canonical: '/gallery/' },
}

const collectionJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Интерьеры',
  description: 'Готовые проекты интерьеров со стеновыми панелями и вешалками.',
  url: `${SITE_URL}/gallery/`,
  isPartOf: { '@id': `${SITE_URL}/#website` },
}

export default function GalleryPage() {
  return (
    <main className="pt-16">
      <JsonLd data={collectionJsonLd} />
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Интерьеры' }]} bg="bg-stone-50" />
      <InteriorGallery />
    </main>
  )
}
