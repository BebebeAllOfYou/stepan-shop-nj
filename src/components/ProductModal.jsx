/**
 * ProductModal — модальный предпросмотр товара с калькулятором скидок от объёма
 *
 * Props:
 *   product  — объект товара (null = закрыто)
 *   onClose  — коллбек закрытия
 */

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { useCartContext } from '../context/CartContext'
import { getProductDiscounts, calculateDiscountPrice } from '../utils/discountCalculator'

const fmt = n => Number(n).toLocaleString('ru-RU')

export default function ProductModal({ product, onClose }) {
  const { addToCart } = useCartContext()

  // Количество товара в калькуляторе
  const [quantity, setQuantity] = useState(1)

  // Сброс количества при смене товара
  useEffect(() => {
    setQuantity(1)
  }, [product])

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

  // Уровни скидок для этого товара (по умолчанию: 10, 50, 100 шт -> 10%, 20%, 30%)
  const tiers = useMemo(() => getProductDiscounts(product), [product])

  // Текущий расчёт цены, скидки и выгоды
  const calc = calculateDiscountPrice(price, quantity, tiers)

  function handleAddToCart() {
    if (!inStock) return
    addToCart(product, calc.qty)
    onClose()
  }

  function handleQuantityChange(val) {
    const parsed = parseInt(val, 10)
    if (isNaN(parsed) || parsed < 1) {
      setQuantity(1)
    } else {
      setQuantity(parsed)
    }
  }

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
        className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-6 pointer-events-none"
      >
        <div
          className="relative bg-white w-full max-w-6xl h-[calc(100vh-32px)] md:h-[calc(100vh-48px)] overflow-y-auto
                     pointer-events-auto shadow-2xl rounded-sm
                     animate-[slideUp_0.25s_ease]"
          onClick={e => e.stopPropagation()}
        >
          {/* Кнопка закрытия окна предпросмотра */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center
                       text-stone-400 hover:text-stone-900 hover:bg-stone-100 rounded-full
                       transition-colors text-2xl leading-none"
            aria-label="Закрыть предпросмотр"
          >×</button>

          <div className="grid md:grid-cols-2 gap-0 min-h-full">

            {/* Левая колонка: Главное фото товара */}
            <div className="relative bg-stone-100 aspect-[4/3] md:aspect-auto md:h-full overflow-hidden min-h-[300px]">
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
                  'absolute top-4 left-4 text-white text-xs px-3 py-1.5 tracking-wide z-10 font-medium',
                  badge === 'Скидка' ? 'bg-red-500' : 'bg-primary-600',
                ].join(' ')}>
                  {badge}
                </span>
              )}
            </div>

            {/* Правая колонка: Инфо + Калькулятор */}
            <div className="flex flex-col p-6 md:p-8 gap-6 overflow-y-auto">

              {/* Название + категория */}
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">{category}</p>
                <h2 className="font-display text-2xl md:text-3xl text-stone-900 leading-snug">{name}</h2>
              </div>

              {/* Базовая цена */}
              <div className="flex items-baseline gap-3 pb-2 border-b border-stone-100">
                <span className="text-2xl text-primary-600 font-medium">{fmt(price)} ₽</span>
                <span className="text-xs text-stone-400">/ шт. (базовая)</span>
                {oldPrice && (
                  <span className="text-stone-400 line-through text-sm">{fmt(oldPrice)} ₽</span>
                )}
              </div>

              {/* Описание */}
              {description && (
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Описание</p>
                  <p className="text-sm text-stone-600 leading-relaxed">{description}</p>
                </div>
              )}

              {/* ── 🧮 КАЛЬКУЛЯТОР ЦЕНЫ И СКИДОК ── */}
              <div className="bg-stone-50 p-5 rounded-lg border border-stone-200/80 space-y-5">
                <div className="flex justify-between items-center">
                  <h3 className="font-display text-base text-stone-900 flex items-center gap-2">
                    <span>🧮 Калькулятор оптовой скидки</span>
                  </h3>
                  {calc.discountPercent > 0 && (
                    <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                      Скидка {calc.discountPercent}%
                    </span>
                  )}
                </div>

                {/* 3 Карточки уровней скидки */}
                <div className="grid grid-cols-3 gap-2">
                  {tiers.map((t, idx) => {
                    const isActive = calc.activeTier?.minQty === t.minQty
                    const isReached = quantity >= t.minQty

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setQuantity(t.minQty)}
                        className={[
                          'p-2.5 rounded-md text-center transition-all duration-200 border cursor-pointer flex flex-col items-center justify-center',
                          isActive
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-[1.02]'
                            : isReached
                            ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                            : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400',
                        ].join(' ')}
                      >
                        <span className="text-xs font-medium">{t.label}</span>
                        <span className={['text-sm font-bold mt-0.5', isActive ? 'text-white' : 'text-emerald-600'].join(' ')}>
                          -{t.discountPercent}%
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Управление количеством */}
                <div>
                  <label className="block text-xs text-stone-500 uppercase tracking-wider mb-2">
                    Укажите количество (шт.):
                  </label>
                  <div className="flex items-center gap-3">
                    {/* Селектор количество */}
                    <div className="flex items-center border border-stone-300 bg-white rounded overflow-hidden shadow-sm">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(quantity - 1)}
                        className="w-10 h-10 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-lg flex items-center justify-center transition-colors"
                      >−</button>
                      <input
                        type="number"
                        min="1"
                        max="9999"
                        value={quantity}
                        onChange={e => handleQuantityChange(e.target.value)}
                        className="w-20 h-10 text-center font-bold text-stone-900 text-base focus:outline-none bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(quantity + 1)}
                        className="w-10 h-10 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-lg flex items-center justify-center transition-colors"
                      >+</button>
                    </div>

                    {/* Быстрые пресеты */}
                    <div className="flex gap-1.5 flex-wrap">
                      {[1, 10, 50, 100].map(preset => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setQuantity(preset)}
                          className={[
                            'px-2.5 py-1.5 text-xs font-medium rounded transition-colors border',
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

                {/* Подсказка прогресса до следующей скидки */}
                {calc.nextTier ? (
                  <div className="text-xs bg-amber-50 border border-amber-200 text-amber-900 p-2.5 rounded flex items-center gap-2">
                    <span>💡</span>
                    <span>
                      Добавьте ещё <strong>{calc.itemsNeededForNextTier} шт.</strong>, чтобы получить скидку <strong>{calc.nextTier.discountPercent}%</strong>!
                    </span>
                  </div>
                ) : (
                  <div className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-900 p-2.5 rounded flex items-center gap-2">
                    <span>🎉</span>
                    <span>Применена максимальная скидка <strong>{calc.discountPercent}%</strong>!</span>
                  </div>
                )}

                {/* Итоговый подсчет */}
                <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-stone-500 block">Цена за 1 шт:</span>
                    <span className="text-base font-semibold text-stone-900">
                      {fmt(calc.unitPrice)} ₽
                      {calc.discountPercent > 0 && (
                        <span className="text-xs text-stone-400 line-through ml-2 font-normal">
                          {fmt(price)} ₽
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-stone-500 block">Итого со скидкой:</span>
                    {calc.totalSavings > 0 && (
                      <span className="text-xs text-emerald-600 font-semibold block">
                        Выгода: -{fmt(calc.totalSavings)} ₽
                      </span>
                    )}
                    <span className="text-2xl font-bold text-primary-600 font-display">
                      {fmt(calc.totalPrice)} ₽
                    </span>
                  </div>
                </div>
              </div>

              {/* Материалы */}
              {materials?.length > 0 && (
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">Материалы</p>
                  <div className="flex flex-wrap gap-2">
                    {materials.map(m => (
                      <span
                        key={m}
                        className="text-xs border border-stone-200 text-stone-600 px-3 py-1 rounded"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Кнопка добавления в корзину */}
              <div className="mt-auto pt-4 flex flex-col gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="w-full btn-primary justify-center py-3.5 text-base font-medium shadow-md disabled:opacity-50"
                >
                  {inStock
                    ? `Добавить в корзину (${calc.qty} шт.) — ${fmt(calc.totalPrice)} ₽`
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
