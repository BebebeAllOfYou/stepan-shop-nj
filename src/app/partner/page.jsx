/** Страница партнёрства */

import Partner     from '../../components/Partner'
import Breadcrumbs from '../../components/Breadcrumbs'

export const metadata = {
  title: 'Стать партнёром',
  description: 'Оптовые поставки стеновых панелей и вешалок СТЕПАН для дизайнеров и магазинов.',
  alternates: { canonical: '/partner/' },
}

export default function PartnerPage() {
  return (
    <main className="pt-16">
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Стать партнёром' }]} bg="bg-stone-950" dark />
      <Partner />
    </main>
  )
}
