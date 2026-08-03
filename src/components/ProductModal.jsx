/**
 * ProductModal — предпросмотр товара в оптовом минималистичном стиле
 *
 * Порядок блоков:
 *   1. Габариты (Габариты упаковки и Габариты предмета)
 *   2. Основная информация
 *   3. Общие характеристики
 *   4. Материалы
 *   5. Дополнительная информация (включая «Площадь покрытия»)
 *   6. Описание (последнее)
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useCartContext } from '../context/CartContext'

const fmt  = n => Number(n).toLocaleString('ru-RU')
const fmtR = n => `${fmt(Math.round(n))} ₽`

/** Одна строка характеристики с пунктирной линией */
function SpecRow({ label, value }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex items-baseline gap-1 py-1.5 border-b border-stone-100 last:border-0">
      <span className="text-stone-500 text-sm shrink-0 leading-tight">{label}</span>
      <span className="flex-1 border-b border-dotted border-stone-300 mb-0.5 mx-1" />
      <span className="text-stone-900 text-sm text-right leading-tight">{String(value)}</span>
    </div>
  )
}

/** Секция с заголовком и строками */
function Section({ title, children }) {
  const hasContent = Array.isArray(children)
    ? children.some(Boolean)
    : Boolean(children)
  if (!hasContent) return null
  return (
    <div className="pt-4">
      <h3 className="text-sm font-semibold text-stone-900 mb-2">{title}</h3>
      <div>{children}</div>
    </div>
  )
}

export default function ProductModal({ product, onClose }) {
  const { addToCart } = useCartContext()

  const [quantity, setQuantity] = useState(1)

  useEffect(() => { setQuantity(1) }, [product])

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
    name           = 'Товар',
    category       = '',
    price          = 0,
    oldPrice       = null,
    image          = null,
    badge          = null,
    description    = '',
    mainInfo       = null,
    generalSpecs   = null,
    complectation  = null,
    materials      = [],
    additionalInfo = null,
    dimensions     = null,
    inStock        = true,
  } = product

  const itemTotal = price * quantity

  function handleQuantityChange(val) {
    const parsed = parseInt(val, 10)
    setQuantity(isNaN(parsed) || parsed < 1 ? 1 : parsed)
  }

  // Строки габаритов из объекта dimensions
  const dimensionRows = (() => {
    if (!dimensions) return []
    if (typeof dimensions === 'string') return [{ label: 'Размеры', value: dimensions }]

    const labelMap = {
      packageLength: 'Длина упаковки',
      packageHeight: 'Высота упаковки',
      packageWidth:  'Ширина упаковки',
      itemHeight:    'Высота предмета',
      itemWidth:     'Ширина предмета',
      itemDepth:     'Глубина предмета',
      width:         'Ширина предмета',
      height:        'Высота предмета',
      depth:         'Глубина предмета',
      weight:        'Вес упаковки',
    }

    return Object.entries(dimensions)
      .map(([k, v]) => ({
        label: labelMap[k] || k,
        value: v ? `${v}${typeof v === 'number' ? ' см' : ''}` : null,
      }))
      .filter(r => r.value)
  })()

  return (
    <>
      {/* Оверлей */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-[70] bg-stone-950/50 backdrop-blur-sm"
      />

      {/* Модальное окно */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={name}
        className="fixed inset-0 z-[70] flex items-center justify-center p-3 md:p-6 pointer-events-none"
      >
        <div
          className="relative bg-white w-full max-w-5xl h-[calc(100vh-24px)] md:h-[calc(100vh-48px)]
                     overflow-hidden pointer-events-auto shadow-2xl
                     animate-[slideUp_0.2s_ease]"
          onClick={e => e.stopPropagation()}
        >
          {/* Кнопка закрытия */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center
                       text-stone-400 hover:text-stone-800 transition-colors text-2xl leading-none"
            aria-label="Закрыть"
          >×</button>

          <div className="grid md:grid-cols-2 h-full">

            {/* ── Левая колонка: Фото ── */}
            <div className="relative bg-stone-100 aspect-[4/3] md:aspect-auto overflow-hidden">
              {image ? (
                <Image
                  src={image} alt={name} fill priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-stone-300 text-sm">
                  Фото отсутствует
                </div>
              )}
              {badge && (
                <span className={[
                  'absolute top-3 left-3 text-white text-xs px-2.5 py-1 font-medium',
                  badge === 'Скидка' ? 'bg-red-500' : 'bg-stone-800',
                ].join(' ')}>
                  {badge}
                </span>
              )}
            </div>

            {/* ── Правая колонка: Информация ── */}
            <div className="flex flex-col h-full overflow-hidden">

              {/* Заголовок */}
              <div className="px-6 pt-6 pb-4 border-b border-stone-100">
                <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">{category}</p>
                <h2 className="font-display text-xl md:text-2xl text-stone-900 leading-snug pr-8">{name}</h2>
              </div>

              {/* Прокручиваемый блок характеристик */}
              <div className="flex-1 overflow-y-auto px-6 divide-y divide-stone-100">

                {/* ── 1. ГАБАРИТЫ ── */}
                {dimensionRows.length > 0 && (
                  <Section title="Габариты">
                    {dimensionRows.map(r => <SpecRow key={r.label} label={r.label} value={r.value} />)}
                  </Section>
                )}

                {/* ── 2. ОСНОВНАЯ ИНФОРМАЦИЯ ── */}
                {mainInfo && (
                  <Section title="Основная информация">
                    {Object.entries(mainInfo).map(([k, v]) => <SpecRow key={k} label={k} value={v} />)}
                  </Section>
                )}

                {/* ── 3. ОБЩИЕ ХАРАКТЕРИСТИКИ ── */}
                {generalSpecs && (
                  <Section title="Общие характеристики">
                    {Object.entries(generalSpecs).map(([k, v]) => <SpecRow key={k} label={k} value={v} />)}
                  </Section>
                )}

                {/* ── 4. КОМПЛЕКТАЦИЯ ── */}
                {complectation && (
                  <Section title="Комплектация">
                    {typeof complectation === 'object' ? (
                      Object.entries(complectation).map(([k, v]) => <SpecRow key={k} label={k} value={v} />)
                    ) : (
                      <SpecRow label="Состав комплекта" value={String(complectation)} />
                    )}
                  </Section>
                )}

                {/* ── 4. МАТЕРИАЛЫ ── */}
                {materials?.length > 0 && (
                  <Section title="Материалы">
                    <SpecRow label="Материал изделия" value={materials.join(', ')} />
                  </Section>
                )}

                {/* ── 5. ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ ── */}
                {additionalInfo && (
                  <Section title="Дополнительная информация">
                    {typeof additionalInfo === 'object' ? (
                      Object.entries(additionalInfo).map(([k, v]) => <SpecRow key={k} label={k} value={v} />)
                    ) : (
                      <p className="text-sm text-stone-600 leading-relaxed">{String(additionalInfo)}</p>
                    )}
                  </Section>
                )}

                {/* ── 6. ОПИСАНИЕ (последнее) ── */}
                {description && (
                  <Section title="Описание">
                    <p className="text-sm text-stone-500 leading-relaxed">{description}</p>
                  </Section>
                )}

                {/* Нижний отступ */}
                <div className="h-4" />
              </div>

              {/* ── Нижняя панель: Цена + Количество + Корзина ── */}
              <div className="border-t border-stone-100 px-6 py-4 bg-white">
                {/* Цена */}
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-bold text-stone-900">{fmtR(price * quantity)}</span>
                  {quantity > 1 && (
                    <span className="text-xs text-stone-400">{fmtR(price)} / шт.</span>
                  )}
                  {oldPrice && (
                    <span className="text-sm text-stone-400 line-through">{fmtR(oldPrice * quantity)}</span>
                  )}
                </div>

                {/* Количество + Кнопка */}
                <div className="flex items-center gap-3">
                  {/* Счётчик */}
                  <div className="flex items-center border border-stone-200 bg-stone-50">
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className="w-9 h-10 flex items-center justify-center text-stone-600
                                 hover:bg-stone-100 transition-colors text-lg font-medium"
                    >−</button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={e => handleQuantityChange(e.target.value)}
                      className="w-14 h-10 text-center text-sm font-semibold text-stone-900
                                 focus:outline-none bg-transparent tabular-nums"
                    />
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="w-9 h-10 flex items-center justify-center text-stone-600
                                 hover:bg-stone-100 transition-colors text-lg font-medium"
                    >+</button>
                  </div>

                  {/* Быстрые пресеты */}
                  <div className="flex gap-1">
                    {[1, 4, 10, 20, 50].map(p => (
                      <button
                        key={p}
                        onClick={() => setQuantity(p)}
                        className={[
                          'px-2.5 py-1.5 text-xs border transition-colors',
                          quantity === p
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'text-stone-500 border-stone-200 hover:border-stone-400',
                        ].join(' ')}
                      >{p}</button>
                    ))}
                  </div>

                  {/* Кнопка корзины */}
                  <button
                    onClick={() => { addToCart(product, quantity); onClose() }}
                    disabled={!inStock}
                    className="ml-auto btn-primary py-2.5 px-5 text-sm font-medium disabled:opacity-40"
                  >
                    {inStock ? 'В корзину' : 'Нет в наличии'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  )
}
