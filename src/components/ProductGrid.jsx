/**
 * ProductGrid — каталог с визуальными карточками категорий и сеткой товаров.
 *
 * Данные загружаются из:
 *   /public/data/products.json   — товары
 *   /public/data/categories.json — категории (image, description, label)
 *
 * Чтобы добавить новую категорию:
 *   1. Добавьте объект в categories.json (перед блоком "all")
 *   2. Разместите картинку в /public/images/categories/
 *   3. В products.json укажите нужный category у товаров
 */

'use client'

import { useRef, useState } from 'react'
import { useProducts }      from '../hooks/useProducts'
import ProductCard          from './ProductCard'
import ProductModal         from './ProductModal'

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

/** Скелетон карточки категории */
function SkeletonCategory() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/3] bg-stone-100 mb-3" />
      <div className="h-4 w-1/2 bg-stone-100 rounded mb-2" />
      <div className="h-3 w-full bg-stone-50 rounded" />
    </div>
  )
}

/** Карточка одной категории */
function CategoryCard({ cat, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        'group text-left w-full transition-all duration-300 focus:outline-none',
        isActive ? 'ring-2 ring-primary-600 ring-offset-2' : '',
      ].join(' ')}
    >
      {/* Картинка */}
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 mb-3">
        {cat.image ? (
          <img
            src={cat.image}
            alt={cat.label}
            className={[
              'w-full h-full object-cover transition-all duration-500',
              'group-hover:scale-105',
              isActive ? 'brightness-90' : 'brightness-100',
            ].join(' ')}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-stone-300 text-sm">
            [Фото категории]
          </div>
        )}

        {/* Оверлей при активной */}
        <div className={[
          'absolute inset-0 bg-primary-900/30 transition-opacity duration-300',
          isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-20',
        ].join(' ')} />

        {/* Счётчик товаров */}
        <span className={[
          'absolute top-3 right-3 text-xs px-2.5 py-1 font-medium tracking-wide',
          isActive
            ? 'bg-primary-600 text-white'
            : 'bg-white/90 text-stone-700',
        ].join(' ')}>
          {cat.count}
        </span>

        {/* Галочка активной */}
        {isActive && (
          <span className="absolute top-3 left-3 bg-primary-600 text-white text-xs px-2 py-1">
            ✓ Выбрано
          </span>
        )}
      </div>

      {/* Текст */}
      <h3 className={[
        'font-display text-base leading-snug mb-1 transition-colors',
        isActive ? 'text-primary-700' : 'text-stone-900 group-hover:text-primary-700',
      ].join(' ')}>
        {cat.label}
      </h3>

      {cat.description && (
        <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">
          {cat.description}
        </p>
      )}
    </button>
  )
}

export default function ProductGrid() {
  const productsRef = useRef(null)

  const [previewProduct, setPreviewProduct] = useState(null)

  const {
    products,
    categories,
    loading,
    error,
    activeCategory,
    setActiveCategory,
    sort,
    setSort,
    showMore,
    hasMore,
    totalFiltered,
  } = useProducts()

  function handleCategoryClick(catId) {
    setActiveCategory(catId)
    // Плавный скролл к сетке товаров
    setTimeout(() => {
      productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  return (
    <section id="catalog" className="py-20 bg-white">
      <div className="container-site">

        {/* ── Заголовок ── */}
        <div className="mb-12">
          <p className="section-label mb-2">Каталог</p>
          <h1 className="section-title">Наши коллекции</h1>
        </div>

        {/* ── Карточки категорий ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-16">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCategory key={i} />)
            : categories.map(cat => (
                <CategoryCard
                  key={cat.id}
                  cat={cat}
                  isActive={activeCategory === cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                />
              ))
          }
        </div>

        {/* ── Заголовок сетки товаров + сортировка ── */}
        <div
          ref={productsRef}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pt-2 border-t border-stone-100"
        >
          <div className="flex items-baseline gap-3">
            <h2 className="font-display text-xl text-stone-900">
              {categories.find(c => c.id === activeCategory)?.label ?? 'Все товары'}
            </h2>
            {!loading && (
              <span className="text-sm text-stone-400">{totalFiltered} позиций</span>
            )}
          </div>

          {/* Сортировка */}
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
            <button
              onClick={() => handleCategoryClick('all')}
              className="btn-outline text-xs mt-2"
            >
              Смотреть все товары
            </button>
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
