/**
 * ProductModal — модальный предпросмотр товара
 *
 * Содержит 6 полных разделов информации:
 *   1. Описание
 *   2. Основная информация (Артикул, Бренд, Страна, Тип монтажа и т.д.)
 *   3. Общие характеристики
 *   4. Материалы
 *   5. Габариты (Ш × В × Г, Вес)
 *   6. Дополнительная информация
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useCartContext } from '../context/CartContext'

const fmt  = n => Number(n).toLocaleString('ru-RU')
const fmtR = n => `${fmt(Math.round(n))} ₽`

export default function ProductModal({ product, onClose }) {
  const { addToCart } = useCartContext()

  // ── ВСЕ ХУКИ ВЫШЕ УСЛОВНОГО RETURN ────────────────────────────────────────
  const [quantity, setQuantity] = useState(1)

  // Сброс количества при смене товара
  useEffect(() => { setQuantity(1) }, [product])

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

  // ── Условный return строго ПОСЛЕ всех хуков ──────────────────────────────
  if (!product) return null

  const {
    name           = 'Товар',
    category       = '',
    price          = 0,
    oldPrice       = null,
    image          = null,
    badge          = null,
    description    = '',
    mainInfo       = null,
    generalSpecs   = null,
    materials      = [],
    additionalInfo = '',
    dimensions     = null,
    inStock        = true,
  } = product

  const itemTotal = price * quantity

  function handleQuantityChange(val) {
    const parsed = parseInt(val, 10)
    setQuantity(isNaN(parsed) || parsed < 1 ? 1 : parsed)
  }

  // Форматирование габаритов
  const formattedDimensions = (() => {
    if (!dimensions) return null
    if (typeof dimensions === 'string') return dimensions
    const parts = []
    if (dimensions.width)  parts.push(`Ширина: ${dimensions.width} см`)
    if (dimensions.height) parts.push(`Высота: ${dimensions.height} см`)
    if (dimensions.depth)  parts.push(`Глубина/Толщина: ${dimensions.depth} см`)
    if (dimensions.weight) parts.push(`Вес: ${dimensions.weight}`)
    return parts.length > 0 ? parts : null
  })()

  return (
    <>
      {/* Оверлей */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[70] bg-stone-950/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
      />

      {/* Модальное окно */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={name}
        className="fixed inset-0 z-[70] flex items-center justify-center p-3 md:p-6 pointer-events-none"
      >
        <div
          className="relative bg-white w-full max-w-5xl h-[calc(100vh-24px)] md:h-[calc(100vh-48px)] overflow-y-auto
                     pointer-events-auto shadow-2xl rounded-lg animate-[slideUp_0.25s_ease]"
          onClick={e => e.stopPropagation()}
        >
          {/* Кнопка закрытия */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center
                       text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full
                       transition-colors text-2xl leading-none"
            aria-label="Закрыть"
          >×</button>

          <div className="grid md:grid-cols-2 gap-0 min-h-full">

            {/* ── Левая колонка: Фото ── */}
            <div className="relative bg-stone-100 aspect-[4/3] md:aspect-auto md:h-full overflow-hidden min-h-[300px]">
              {image ? (
                <Image src={image} alt={name} fill priority sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-stone-300 text-sm">
                  [Фото товара]
                </div>
              )}
              {badge && (
                <span className={[
                  'absolute top-4 left-4 text-white text-xs px-3 py-1.5 tracking-wide z-10 font-medium rounded',
                  badge === 'Скидка' ? 'bg-red-500' : 'bg-primary-600',
                ].join(' ')}>{badge}</span>
              )}
            </div>

            {/* ── Правая колонка: Все 6 пунктов информации ── */}
            <div className="flex flex-col p-6 md:p-8 gap-6 overflow-y-auto">

              {/* Название и Категория */}
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wider mb-1 font-medium">{category}</p>
                <h2 className="font-display text-2xl md:text-3xl text-stone-900 leading-snug">{name}</h2>
              </div>

              {/* Базовая цена */}
              <div className="flex items-baseline gap-3 pb-4 border-b border-stone-100">
                <span className="text-2xl md:text-3xl text-primary-600 font-bold font-display">{fmtR(price)}</span>
                <span className="text-xs text-stone-400">/ шт.</span>
                {oldPrice && (
                  <span className="text-stone-400 line-through text-sm">{fmtR(oldPrice)}</span>
                )}
              </div>

              {/* Выбор количества и кнопка в корзину */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80 space-y-3">
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  Количество (шт.):
                </label>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden shadow-sm">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className="w-10 h-10 bg-stone-100 hover:bg-stone-200 text-stone-700
                                 font-bold text-lg flex items-center justify-center transition-colors"
                    >−</button>
                    <input
                      type="number"
                      min="1" max="99999"
                      value={quantity}
                      onChange={e => handleQuantityChange(e.target.value)}
                      className="w-20 h-10 text-center font-bold text-stone-900 text-base
                                 focus:outline-none bg-transparent tabular-nums"
                    />
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="w-10 h-10 bg-stone-100 hover:bg-stone-200 text-stone-700
                                 font-bold text-xl flex items-center justify-center transition-colors"
                    >+</button>
                  </div>

                  <div className="flex gap-1.5 flex-wrap">
                    {[1, 4, 10, 20].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setQuantity(preset)}
                        className={[
                          'px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors border',
                          quantity === preset
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100',
                        ].join(' ')}
                      >
                        {preset} шт
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    addToCart(product, quantity)
                    onClose()
                  }}
                  disabled={!inStock}
                  className="w-full btn-primary justify-center py-3 text-sm md:text-base font-semibold shadow-md disabled:opacity-50 mt-2"
                >
                  {inStock
                    ? `Добавить в корзину (${quantity} шт.) — ${fmtR(itemTotal)}`
                    : 'Нет в наличии'}
                </button>
              </div>

              {/* ──────────────── 1. ОПИСАНИЕ ──────────────── */}
              {description && (
                <div className="space-y-1.5">
                  <h3 className="text-xs text-stone-900 uppercase tracking-wider font-bold flex items-center gap-1.5">
                    <span>📝 Описание</span>
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed bg-white p-3 rounded border border-stone-100">
                    {description}
                  </p>
                </div>
              )}

              {/* ──────────────── 2. ОСНОВНАЯ ИНФОРМАЦИЯ ──────────────── */}
              {mainInfo && (
                <div className="space-y-2">
                  <h3 className="text-xs text-stone-900 uppercase tracking-wider font-bold flex items-center gap-1.5">
                    <span>📌 Основная информация</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {Object.entries(mainInfo).map(([key, val]) => (
                      <div key={key} className="bg-stone-50 p-2.5 rounded border border-stone-200/60 flex justify-between">
                        <span className="text-stone-500">{key}:</span>
                        <span className="font-semibold text-stone-800 text-right ml-2">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ──────────────── 3. ОБЩИЕ ХАРАКТЕРИСТИКИ ──────────────── */}
              {generalSpecs && (
                <div className="space-y-2">
                  <h3 className="text-xs text-stone-900 uppercase tracking-wider font-bold flex items-center gap-1.5">
                    <span>⚙️ Общие характеристики</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {Object.entries(generalSpecs).map(([key, val]) => (
                      <div key={key} className="bg-stone-50 p-2.5 rounded border border-stone-200/60 flex justify-between">
                        <span className="text-stone-500">{key}:</span>
                        <span className="font-semibold text-stone-800 text-right ml-2">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ──────────────── 4. ГАБАРИТЫ ──────────────── */}
              {formattedDimensions && (
                <div className="space-y-2">
                  <h3 className="text-xs text-stone-900 uppercase tracking-wider font-bold flex items-center gap-1.5">
                    <span>📐 Габариты</span>
                  </h3>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {Array.isArray(formattedDimensions) ? (
                      formattedDimensions.map((item, idx) => (
                        <span key={idx} className="bg-stone-100 text-stone-800 font-medium px-3 py-1.5 rounded border border-stone-200">
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="bg-stone-100 text-stone-800 font-medium px-3 py-1.5 rounded border border-stone-200">
                        {formattedDimensions}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* ──────────────── 5. МАТЕРИАЛЫ ──────────────── */}
              {materials?.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs text-stone-900 uppercase tracking-wider font-bold flex items-center gap-1.5">
                    <span>🪵 Материалы</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {materials.map(m => (
                      <span key={m} className="text-xs bg-emerald-50 text-emerald-800 font-semibold px-3 py-1.5 rounded border border-emerald-200">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* ──────────────── 6. ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ ──────────────── */}
              {additionalInfo && (
                <div className="space-y-1.5">
                  <h3 className="text-xs text-stone-900 uppercase tracking-wider font-bold flex items-center gap-1.5">
                    <span>ℹ️ Дополнительная информация</span>
                  </h3>
                  <div className="text-xs bg-amber-50 text-amber-900 p-3 rounded-lg border border-amber-200 leading-relaxed">
                    {additionalInfo}
                  </div>
                </div>
              )}

              {/* Кнопка закрытия */}
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="w-full btn-outline justify-center text-xs py-2.5 text-stone-500"
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
