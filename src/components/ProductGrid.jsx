/**
 * ProductGrid — страница каталога с визуальными карточками категорий.
 *
 * Теперь показывает ТОЛЬКО сетку карточек категорий.
 * При нажатии на любую карточку (в т.ч. «Все товары»)
 * происходит переход на отдельную страницу /catalog/[slug]/.
 *
 * Данные загружаются из:
 *   /public/data/categories.json — категории (image, description, label, slug)
 *
 * Чтобы добавить новую категорию:
 *   1. Добавьте объект в categories.json (перед блоком "all")
 *   2. Разместите картинку в /public/images/categories/
 *   3. В products.json укажите нужный category у товаров
 */

'use client'

import { useRouter }   from 'next/navigation'
import Image          from 'next/image'
import { useProducts } from '../hooks/useProducts'

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
function CategoryCard({ cat, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group text-left w-full transition-all duration-300 focus:outline-none"
    >
      {/* Картинка */}
      <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 mb-3">
        {cat.image ? (
          <Image
            src={cat.image}
            alt={cat.label}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
            className="object-cover transition-all duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-stone-300 text-sm">
            [Фото категории]
          </div>
        )}

        {/* Оверлей при наведении */}
        <div className="absolute inset-0 bg-primary-900/30 transition-opacity duration-300 opacity-0 group-hover:opacity-100" />

        {/* Счётчик товаров */}
        <span className="absolute top-3 right-3 text-xs px-2.5 py-1 font-medium tracking-wide bg-white/90 text-stone-700 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
          {cat.count ?? ''}
        </span>

        {/* Подсказка «Смотреть» при наведении */}
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-white px-3 py-1 bg-primary-600/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Смотреть товары →
        </span>
      </div>

      {/* Текст */}
      <h3 className="font-display text-base leading-snug mb-1 transition-colors text-stone-900 group-hover:text-primary-700">
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
  const router = useRouter()

  const { categories, loading } = useProducts()

  function handleCategoryClick(cat) {
    router.push(`/catalog/${cat.slug}/`)
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 items-start">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCategory key={i} />)
            : categories.map(cat => (
                <CategoryCard
                  key={cat.id}
                  cat={cat}
                  onClick={() => handleCategoryClick(cat)}
                />
              ))
          }
        </div>

      </div>
    </section>
  )
}
