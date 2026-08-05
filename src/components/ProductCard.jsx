/**
 * ProductCard — карточка товара
 *
 * Поддерживает Hover Image Preview / Hover Gallery:
 * При наведении мыши карточка делится на зоны, каждая зона показывает
 * своё фото. Фото берутся из поля product.images или автоматически
 * ищутся в папке /images/products/product_{id}/photo_N.jpg
 * (до 3 доп. фото + основное).
 *
 * Отсутствующие файлы отфильтровываются по URL (не по индексу —
 * это ключевое исправление баги предыдущей версии).
 */

'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'

export default function ProductCard({ product = {}, onCardClick }) {
  const {
    id,
    name            = 'Название товара',
    category        = 'Категория',
    price           = 0,
    oldPrice        = null,
    image           = null,
    images          = null,
    badge           = null,
    wildberriesLink = null,
    inStock         = true,
  } = product

  const fmt = n => Number(n).toLocaleString('ru-RU')

  // ── Список фотографий ──────────────────────────────────────────────
  // Используем массив images[], если он передан, иначе только основное фото image.
  // Это полностью устраняет избыточные 404-запросы к оптимизатору Next.js.
  const candidateImages = useMemo(() => {
    if (Array.isArray(images) && images.length > 0) return images
    return image ? [image] : []
  }, [image, images])

  // Отслеживаем сломанные картинки по их URL (не по индексу!) ─────────────────
  // Это исправляет баг: после удаления первого элемента индексы
  // в validImages сдвигались, и фильтрация кандидатов шла не по тем позициям.
  const [failedUrls, setFailedUrls] = useState({})

  const handleImageError = (url) => {
    setFailedUrls(prev => ({ ...prev, [url]: true }))
  }

  const validImages = useMemo(
    () => candidateImages.filter(url => !failedUrls[url]),
    [candidateImages, failedUrls],
  )

  // ── Активный индекс (управляется движением мыши) ────────────────────────────
  const [activeIndex, setActiveIndex] = useState(0)

  const safeIndex = activeIndex < validImages.length ? activeIndex : 0

  const handleMouseMove = (e) => {
    if (validImages.length <= 1) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x    = e.clientX - rect.left
    const zone = Math.min(
      Math.floor(x / (rect.width / validImages.length)),
      validImages.length - 1,
    )
    if (zone !== activeIndex) setActiveIndex(zone)
  }

  const handleMouseLeave = () => setActiveIndex(0)

  // ── Рендер фото-блока ───────────────────────────────────────────────────────
  const PhotoBlock = (
    <div
      className="absolute inset-0"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Все кандидаты наложены друг на друга; видна только активная */}
      {validImages.length > 0 ? (
        validImages.map((src, idx) => (
          <Image
            key={src}
            src={src}
            alt={`${name} — фото ${idx + 1}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => handleImageError(src)}
            className={[
              'object-cover transition-opacity duration-300',
              idx === safeIndex ? 'opacity-100' : 'opacity-0 pointer-events-none',
            ].join(' ')}
          />
        ))
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-stone-300 text-sm">
          [Фото товара]
        </div>
      )}

      {/* Индикаторы — тонкие полоски снизу, появляются при наведении и когда > 1 фото */}
      {validImages.length > 1 && (
        <div className="absolute bottom-2 left-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          {validImages.map((_, idx) => (
            <div
              key={idx}
              className={[
                'h-[3px] flex-1 rounded-full transition-colors duration-200',
                idx === safeIndex ? 'bg-white' : 'bg-white/40',
              ].join(' ')}
            />
          ))}
        </div>
      )}

      {/* Бейдж */}
      {badge && (
        <span className={[
          'absolute top-3 left-3 text-white text-xs px-2 py-1 tracking-wide z-10 pointer-events-none',
          badge === 'Скидка' ? 'bg-red-500' : 'bg-primary-600',
        ].join(' ')}>
          {badge}
        </span>
      )}

      {/* Нет в наличии */}
      {!inStock && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 pointer-events-none">
          <span className="text-xs tracking-widest uppercase text-stone-500 bg-white px-3 py-1 border border-stone-200">
            Нет в наличии
          </span>
        </div>
      )}
    </div>
  )

  return (
    <article className="group relative flex flex-col bg-white">

      {/* Фото-область: если есть Wildberries — внешняя ссылка, иначе модаль */}
      {wildberriesLink ? (
        <a
          href={wildberriesLink}
          target="_blank"
          rel="noopener noreferrer"
          className="relative aspect-[3/4] bg-stone-100 overflow-hidden block"
        >
          {PhotoBlock}
        </a>
      ) : (
        <div
          className="relative aspect-[3/4] bg-stone-100 overflow-hidden cursor-pointer"
          onClick={onCardClick}
        >
          {PhotoBlock}
        </div>
      )}

      {/* Текстовая часть карточки */}
      <div
        className="pt-4 pb-2 flex flex-col gap-1 cursor-pointer"
        onClick={onCardClick}
      >
        <p className="text-xs text-stone-400 tracking-wide uppercase">{category}</p>
        <h3 className="font-display text-stone-900 leading-snug">{name}</h3>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-primary-600 font-medium">{fmt(price)} ₽</p>
          {oldPrice && (
            <p className="text-xs text-stone-400 line-through">{fmt(oldPrice)} ₽</p>
          )}
        </div>
      </div>

    </article>
  )
}
