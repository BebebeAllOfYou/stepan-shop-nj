/** Страница каталога */

import ProductGrid from '../../components/ProductGrid'
import Breadcrumbs from '../../components/Breadcrumbs'
import JsonLd      from '../../components/JsonLd'
import { SITE_URL } from '../../config/site'
import productsData from '../../../public/data/products.json'

export const metadata = {
  title: 'Каталог',
  description: 'Каталог декоративных стеновых панелей, реек и настенных вешалок из МДФ.',
  alternates: { canonical: '/catalog/' },
}

// ItemList товаров для поисковиков (базовые цены из products.json)
const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Каталог товаров',
  numberOfItems: productsData.products.length,
  itemListElement: productsData.products.map((p, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    item: {
      '@type': 'Product',
      name: p.name,
      description: p.description,
      image: `${SITE_URL}${p.image}`,
      category: p.category,
      offers: {
        '@type': 'Offer',
        price: p.price,
        priceCurrency: 'RUB',
        availability: p.inStock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      },
    },
  })),
}

export default function CatalogPage() {
  return (
    <main className="pt-16">
      <JsonLd data={itemListJsonLd} />
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Каталог' }]} />
      <ProductGrid />
    </main>
  )
}
