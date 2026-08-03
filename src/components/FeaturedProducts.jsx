/**
 * FeaturedProducts — секция «Хиты продаж» на главной странице
 *
 * Показывает первые 4 товара со статусом inStock из products.json.
 * При клике открывается ProductModal (или переход на Wildberries).
 * Цены обновляются через Google Sheets (useProducts).
 */

'use client'

import { useState }    from 'react'
import Link            from 'next/link'
import { useProducts } from '../hooks/useProducts'
import ProductCard     from './ProductCard'
import ProductModal    from './ProductModal'

export default function FeaturedProducts() {
  const { allProducts, loading } = useProducts()
  const [selected, setSelected]  = useState(null)

  /* Берём первые 4 товара в наличии */
  const featured = (allProducts ?? []).filter(p => p.inStock !== false).slice(0, 4)

  return (
    <section id="featured" className="py-16 bg-stone-50">
      <div className="container-site">

        {/* Заголовок */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="section-label mb-2">Популярное</p>
            <h2 className="section-title">Хиты продаж</h2>
          </div>
          <Link href="/catalog" className="btn-ghost hidden md:inline-flex">
            Весь каталог →
          </Link>
        </div>

        {/* Скелетон загрузки */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-stone-200 rounded-sm" />
                <div className="mt-3 space-y-2">
                  <div className="h-3 bg-stone-200 rounded w-1/3" />
                  <div className="h-4 bg-stone-200 rounded w-2/3" />
                  <div className="h-4 bg-stone-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Карточки товаров */}
        {!loading && featured.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featured.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onCardClick={() => setSelected(product)}
              />
            ))}
          </div>
        )}

        {/* Кнопка «Весь каталог» для мобиле */}
        <div className="mt-8 text-center md:hidden">
          <Link href="/catalog" className="btn-outline">Весь каталог</Link>
        </div>

      </div>

      {/* Модал товара */}
      <ProductModal
        product={selected}
        onClose={() => setSelected(null)}
      />
    </section>
  )
}
