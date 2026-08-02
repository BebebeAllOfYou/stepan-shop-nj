/**
 * /catalog/[slug]/ — страница отдельной категории каталога
 *
 * slug берётся из поля slug в /public/data/categories.json.
 * Пример: /catalog/panels-painting/ → категория «Панели под покраску»
 *
 * generateStaticParams() — статическая генерация всех страниц категорий.
 * generateMetadata()     — SEO: title, description, canonical.
 * notFound()             — если slug не найден в categories.json.
 */

import { notFound }           from 'next/navigation'
import Breadcrumbs             from '../../../components/Breadcrumbs'
import CategoryProductGrid     from '../../../components/CategoryProductGrid'
import JsonLd                  from '../../../components/JsonLd'
import { SITE_URL }            from '../../../config/site'
import categoriesData          from '../../../../public/data/categories.json'
import productsData            from '../../../../public/data/products.json'

/** Возвращает объект категории по slug или null */
function getCategoryBySlug(slug) {
  return categoriesData.categories.find(
    c => c.slug === slug
  ) ?? null
}

/** Статическая генерация маршрутов для всех категорий (включая «Все товары») */
export function generateStaticParams() {
  return categoriesData.categories
    .filter(c => c.slug)
    .map(c => ({ slug: c.slug }))
}

/** SEO-метаданные страницы категории */
export async function generateMetadata({ params }) {
  const { slug } = await params
  const cat = getCategoryBySlug(slug)
  if (!cat) return {}

  return {
    title:       cat.label,
    description: cat.description,
    alternates:  { canonical: `/catalog/${slug}/` },
    openGraph: {
      title:       cat.label,
      description: cat.description,
      url:         `${SITE_URL}/catalog/${slug}/`,
      ...(cat.image ? { images: [{ url: `${SITE_URL}${cat.image}` }] } : {}),
    },
  }
}

export default async function CategoryPage({ params }) {
  const { slug } = await params
  const cat = getCategoryBySlug(slug)

  // Если slug не существует — стандартная 404
  if (!cat) notFound()

  // Для slug='all' включаем все товары; для остальных — фильтруем по категории
  const categoryProducts = cat.id === 'all'
    ? productsData.products.filter(p => p.name?.trim())
    : productsData.products.filter(p => p.category === cat.id && p.name?.trim())

  // Schema.org ItemList для поисковиков
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type':    'ItemList',
    name:       cat.label,
    description: cat.description,
    numberOfItems: categoryProducts.length,
    itemListElement: categoryProducts.map((p, i) => ({
      '@type':    'ListItem',
      position:   i + 1,
      item: {
        '@type':       'Product',
        name:          p.name,
        description:   p.description,
        image:         `${SITE_URL}${p.image}`,
        category:      p.category,
        offers: {
          '@type':          'Offer',
          price:            p.price,
          priceCurrency:    'RUB',
          availability: p.inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        },
      },
    })),
  }

  // Для «Все товары» хлебные крошки показывают два уровня, для специфичных — три
  const breadcrumbs = cat.id === 'all'
    ? [
        { label: 'Главная', href: '/'       },
        { label: 'Каталог'               },
      ]
    : [
        { label: 'Главная', href: '/'       },
        { label: 'Каталог',  href: '/catalog' },
        { label: cat.label                   },
      ]

  return (
    <main className="pt-16">
      <JsonLd data={itemListJsonLd} />

      <Breadcrumbs items={breadcrumbs} />

      <CategoryProductGrid
        category={cat.id}
        categoryLabel={cat.label}
        categoryDescription={cat.description}
      />
    </main>
  )
}
