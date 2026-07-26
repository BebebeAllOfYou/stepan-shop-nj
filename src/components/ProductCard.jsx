/**
 * ProductCard — карточка товара
 *
 * Поддерживает Hover Image Preview / Hover Gallery:
 * При наведении мыши на карточку товара изображения перелистываются
 * в зависимости от положения курсора (основное фото + до 3 дополнительных
 * из папки /images/products/product_{id}/photo_1.jpg... или массива product.images).
 */

'use client'

import { useState, useMemo } from 'react'

export default function ProductCard({ product = {}, onCardClick }) {
  const {
    id,
    name      = 'Название товара',
    category  = 'Категория',
    price     = 0,
    oldPrice  = null,
    image     = null,
    images    = null,
    badge     = null,
    wildberriesLink = null,
    inStock   = true,
  } = product

  const fmt = n => Number(n).toLocaleString('ru-RU')

  // 1. Формируем список кандидатов на изображения
  const candidateImages = useMemo(() => {
    if (Array.isArray(images) && images.length > 0) {
      return images
    }
    const folderPath = `/images/products/product_${id}`
    return [
      image,
      `${folderPath}/photo_1.jpg`,
      `${folderPath}/photo_2.jpg`,
      `${folderPath}/photo_3.jpg`,
    ].filter(Boolean)
  }, [id, image, images])

  // Состояние отсутствующих (ненайденных) изображений
  const [failedIndices, setFailedIndices] = useState({})
  const [activeIndex, setActiveIndex]     = useState(0)

  const handleImageError = (idx) => {
    setFailedIndices(prev => ({ ...prev, [idx]: true }))
  }

  // Только реально доступные картинки
  const validImages = candidateImages.filter((_, idx) => !failedIndices[idx])

  const safeActiveIndex = activeIndex < validImages.length ? activeIndex : 0

  // Расчёт активной фотографии по горизонтальному положению мыши
  const handleMouseMove = (e) => {
    if (validImages.length <= 1) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const segmentWidth = rect.width / validImages.length
    const index = Math.min(Math.floor(x / segmentWidth), validImages.length - 1)
    if (index >= 0 && index !== activeIndex) {
      setActiveIndex(index)
    }
  }

  const handleMouseLeave = () => {
    setActiveIndex(0)
  }

  const PhotoContent = (
    <div
      className="relative w-full h-full"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {validImages.length > 0 ? (
        validImages.map((imgSrc, idx) => (
          <img
            key={imgSrc + idx}
            src={imgSrc}
            alt={`${name} — фото ${idx + 1}`}
            onError={() => handleImageError(idx)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              idx === safeActiveIndex ? 'opacity-100 scale-105' : 'opacity-0 pointer-events-none'
            }`}
          />
        ))
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-stone-300 text-sm">
          [Фото товара]
        </div>
      )}

      {/* Индикаторы штрихов (дефисов) снизу карточки при > 1 фото */}
      {validImages.length > 1 && (
        <div className="absolute bottom-2 left-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          {validImages.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-all duration-200 ${
                idx === safeActiveIndex ? 'bg-primary-600 shadow-sm' : 'bg-white/70 backdrop-blur-sm'
              }`}
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

      {/* Фото — открывает модаль, если нет ссылки на Wildberries */}
      {wildberriesLink ? (
        <a
          href={wildberriesLink}
          target="_blank"
          rel="noopener noreferrer"
          className="relative aspect-[3/4] bg-stone-100 overflow-hidden block"
        >
          {PhotoContent}
        </a>
      ) : (
        <div
          className="relative aspect-[3/4] bg-stone-100 overflow-hidden cursor-pointer"
          onClick={onCardClick}
        >
          {PhotoContent}
        </div>
      )}

      {/* Инфо — тоже открывает модаль */}
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
