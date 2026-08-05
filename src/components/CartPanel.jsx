/**
 * CartPanel — выдвижная панель корзины с калькулятором скидок от суммы заказа
 *
 * Минималистичный оптовый стиль: монохромная цветовая схема, без иконок,
 * чёткая типографика. Весь функционал сохранён.
 */

'use client'

import Link             from 'next/link'
import Image            from 'next/image'
import { useCartContext } from '../context/CartContext'
import { useCompany }     from '../hooks/useCompany'

const fmt = n => Number(n).toLocaleString('ru-RU')

/** Одна строка товара в корзине */
function CartItem({ item, discountPercent }) {
  const { removeFromCart, updateQty } = useCartContext()

  const unitPrice     = discountPercent > 0 ? Math.round(item.price * (1 - discountPercent / 100)) : item.price
  const itemTotal     = unitPrice * item.qty
  const itemBaseTotal = item.price * item.qty

  return (
    <div className="flex gap-3 py-3 border-b border-stone-100 last:border-0">
      {/* Фото */}
      <div className="w-12 h-14 bg-stone-100 flex-shrink-0 overflow-hidden relative">
        {item.image
          ? <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-stone-300 text-[10px]">фото</div>
        }
      </div>

      {/* Инфо */}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-stone-400 uppercase tracking-wide truncate">{item.category}</p>
        <p className="text-xs text-stone-900 font-medium leading-snug truncate mt-0.5">{item.name}</p>

        {/* Счётчик количества */}
        <div className="flex items-center gap-2 mt-1.5">
          <button
            onClick={() => updateQty(item.id, item.qty - 1)}
            className="w-6 h-6 border border-stone-200 text-stone-500 flex items-center justify-center text-sm hover:border-stone-500 hover:text-stone-900 transition-colors"
          >−</button>
          <span className="w-6 text-center text-xs tabular-nums font-semibold text-stone-900">{item.qty}</span>
          <button
            onClick={() => updateQty(item.id, item.qty + 1)}
            className="w-6 h-6 border border-stone-200 text-stone-500 flex items-center justify-center text-sm hover:border-stone-500 hover:text-stone-900 transition-colors"
          >+</button>
          <span className="text-[10px] text-stone-400 ml-1">{fmt(unitPrice)} ₽/шт.</span>
        </div>
      </div>

      {/* Сумма + удалить */}
      <div className="flex flex-col items-end justify-between flex-shrink-0">
        <button
          onClick={() => removeFromCart(item.id)}
          className="text-stone-300 hover:text-stone-600 transition-colors text-lg leading-none"
          aria-label="Удалить"
        >×</button>
        <div className="text-right">
          {discountPercent > 0 && (
            <p className="text-[10px] text-stone-400 line-through">{fmt(itemBaseTotal)} ₽</p>
          )}
          <p className="text-sm font-bold text-stone-900">{fmt(itemTotal)} ₽</p>
        </div>
      </div>
    </div>
  )
}

/** Калькулятор скидки от суммы — минималистичный */
function DiscountWidget({ cartDiscount }) {
  const { baseTotal, discountPercent, activeTier, nextTier, amountNeededForNextTier, tiers } = cartDiscount

  const progressPercent = (() => {
    if (!nextTier) return 100
    const prevMin  = activeTier?.minAmount ?? 0
    const nextMin  = nextTier.minAmount
    const progress = ((baseTotal - prevMin) / (nextMin - prevMin)) * 100
    return Math.min(Math.max(progress, 0), 100)
  })()

  return (
    <div className="border border-stone-200 my-3">
      {/* Заголовок */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-100 bg-stone-50">
        <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
          Скидка от суммы заказа
        </span>
        {discountPercent > 0 ? (
          <span className="text-xs font-bold text-stone-900 border border-stone-900 px-2 py-0.5">
            −{discountPercent}%
          </span>
        ) : (
          <span className="text-xs text-stone-400">не применена</span>
        )}
      </div>

      {/* Три уровня скидок */}
      <div className="grid grid-cols-3 divide-x divide-stone-200">
        {tiers.map((t, idx) => {
          const isActive  = activeTier?.minAmount === t.minAmount
          const isReached = baseTotal >= t.minAmount
          return (
            <div
              key={idx}
              className={[
                'text-center py-3 px-2 transition-colors',
                isActive
                  ? 'bg-stone-900 text-white'
                  : isReached
                  ? 'bg-stone-100 text-stone-700'
                  : 'bg-white text-stone-400',
              ].join(' ')}
            >
              <div className="text-[10px] leading-tight">{t.label}</div>
              <div className={['text-sm font-bold mt-0.5', isActive ? 'text-white' : 'text-stone-900'].join(' ')}>
                −{t.discountPercent}%
              </div>
            </div>
          )
        })}
      </div>

      {/* Прогресс */}
      <div className="px-4 py-3 border-t border-stone-100">
        {nextTier ? (
          <div className="space-y-2">
            <div className="h-1 bg-stone-100 overflow-hidden">
              <div
                className="h-full bg-stone-900 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-500">
              До скидки{' '}
              <span className="font-semibold text-stone-900">
                {nextTier.discountPercent}%
              </span>{' '}
              не хватает{' '}
              <span className="font-semibold text-stone-900">
                {fmt(amountNeededForNextTier)} ₽
              </span>
            </p>
          </div>
        ) : (
          <p className="text-[11px] text-stone-900 font-semibold">
            Применена максимальная скидка 30%
          </p>
        )}
      </div>
    </div>
  )
}

/** Блок контакта с менеджером */
function ManagerContact() {
  const { company } = useCompany()
  const phone      = company?.contacts?.phone ?? '+7 (999) 123-45-67'
  const cleanPhone = phone.replace(/[^\d+]/g, '')
  const workHours  = company?.contacts?.workHours?.phone ?? 'пн–вс 9:00–21:00'

  return (
    <div className="border border-stone-200 p-4 space-y-3">
      <p className="text-xs text-stone-500 leading-relaxed text-center">
        Для оформления заказа обратитесь к нашему менеджеру
      </p>
      <a
        href={`tel:${cleanPhone}`}
        className="flex items-center justify-center w-full py-3 border border-stone-900
                   bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold
                   tracking-wide transition-colors"
      >
        {phone}
      </a>
      <p className="text-[11px] text-stone-400 text-center">
        Приём звонков: {workHours}
      </p>
    </div>
  )
}

/** Основной компонент */
export default function CartPanel() {
  const { items, totalPrice, totalItems, cartDiscount, isOpen, setIsOpen } = useCartContext()

  return (
    <>
      {/* Оверлей */}
      <div
        onClick={() => setIsOpen(false)}
        className={[
          'fixed inset-0 z-40 bg-stone-950/30 transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* Панель */}
      <aside
        className={[
          'fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl',
          'flex flex-col transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        {/* Шапка */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div>
            <h2 className="text-base font-semibold text-stone-900">
              Корзина заказа
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">{totalItems} поз.</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-stone-400 hover:text-stone-900 transition-colors text-2xl leading-none"
            aria-label="Закрыть корзину"
          >×</button>
        </div>

        {/* Тело */}
        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-2 py-20">
              <p className="text-stone-400 text-sm">Корзина пуста</p>
              <p className="text-stone-300 text-xs">Добавьте товары из каталога</p>
              <Link
                href="/catalog"
                onClick={() => setIsOpen(false)}
                className="btn-outline text-xs mt-3"
              >
                Перейти в каталог
              </Link>
            </div>
          ) : (
            <div className="py-2">
              {/* Калькулятор скидки */}
              <DiscountWidget cartDiscount={cartDiscount} />

              {/* Список товаров */}
              {items.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  discountPercent={cartDiscount.discountPercent}
                />
              ))}
            </div>
          )}
        </div>

        {/* Итого + контакт менеджера */}
        {items.length > 0 && (
          <div className="border-t border-stone-100 px-6 py-4 space-y-4">
            {/* Строки сумм */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-stone-500">
                <span>Сумма без скидки</span>
                <span>{fmt(cartDiscount.baseTotal)} ₽</span>
              </div>
              {cartDiscount.discountPercent > 0 && (
                <div className="flex justify-between text-xs text-stone-500">
                  <span>Скидка {cartDiscount.discountPercent}%</span>
                  <span>−{fmt(cartDiscount.totalSavings)} ₽</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-2 border-t border-stone-100">
                <span className="text-sm font-semibold text-stone-900">Итого</span>
                <span className="text-xl font-bold text-stone-900">{fmt(totalPrice)} ₽</span>
              </div>
            </div>

            {/* Контакт */}
            <ManagerContact />
          </div>
        )}
      </aside>
    </>
  )
}
