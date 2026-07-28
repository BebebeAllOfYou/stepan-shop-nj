/**
 * ProductModal — модальный предпросмотр товара
 *
 * Содержит:
 *   • Фото товара
 *   • Название, категория, цена
 *   • Выбор количества (шт.)
 *   • Описание и материалы
 *   • Кнопка «Добавить в корзину»
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

  const itemTotal = price * quantity

  function handleQuantityChange(val) {
    const parsed = parseInt(val, 10)
    setQuantity(isNaN(parsed) || parsed < 1 ? 1 : parsed)
  }

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
        className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-6 pointer-events-none"
      >
        <div
          className="relative bg-white w-full max-w-5xl max-h-[92vh] overflow-y-auto
                     pointer-events-auto shadow-2xl rounded-sm animate-[slideUp_0.25s_ease]"
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
                  'absolute top-4 left-4 text-white text-xs px-3 py-1.5 tracking-wide z-10 font-medium',
                  badge === 'Скидка' ? 'bg-red-500' : 'bg-primary-600',
                ].join(' ')}>{badge}</span>
              )}
            </div>

            {/* ── Правая колонка: Инфо + Выбор количества ── */}
            <div className="flex flex-col p-6 md:p-8 gap-6 overflow-y-auto">

              {/* Название */}
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">{category}</p>
                <h2 className="font-display text-2xl md:text-3xl text-stone-900 leading-snug">{name}</h2>
              </div>

              {/* Базовая цена */}
              <div className="flex items-baseline gap-3 pb-4 border-b border-stone-100">
                <span className="text-2xl text-primary-600 font-medium">{fmtR(price)}</span>
                <span className="text-xs text-stone-400">/ шт.</span>
                {oldPrice && (
                  <span className="text-stone-400 line-through text-sm">{fmtR(oldPrice)}</span>
                )}
              </div>

              {/* Описание */}
              {description && (
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Описание</p>
                  <p className="text-sm text-stone-600 leading-relaxed">{description}</p>
                </div>
              )}

              {/* Выбор количества */}
              <div className="space-y-2">
                <label className="block text-xs text-stone-500 uppercase tracking-wider">
                  Количество (шт.):
                </label>
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Счётчик */}
                  <div className="flex items-center border border-stone-300 rounded-lg bg-white overflow-hidden shadow-sm">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className="w-10 h-11 bg-stone-100 hover:bg-stone-200 text-stone-700
                                 font-bold text-xl flex items-center justify-center transition-colors"
                    >−</button>
                    <input
                      type="number"
                      min="1" max="99999"
                      value={quantity}
                      onChange={e => handleQuantityChange(e.target.value)}
                      className="w-20 h-11 text-center font-bold text-stone-900 text-base
                                 focus:outline-none bg-transparent tabular-nums"
                    />
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="w-10 h-11 bg-stone-100 hover:bg-stone-200 text-stone-700
                                 font-bold text-xl flex items-center justify-center transition-colors"
                    >+</button>
                  </div>

                  {/* Быстрые кнопки */}
                  <div className="flex gap-1.5 flex-wrap">
                    {[1, 5, 10, 20, 50].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setQuantity(preset)}
                        className={[
                          'px-3 py-2 text-xs font-medium rounded-md transition-colors border',
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
              </div>

              {/* Материалы */}
              {materials?.length > 0 && (
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">Материалы</p>
                  <div className="flex flex-wrap gap-2">
                    {materials.map(m => (
                      <span key={m} className="text-xs border border-stone-200 text-stone-600 px-3 py-1 rounded">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Кнопки действий */}
              <div className="mt-auto pt-4 flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    addToCart(product, quantity)
                    onClose()
                  }}
                  disabled={!inStock}
                  className="w-full btn-primary justify-center py-3.5 text-base font-medium shadow-md disabled:opacity-50"
                >
                  {inStock
                    ? `Добавить в корзину (${quantity} шт.) — ${fmtR(itemTotal)}`
                    : 'Нет в наличии'}
                </button>

                <button
                  onClick={onClose}
                  className="w-full btn-outline justify-center text-xs py-2 text-stone-500"
                >
                  Продолжить покупки
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
