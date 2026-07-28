/**
 * ProductModal — модальный предпросмотр товара
 *
 * Props:
 *   product  — объект товара (null = закрыто)
 *   onClose  — коллбек закрытия
 *
 * Содержимое:
 *   • Фото товара
 *   • Название, категория, цена
 *   • Описание и материалы
 *   • Кнопка «Закрыть»
 */

'use client'

import { useEffect, useCallback } from 'react'
import Image from 'next/image'

const fmt = n => Number(n).toLocaleString('ru-RU')

export default function ProductModal({ product, onClose }) {

  // Закрытие по Escape
  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

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

  return (
    <>
      {/* ── Основной оверлей предпросмотра товара ── */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[70] bg-stone-950/60 backdrop-blur-sm
                   animate-[fadeIn_0.2s_ease]"
      />

      {/* ── Модальное окно товара ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={name}
        className="fixed inset-0 z-[70] flex items-center justify-center p-6 pointer-events-none"
      >
        <div
          className="relative bg-white w-full max-w-6xl h-[calc(100vh-48px)] overflow-y-auto
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

          <div className="grid md:grid-cols-2 gap-0 h-full">

            {/* Левая колонка: Главное фото товара */}
            <div className="relative bg-stone-100 aspect-[3/4] md:aspect-auto md:h-full overflow-hidden">
              {image ? (
                <Image
                  src={image}
                  alt={name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
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

            {/* Правая колонка: Инфо */}
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
    </>
  )
}
