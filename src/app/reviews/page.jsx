/** Страница отзывов */

import Reviews     from '../../components/Reviews'
import Breadcrumbs from '../../components/Breadcrumbs'
import JsonLd      from '../../components/JsonLd'
import { SITE_URL, SITE_NAME } from '../../config/site'
import reviewsData from '../../../public/data/reviews.json'

export const metadata = {
  title: 'Отзывы',
  description: 'Отзывы покупателей о стеновых панелях и вешалках СТЕПАН.',
  alternates: { canonical: '/reviews/' },
}

// Рейтинг организации на основе отзывов покупателей
const ratingJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: reviewsData.summary.average,
    reviewCount: reviewsData.summary.total,
    bestRating: 5,
    worstRating: 1,
  },
  review: reviewsData.reviews.slice(0, 10).map(r => ({
    '@type': 'Review',
    author: { '@type': 'Person', name: r.name },
    reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
    reviewBody: r.text,
    itemReviewed: { '@type': 'Product', name: r.productName },
  })),
}

export default function ReviewsPage() {
  return (
    <main className="pt-16">
      <JsonLd data={ratingJsonLd} />
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Отзывы' }]} bg="bg-stone-900" dark />
      <Reviews />
    </main>
  )
}
