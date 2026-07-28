/**
 * CartPanel — выдвижная панель корзины с встроенным калькулятором скидки от суммы заказа
 *
 * Скидки по всей корзине:
 *   — от 100 000 ₽ → −10%
 *   — от 200 000 ₽ → −20%
 *   — от 350 000 ₽ → −30%
 */

'use client'

import { useState } from 'react'
import Link         from 'next/link'
import { useCartContext } from '../context/CartContext'
import { useTelegram }    from '../hooks/useTelegram'
import { formatPhone, isPhoneComplete, PHONE_MAX_LENGTH } from '../utils/phoneMask'

const fmt = n => Number(n).toLocaleString('ru-RU')

/** Одна строка товара в корзине */
function CartItem({ item, discountPercent }) {
  const { removeFromCart, updateQty } = useCartContext()

  const unitPrice       = discountPercent > 0 ? Math.round(item.price * (1 - discountPercent / 100)) : item.price
  const itemTotal       = unitPrice * item.qty
  const itemBaseTotal   = item.price * item.qty

  return (
    <div className="flex gap-3 py-3.5 border-b border-stone-100 last:border-0 items-center">
      {/* Фото или заглушка */}
      <div className="w-14 h-16 bg-stone-100 flex-shrink-0 overflow-hidden rounded relative">
        {item.image
          ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">фото</div>
        }
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-stone-400 uppercase tracking-wide truncate">{item.category}</p>
        <p className="text-sm text-stone-900 font-medium leading-snug truncate">{item.name}</p>

        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className="text-xs font-semibold text-stone-900">{fmt(unitPrice)} ₽</span>
          <span className="text-[11px] text-stone-400">/ шт.</span>
          {discountPercent > 0 && (
            <span className="text-[11px] text-stone-400 line-through">{fmt(item.price)} ₽</span>
          )}
        </div>

        {/* Счётчик количества */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <button
            onClick={() => updateQty(item.id, item.qty - 1)}
            className="w-6 h-6 border border-stone-200 text-stone-600 rounded
                       hover:border-stone-800 hover:text-stone-900
                       flex items-center justify-center text-sm transition-colors"
          >−</button>
          <span className="w-7 text-center text-xs tabular-nums font-semibold">{item.qty}</span>
          <button
            onClick={() => updateQty(item.id, item.qty + 1)}
            className="w-6 h-6 border border-stone-200 text-stone-600 rounded
                       hover:border-stone-800 hover:text-stone-900
                       flex items-center justify-center text-sm transition-colors"
          >+</button>
        </div>
      </div>

      {/* Стоимость товара + кнопка удаления */}
      <div className="flex flex-col items-end justify-between flex-shrink-0 h-full gap-2">
        <button
          onClick={() => removeFromCart(item.id)}
          className="text-stone-300 hover:text-red-500 transition-colors text-lg leading-none"
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

/** Виджет калькулятора скидки от суммы заказа */
function DiscountCalculatorWidget({ cartDiscount }) {
  const { baseTotal, discountPercent, activeTier, nextTier, amountNeededForNextTier, tiers } = cartDiscount

  const progressPercent = (() => {
    if (!nextTier) return 100
    const prevMin  = activeTier?.minAmount ?? 0
    const nextMin  = nextTier.minAmount
    const progress = ((baseTotal - prevMin) / (nextMin - prevMin)) * 100
    return Math.min(Math.max(progress, 0), 100)
  })()

  return (
    <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 my-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-stone-900 uppercase tracking-wider">
          🧮 Скидка от суммы заказа
        </span>
        {discountPercent > 0 ? (
          <span className="text-[11px] font-bold bg-emerald-500 text-white px-2.5 py-0.5 rounded-full">
            Ваша скидка −{discountPercent}%
          </span>
        ) : (
          <span className="text-[11px] text-stone-400 bg-white px-2 py-0.5 rounded border border-stone-200">
            Без скидки
          </span>
        )}
      </div>

      {/* 3 шкалы скидок */}
      <div className="grid grid-cols-3 gap-1.5">
        {tiers.map((t, idx) => {
          const isActive  = activeTier?.minAmount === t.minAmount
          const isReached = baseTotal >= t.minAmount

          return (
            <div
              key={idx}
              className={[
                'p-2 rounded-lg text-center border transition-all',
                isActive
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : isReached
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white text-stone-500 border-stone-200',
              ].join(' ')}
            >
              <div className="text-[10px] font-medium leading-tight">{t.label}</div>
              <div className={['text-xs font-bold mt-0.5', isActive ? 'text-white' : 'text-emerald-600'].join(' ')}>
                −{t.discountPercent}%
              </div>
            </div>
          )
        })}
      </div>

      {/* Прогресс-бар до следующей скидки */}
      {nextTier ? (
        <div className="space-y-1.5 pt-1">
          <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-stone-600">
            💡 До скидки <strong className="text-emerald-700">{nextTier.discountPercent}%</strong> не хватает{' '}
            <strong className="text-stone-900">{fmt(amountNeededForNextTier)} ₽</strong>
          </p>
        </div>
      ) : (
        <div className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 p-2 rounded border border-emerald-200 flex items-center gap-1.5">
          <span>🎉</span>
          <span>Применена максимальная скидка 30% ко всей сумме заказа!</span>
        </div>
      )}
    </div>
  )
}

/** Форма контактных данных + кнопка отправки */
function OrderForm({ onSuccess }) {
  const { items, totalPrice, cartDiscount, clearCart } = useCartContext()
  const { sendOrder, sending, error }    = useTelegram()

  const [name,    setName]    = useState('')
  const [phone,   setPhone]   = useState('')
  const [comment, setComment] = useState('')
  const [sent,    setSent]    = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!isPhoneComplete(phone)) {
      e.target.querySelector('input[type="tel"]')?.focus()
      return
    }
    const ok = await sendOrder(items, { name, phone, comment, cartDiscount })
    if (ok) {
      setSent(true)
      clearCart()
      setTimeout(onSuccess, 2000)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
        <span className="text-4xl">✅</span>
        <p className="font-display text-stone-900 text-lg">Заявка отправлена!</p>
        <p className="text-stone-500 text-sm">Менеджер свяжется с вами в ближайшее время.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs text-stone-500 uppercase tracking-wide mb-1.5">
          Ваше имя *
        </label>
        <input
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Иван Иванов"
          className="w-full border border-stone-200 bg-white px-3 py-2.5 text-sm
                     focus:outline-none focus:border-stone-800 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs text-stone-500 uppercase tracking-wide mb-1.5">
          Телефон *
        </label>
        <input
          required
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          maxLength={PHONE_MAX_LENGTH}
          value={phone}
          onChange={e => setPhone(formatPhone(e.target.value))}
          placeholder="+7 (___) ___-__-__"
          className="w-full border border-stone-200 bg-white px-3 py-2.5 text-sm
                     focus:outline-none focus:border-stone-800 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs text-stone-500 uppercase tracking-wide mb-1.5">
          Комментарий
        </label>
        <textarea
          rows={2}
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Пожелания по доставке, срокам..."
          className="w-full border border-stone-200 bg-white px-3 py-2.5 text-sm
                     focus:outline-none focus:border-stone-800 transition-colors resize-none"
        />
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2">
          Ошибка отправки: {error}
        </p>
      )}

      <button
        type="submit"
        disabled={sending || items.length === 0}
        className="w-full btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {sending ? 'Отправляем...' : `Отправить заявку (${fmt(totalPrice)} ₽)`}
      </button>

      <p className="text-xs text-stone-400 text-center">
        Менеджер перезвонит и уточнит детали заказа
      </p>
    </form>
  )
}

/** Основной компонент — выдвижная панель */
export default function CartPanel() {
  const { items, totalPrice, totalItems, cartDiscount, isOpen, setIsOpen } = useCartContext()
  const [step, setStep] = useState('cart') // 'cart' | 'form'

  function handleClose() {
    setIsOpen(false)
    setTimeout(() => setStep('cart'), 300)
  }

  return (
    <>
      {/* Оверлей */}
      <div
        onClick={handleClose}
        className={[
          'fixed inset-0 z-40 bg-stone-950/40 backdrop-blur-sm transition-opacity duration-300',
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
        {/* Шапка панели */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep('cart')}
              className={step === 'form' ? 'text-stone-400 hover:text-stone-900 transition-colors text-sm' : 'hidden'}
            >
              ← Корзина
            </button>
            <h2 className="font-display text-xl text-stone-900">
              {step === 'cart' ? `Корзина (${totalItems})` : 'Оформление'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-stone-400 hover:text-stone-900 transition-colors text-2xl leading-none"
            aria-label="Закрыть корзину"
          >×</button>
        </div>

        {/* Тело панели */}
        <div className="flex-1 overflow-y-auto px-6">
          {step === 'cart' ? (
            items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-20">
                <span className="text-5xl">🛒</span>
                <p className="text-stone-500">Корзина пуста</p>
                <p className="text-stone-400 text-sm">Добавьте товары из каталога</p>
                <Link href="/catalog" onClick={handleClose} className="btn-outline text-xs mt-2">
                  Перейти в каталог
                </Link>
              </div>
            ) : (
              <div className="py-2">
                {/* 🧮 Виджет калькулятора скидки от суммы заказа */}
                <DiscountCalculatorWidget cartDiscount={cartDiscount} />

                {/* Список товаров */}
                {items.map(item => (
                  <CartItem
                    key={item.id}
                    item={item}
                    discountPercent={cartDiscount.discountPercent}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="py-6">
              <OrderForm onSuccess={handleClose} />
            </div>
          )}
        </div>

        {/* Итог + кнопка */}
        {step === 'cart' && items.length > 0 && (
          <div className="border-t border-stone-100 px-6 py-4 space-y-3 bg-stone-50/50">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-stone-500">
                <span>Сумма заказа:</span>
                <span>{fmt(cartDiscount.baseTotal)} ₽</span>
              </div>
              {cartDiscount.discountPercent > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Скидка {cartDiscount.discountPercent}%:</span>
                  <span>−{fmt(cartDiscount.totalSavings)} ₽</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-2 border-t border-stone-200">
                <span className="text-stone-900 font-bold">Итого к оплате:</span>
                <span className="font-display text-2xl font-bold text-primary-600">
                  {fmt(totalPrice)} ₽
                </span>
              </div>
            </div>

            <button
              onClick={() => setStep('form')}
              className="w-full btn-primary justify-center py-3"
            >
              Оформить заявку
            </button>
            <p className="text-[11px] text-stone-400 text-center">
              Без предоплаты — менеджер уточнит все детали
            </p>
          </div>
        )}
      </aside>
    </>
  )
}
