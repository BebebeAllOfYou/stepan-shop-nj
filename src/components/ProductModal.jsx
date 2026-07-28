/**
 * ProductModal — модальный предпросмотр товара с калькулятором оптовых скидок
 *
 * Скидка считается от итоговой суммы заказа (basePrice × qty):
 *   — от 100 000 ₽ → 10%
 *   — от 200 000 ₽ → 20%
 *   — от 350 000 ₽ → 30%
 *
 * ВАЖНО: все хуки вызываются ДО условного return — правило React.
 */

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { useCartContext } from '../context/CartContext'
import { getProductDiscounts, calculateDiscountPrice } from '../utils/discountCalculator'

const fmt  = n  => Number(n).toLocaleString('ru-RU')
const fmtR = n  => `${fmt(Math.round(n))} ₽`

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

  // Уровни скидок для этого товара
  const tiers = useMemo(() => getProductDiscounts(product), [product])

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

  // Расчёт с учётом суммовой скидки
  const calc = calculateDiscountPrice(price, quantity, tiers)

  function handleQuantityChange(val) {
    const parsed = parseInt(val, 10)
    setQuantity(isNaN(parsed) || parsed < 1 ? 1 : parsed)
  }

  // Прогресс-бар до следующего порога скидки (в процентах)
  const progressPercent = (() => {
    if (!calc.nextTier) return 100
    const prevMin  = calc.activeTier?.minAmount ?? 0
    const nextMin  = calc.nextTier.minAmount
    const progress = ((calc.fullTotal - prevMin) / (nextMin - prevMin)) * 100
    return Math.min(Math.max(progress, 0), 100)
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
        className="fixed inset-0 z-[70] flex items-center justify-center p-4 md:p-6 pointer-events-none"
      >
        <div
          className="relative bg-white w-full max-w-6xl h-[calc(100vh-32px)] md:h-[calc(100vh-48px)]
                     overflow-y-auto pointer-events-auto shadow-2xl rounded-sm animate-[slideUp_0.25s_ease]"
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
            <div className="relative bg-stone-100 aspect-[4/3] md:aspect-auto md:h-full overflow-hidden min-h-[260px]">
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

            {/* ── Правая колонка: Инфо + Калькулятор ── */}
            <div className="flex flex-col p-6 md:p-8 gap-5 overflow-y-auto">

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

              {/* ──────────────── 🧮 КАЛЬКУЛЯТОР СКИДКИ ──────────────── */}
              <div className="bg-stone-50 rounded-xl border border-stone-200 overflow-hidden">

                {/* Шапка калькулятора */}
                <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between gap-3">
                  <h3 className="font-display text-base text-stone-900">Калькулятор скидки</h3>
                  {calc.discountPercent > 0 ? (
                    <span className="flex-shrink-0 text-xs font-bold bg-emerald-500 text-white
                                     px-3 py-1 rounded-full shadow-sm">
                      Скидка {calc.discountPercent}%
                    </span>
                  ) : (
                    <span className="flex-shrink-0 text-xs text-stone-400 border border-stone-200
                                     px-3 py-1 rounded-full">
                      Скидка не действует
                    </span>
                  )}
                </div>

                <div className="p-5 space-y-5">

                  {/* 3 Порога скидки */}
                  <div className="grid grid-cols-3 gap-2">
                    {tiers.map((t, idx) => {
                      const isActive  = calc.activeTier?.minAmount === t.minAmount
                      const isReached = calc.fullTotal >= t.minAmount
                      const minQtyForTier = price > 0 ? Math.ceil(t.minAmount / price) : 0

                      return (
                        <button
                          key={idx}
                          type="button"
                          title={`Нажмите, чтобы рассчитать от ${fmt(t.minAmount)} ₽`}
                          onClick={() => setQuantity(minQtyForTier)}
                          className={[
                            'relative p-3 rounded-lg text-center transition-all duration-200 border',
                            'flex flex-col items-center gap-0.5 cursor-pointer',
                            isActive
                              ? 'bg-emerald-500 text-white border-emerald-500 shadow-md scale-[1.03]'
                              : isReached
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-white text-stone-600 border-stone-200 hover:border-primary-400 hover:bg-stone-50',
                          ].join(' ')}
                        >
                          {isReached && !isActive && (
                            <span className="absolute top-1.5 right-1.5 text-emerald-500 text-[10px]">✓</span>
                          )}
                          <span className="text-[11px] font-medium leading-tight">{t.label}</span>
                          <span className={[
                            'text-lg font-bold leading-none',
                            isActive ? 'text-white' : 'text-emerald-600',
                          ].join(' ')}>
                            −{t.discountPercent}%
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Поле ввода количества */}
                  <div>
                    <p className="text-xs text-stone-500 uppercase tracking-wider mb-2">
                      Количество штук:
                    </p>
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Счётчик */}
                      <div className="flex items-center border border-stone-300 rounded-lg
                                      bg-white overflow-hidden shadow-sm">
                        <button type="button"
                          onClick={() => handleQuantityChange(quantity - 1)}
                          className="w-10 h-11 bg-stone-100 hover:bg-stone-200 text-stone-700
                                     font-bold text-xl flex items-center justify-center transition-colors">
                          −
                        </button>
                        <input
                          type="number"
                          min="1" max="99999"
                          value={quantity}
                          onChange={e => handleQuantityChange(e.target.value)}
                          className="w-24 h-11 text-center font-bold text-stone-900 text-base
                                     focus:outline-none bg-transparent tabular-nums"
                        />
                        <button type="button"
                          onClick={() => handleQuantityChange(quantity + 1)}
                          className="w-10 h-11 bg-stone-100 hover:bg-stone-200 text-stone-700
                                     font-bold text-xl flex items-center justify-center transition-colors">
                          +
                        </button>
                      </div>

                      {/* Быстрые пресеты */}
                      <div className="flex gap-1.5 flex-wrap">
                        {[1, ...tiers.map(t => price > 0 ? Math.ceil(t.minAmount / price) : 0)]
                          .filter((v, i, a) => v > 0 && a.indexOf(v) === i)
                          .map(preset => (
                            <button key={preset} type="button"
                              onClick={() => setQuantity(preset)}
                              className={[
                                'px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors border',
                                quantity === preset
                                  ? 'bg-stone-900 text-white border-stone-900'
                                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100',
                              ].join(' ')}>
                              {fmt(preset)} шт
                            </button>
                          ))
                        }
                      </div>
                    </div>
                  </div>

                  {/* Прогресс-бар и подсказка */}
                  {calc.nextTier ? (
                    <div className="space-y-2">
                      <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500
                                     rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <p className="text-xs text-stone-500 flex justify-between">
                        <span>
                          💡 До скидки <strong className="text-emerald-700">{calc.nextTier.discountPercent}%</strong>{' '}
                          не хватает <strong className="text-stone-800">{fmtR(calc.amountNeededForNextTier)}</strong>
                        </span>
                        <span className="text-stone-400">
                          {fmtR(calc.fullTotal)} / {fmtR(calc.nextTier.minAmount)}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 flex items-center gap-2">
                      <span className="text-lg">🎉</span>
                      <p className="text-sm text-emerald-800 font-medium">
                        Применена максимальная скидка <strong>{calc.discountPercent}%</strong>!
                      </p>
                    </div>
                  )}

                  {/* Итоговая таблица */}
                  <div className="bg-white rounded-lg border border-stone-200 divide-y divide-stone-100 text-sm">
                    <div className="flex justify-between items-center px-4 py-3">
                      <span className="text-stone-500">Количество</span>
                      <span className="font-medium text-stone-800">{fmt(calc.qty)} шт.</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3">
                      <span className="text-stone-500">Сумма без скидки</span>
                      <span className={calc.discountPercent > 0 ? 'text-stone-400 line-through' : 'font-medium text-stone-800'}>
                        {fmtR(calc.fullTotal)}
                      </span>
                    </div>
                    {calc.discountPercent > 0 && (
                      <div className="flex justify-between items-center px-4 py-3">
                        <span className="text-stone-500">Цена за 1 шт. со скидкой</span>
                        <span className="font-medium text-emerald-700">{fmtR(calc.unitPrice)}</span>
                      </div>
                    )}
                    {calc.totalSavings > 0 && (
                      <div className="flex justify-between items-center px-4 py-3 bg-emerald-50">
                        <span className="text-emerald-700 font-medium">Ваша выгода</span>
                        <span className="font-bold text-emerald-600">−{fmtR(calc.totalSavings)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center px-4 py-4 bg-stone-50">
                      <span className="font-semibold text-stone-900 text-base">Итого</span>
                      <span className="font-bold text-primary-600 text-xl font-display">
                        {fmtR(calc.totalPrice)}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
              {/* ──────────────── конец калькулятора ──────────────── */}

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
                    ? `Добавить в корзину (${quantity} шт.) — ${fmtR(calc.totalPrice)}`
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
