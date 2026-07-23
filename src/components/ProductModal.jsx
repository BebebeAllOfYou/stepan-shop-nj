/**
 * ProductModal — модальный предпросмотр товара с полноэкранной галереей интерьеров
 *
 * Props:
 *   product  — объект товара (null = закрыто)
 *   onClose  — коллбек закрытия
 *
 * Содержимое:
 *   • Фото товара
 *   • Название, категория, цена
 *   • Описание и материалы
 *   • Мини-галерея интерьеров (динамически фильтруется под открытый товар)
 *   • Полноэкранный Lightbox для просмотра интерьеров с листалкой и кнопкой закрытия (✕)
 *   • Кнопка «В корзину»
 */

import { useState, useEffect, useCallback } from 'react'
import { useGallery }     from '../hooks/useGallery'

const fmt = n => Number(n).toLocaleString('ru-RU')

export default function ProductModal({ product, onClose }) {
  const { getInteriorsForProduct }  = useGallery()

  // Индекс открытого фото в полноэкранном лайтбоксе (null = закрыт)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  // Динамически получаем интерьеры именно для этого товара
  const productInteriors = product ? getInteriorsForProduct(product, 6) : []

  // Сброс лайтбокса при смене товара
  useEffect(() => {
    setLightboxIndex(null)
  }, [product])

  // Навигация по лайтбоксу
  const prevLightboxImage = useCallback(() => {
    setLightboxIndex(curr => (curr > 0 ? curr - 1 : productInteriors.length - 1))
  }, [productInteriors.length])

  const nextLightboxImage = useCallback(() => {
    setLightboxIndex(curr => (curr < productInteriors.length - 1 ? curr + 1 : 0))
  }, [productInteriors.length])

  // Закрытие и навигация по клавишам (Escape, ←, →)
  const handleKey = useCallback((e) => {
    if (lightboxIndex !== null) {
      if (e.key === 'Escape')     setLightboxIndex(null)
      if (e.key === 'ArrowLeft')  prevLightboxImage()
      if (e.key === 'ArrowRight') nextLightboxImage()
    } else {
      if (e.key === 'Escape') onClose()
    }
  }, [lightboxIndex, onClose, prevLightboxImage, nextLightboxImage])

  useEffect(() => {
    if (!product) return
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [product, handleKey])

  if (!product) return null

  const {
    name        = 'Товар',
    category    = '',
    price       = 0,
    oldPrice    = null,
    image       = null,
    badge       = null,
    description = '',
    materials   = [],
    inStock     = true,
  } = product

  function handleAdd() {
    if (!inStock) return
    addToCart(product)
  }

  const currentInterior = lightboxIndex !== null ? productInteriors[lightboxIndex] : null

  return (
    <>
      {/* ── Основной оверлей предпросмотра товара ── */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm
                   animate-[fadeIn_0.2s_ease]"
      />

      {/* ── Модальное окно товара ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={name}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      >
        <div
          className="relative bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto
                     pointer-events-auto shadow-2xl
                     animate-[slideUp_0.25s_ease]"
          onClick={e => e.stopPropagation()}
        >
          {/* Кнопка закрытия окна предпросмотра */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center
                       text-stone-400 hover:text-stone-900 hover:bg-stone-100
                       transition-colors text-2xl leading-none"
            aria-label="Закрыть предпросмотр"
          >×</button>

          <div className="grid md:grid-cols-2 gap-0">

            {/* Левая колонка: Главное фото товара */}
            <div className="relative bg-stone-100 aspect-[3/4] md:aspect-auto md:min-h-[480px] overflow-hidden">
              {image ? (
                <img
                  src={image}
                  alt={name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-stone-300 text-sm">
                  [Фото товара]
                </div>
              )}

              {/* Бейдж */}
              {badge && (
                <span className={[
                  'absolute top-4 left-4 text-white text-xs px-3 py-1.5 tracking-wide',
                  badge === 'Скидка' ? 'bg-red-500' : 'bg-primary-600',
                ].join(' ')}>
                  {badge}
                </span>
              )}
            </div>

            {/* Правая колонка: Инфо и Галерея */}
            <div className="flex flex-col p-7 gap-6">

              {/* Название + категория */}
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wide mb-1">{category}</p>
                <h2 className="font-display text-2xl text-stone-900 leading-snug">{name}</h2>
              </div>

              {/* Цена */}
              <div className="flex items-baseline gap-3">
                <span className="text-2xl text-primary-600 font-medium">{fmt(price)} ₽</span>
                {oldPrice && (
                  <span className="text-stone-400 line-through text-sm">{fmt(oldPrice)} ₽</span>
                )}
              </div>

              {/* Описание */}
              {description && (
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-wide mb-2">Описание</p>
                  <p className="text-sm text-stone-600 leading-relaxed">{description}</p>
                </div>
              )}

              {/* Материалы */}
              {materials?.length > 0 && (
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-wide mb-2">Материал</p>
                  <div className="flex flex-wrap gap-2">
                    {materials.map(m => (
                      <span
                        key={m}
                        className="text-xs border border-stone-200 text-stone-600 px-3 py-1"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Мини-галерея интерьеров */}
              {productInteriors.length > 0 && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-stone-400 uppercase tracking-wide">В интерьере</p>
                    <span className="text-[11px] text-stone-400">Нажмите для профайла</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {productInteriors.map((item, idx) => (
                      <div
                        key={item.id}
                        onClick={() => setLightboxIndex(idx)}
                        className="relative aspect-square bg-stone-100 overflow-hidden group cursor-pointer border border-transparent hover:border-primary-500 transition-all"
                        title="Открыть на весь экран"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title || item.style}
                            className="absolute inset-0 w-full h-full object-cover
                                       transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-stone-300 text-xs">
                            фото
                          </div>
                        )}
                        <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/40 transition-colors flex items-center justify-center">
                          <span className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity font-medium bg-stone-950/60 px-2 py-1 rounded">
                            🔍 Увеличить
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Кнопки действий */}
              <div className="mt-auto pt-2 flex flex-col gap-3">
                <button
                  onClick={onClose}
                  className="w-full btn-outline justify-center text-sm"
                >
                  Закрыть
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── 🔍 ПОЛНОЭКРАННЫЙ ЛАЙТБОКС (ГАЛЕРЕЯ НА ВЕСЬ ЭКРАН) ── */}
      {lightboxIndex !== null && currentInterior && (
        <div
          className="fixed inset-0 z-[60] bg-stone-950/95 backdrop-blur-md flex flex-col items-center justify-between p-4 md:p-8 animate-[fadeIn_0.2s_ease]"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Верхняя панель: заголовок, счётчик и кнопка закрытия ✕ */}
          <div
            className="w-full max-w-5xl flex items-center justify-between text-white z-10"
            onClick={e => e.stopPropagation()}
          >
            <div>
              <p className="text-xs text-primary-400 uppercase tracking-widest font-medium">
                {currentInterior.style || 'Интерьер'}
              </p>
              <h3 className="font-display text-lg md:text-xl text-white">
                {currentInterior.title || name}
              </h3>
            </div>

            <div className="flex items-center gap-6">
              {/* Счётчик */}
              <span className="text-xs text-stone-400 tracking-wider">
                {lightboxIndex + 1} / {productInteriors.length}
              </span>

              {/* Кнопка закрытия (крестик) */}
              <button
                onClick={() => setLightboxIndex(null)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl transition-colors"
                aria-label="Закрыть галерею и вернуться к товару"
                title="Закрыть просмотр (Escape)"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Центральный блок: Изображение интерьера + Стрелки навигации */}
          <div
            className="relative flex-1 w-full max-w-5xl flex items-center justify-center my-4 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Кнопка НАЗАД (стрелка влево) */}
            {productInteriors.length > 1 && (
              <button
                onClick={prevLightboxImage}
                className="absolute left-2 md:left-4 z-20 w-12 h-12 rounded-full bg-stone-900/60 hover:bg-stone-900 text-white flex items-center justify-center text-xl backdrop-blur-sm transition-all hover:scale-105"
                aria-label="Предыдущее фото"
                title="Предыдущее фото (Клавиша ←)"
              >
                ←
              </button>
            )}

            {/* Главное полноэкранное фото */}
            {currentInterior.image ? (
              <img
                src={currentInterior.image}
                alt={currentInterior.title || name}
                className="max-h-[75vh] max-w-full object-contain shadow-2xl rounded-sm transition-all duration-300"
              />
            ) : (
              <div className="text-stone-400 text-sm">Фото отсутствует</div>
            )}

            {/* Кнопка ВПЕРЕД (стрелка вправо) */}
            {productInteriors.length > 1 && (
              <button
                onClick={nextLightboxImage}
                className="absolute right-2 md:right-4 z-20 w-12 h-12 rounded-full bg-stone-900/60 hover:bg-stone-900 text-white flex items-center justify-center text-xl backdrop-blur-sm transition-all hover:scale-105"
                aria-label="Следующее фото"
                title="Следующее фото (Клавиша →)"
              >
                →
              </button>
            )}
          </div>

          {/* Нижняя подсказка */}
          <div className="text-center text-xs text-stone-400 z-10">
            Используйте стрелки <kbd className="bg-stone-800 px-1.5 py-0.5 rounded text-stone-300">←</kbd> <kbd className="bg-stone-800 px-1.5 py-0.5 rounded text-stone-300">→</kbd> для листания или нажмите <kbd className="bg-stone-800 px-1.5 py-0.5 rounded text-stone-300">Esc</kbd> чтобы вернуться к товару
          </div>
        </div>
      )}
    </>
  )
}
