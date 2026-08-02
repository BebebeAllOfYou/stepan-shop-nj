/**
 * CategoryProductGrid — сетка товаров для страницы отдельной категории
 *
 * Отличие от ProductGrid:
 *   — нет карточек категорий вверху (они на /catalog/)
 *   — принимает проп `category` (строковый id категории из categories.json)
 *   — показывает кнопку «← Весь каталог»
 */

'use client'

import { useState }    from 'react'
import Link            from 'next/link'
import { useProducts } from '../hooks/useProducts'
import ProductCard     from './ProductCard'
import ProductModal    from './ProductModal'

const SORT_OPTIONS = [
  { value: 'default',    label: 'По умолчанию'   },
  { value: 'price-asc',  label: 'Цена: дешевле'  },
  { value: 'price-desc', label: 'Цена: дороже'   },
  { value: 'new',        label: 'Сначала новинки' },
]

/** Скелетон-заглушка товара во время загрузки */
function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 animate-pulse">
      <div className="aspect-[3/4] bg-stone-100" />
      <div className="h-3 w-1/3 bg-stone-100 rounded" />
      <div className="h-4 w-2/3 bg-stone-100 rounded" />
      <div className="h-4 w-1/4 bg-stone-100 rounded" />
    </div>
  )
}

export default function CategoryProductGrid({ category, categoryLabel, categoryDescription }) {
  const [previewProduct, setPreviewProduct] = useState(null)

  const {
    products,
    categories,
    loading,
    error,
    sort,
    setSort,
    showMore,
    hasMore,
    totalFiltered,
  } = useProducts({ initialCategory: category })

  // Берём мета-данные категории из хука (там уже посчитан count)
  const catMeta = categories.find(c => c.id === category)
  const label       = categoryLabel       ?? catMeta?.label       ?? category
  const description = categoryDescription ?? catMeta?.description ?? ''

  return (
    <section id="category-products" className="py-20 bg-white">
      <div className="container-site">

        {/* ── Кнопка «← Весь каталог» ── */}
        <div className="mb-10">
          <Link
            href="/catalog/"
            className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 transition-colors group"
          >
            <svg
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
              className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Весь каталог
          </Link>
        </div>

        {/* ── Заголовок категории ── */}
        <div className="mb-12">
          <p className="section-label mb-2">Категория</p>
          <h1 className="section-title">{label}</h1>
          {description && (
            <p className="mt-3 text-stone-500 max-w-2xl">{description}</p>
          )}
        </div>

        {/* ── Сортировка + счётчик ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pt-2 border-t border-stone-100">
          <div className="flex items-baseline gap-3">
            <h2 className="font-display text-xl text-stone-900">{label}</h2>
            {!loading && (
              <span className="text-sm text-stone-400">{totalFiltered} позиций</span>
            )}
          </div>

          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="text-sm border border-stone-200 px-3 py-2 text-stone-600
                       focus:outline-none focus:border-stone-800 bg-white
                       transition-colors cursor-pointer self-start sm:self-auto"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* ── Ошибка загрузки ── */}
        {error && (
          <div className="py-16 text-center">
            <p className="text-stone-400 text-sm">Не удалось загрузить товары.</p>
            <p className="text-stone-300 text-xs mt-1">{error}</p>
          </div>
        )}

        {/* ── Сетка товаров ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : products.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onCardClick={() => setPreviewProduct(product)}
                />
              ))
          }
        </div>

        {/* ── Пустая категория ── */}
        {!loading && !error && products.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-stone-400 text-lg mb-2">В этой категории пока нет товаров.</p>
            <Link href="/catalog/" className="btn-outline text-xs mt-2 inline-block">
              Смотреть все товары
            </Link>
          </div>
        )}

        {/* ── Счётчик + «Показать ещё» ── */}
        {!loading && products.length > 0 && (
          <div className="mt-12 flex flex-col items-center gap-4">
            <p className="text-xs text-stone-400">
              Показано {products.length} из {totalFiltered}
            </p>
            {hasMore && (
              <button onClick={showMore} className="btn-outline">
                Показать ещё
              </button>
            )}
          </div>
        )}

      </div>

      {/* Модальный предпросмотр товара */}
      <ProductModal
        product={previewProduct}
        onClose={() => setPreviewProduct(null)}
      />
    </section>
  )
}
