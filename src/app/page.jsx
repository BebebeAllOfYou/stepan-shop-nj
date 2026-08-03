/**
 * Главная страница
 *
 * Структура (сверху вниз):
 *   Hero           — полноэкранный баннер с CTA
 *   PromoStripe    — информационная лента (доставка, гарантия, производство)
 *   CategoryBanner — плитки категорий товаров
 *   FeaturedProducts — хиты продаж
 *   WhyUs          — преимущества компании
 *   Reviews        — отзывы покупателей (из reviews.json)
 */

import Hero              from '../components/Hero'
import PromoStripe       from '../components/PromoStripe'
import CategoryBanner    from '../components/CategoryBanner'
import FeaturedProducts  from '../components/FeaturedProducts'
import WhyUs             from '../components/WhyUs'
import Reviews           from '../components/Reviews'

export const metadata = {
  alternates: { canonical: '/' },
}

export default function HomePage() {
  return (
    <main>
      <Hero />
      <PromoStripe />
      <CategoryBanner />
      <FeaturedProducts />
      <WhyUs />
      <Reviews />
    </main>
  )
}
