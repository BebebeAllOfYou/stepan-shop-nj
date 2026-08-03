/**
 * CategoryBanner — плиточная навигация по категориям товаров (как у IKEA/Hoff)
 *
 * Данные о категориях берутся из /public/data/categories.json
 * Картинки должны лежать в /public/images/categories/
 */

import Link  from 'next/link'
import Image from 'next/image'
import categoriesData from '../../public/data/categories.json'

const CATEGORY_LINKS = {
  'Панели под покраску':   '/catalog?category=Панели+под+покраску',
  'Вешалки монолит в цвете': '/catalog?category=Вешалки+монолит+в+цвете',
  'Панели Монолит в цвете':  '/catalog?category=Панели+Монолит+в+цвете',
  'all':                    '/catalog',
}

export default function CategoryBanner() {
  /* Фильтруем — берём только те, у которых есть картинка */
  const cats = (categoriesData?.categories ?? []).filter(c => c.image)

  if (cats.length === 0) return null

  return (
    <section id="categories" className="py-16 bg-white">
      <div className="container-site">

        {/* Заголовок блока */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="section-label mb-2">Каталог</p>
            <h2 className="section-title">Выберите категорию</h2>
          </div>
          <Link href="/catalog" className="btn-ghost hidden md:inline-flex">
            Все товары →
          </Link>
        </div>

        {/* Плитки категорий */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {cats.map((cat, idx) => {
            const href = CATEGORY_LINKS[cat.id] ?? '/catalog'
            const isLarge = idx === 0 && cats.length >= 4

            return (
              <Link
                key={cat.id}
                href={href}
                id={`category-tile-${cat.slug}`}
                className={[
                  'group relative overflow-hidden bg-stone-100 rounded-sm',
                  isLarge ? 'row-span-1 md:row-span-2' : '',
                  'aspect-[3/4] md:aspect-auto md:min-h-[280px]',
                ].join(' ')}
              >
                {/* Картинка */}
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />

                {/* Затемнение */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-900/20 to-transparent
                                group-hover:from-stone-950/80 transition-all duration-300" />

                {/* Текст */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                  <p className="font-display text-white text-base md:text-xl leading-tight mb-1.5">
                    {cat.label}
                  </p>
                  {cat.description && (
                    <p className="text-stone-300 text-xs leading-relaxed hidden md:block">
                      {cat.description}
                    </p>
                  )}
                  <span className="mt-3 inline-flex items-center gap-1 text-xs text-primary-300
                                   font-semibold tracking-wide opacity-0 group-hover:opacity-100
                                   translate-y-1 group-hover:translate-y-0 transition-all duration-200">
                    Смотреть →
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Мобиле: кнопка "Весь каталог" */}
        <div className="mt-6 text-center md:hidden">
          <Link href="/catalog" className="btn-outline">Весь каталог</Link>
        </div>

      </div>
    </section>
  )
}
