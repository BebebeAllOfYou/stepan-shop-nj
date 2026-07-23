/**
 * CartPanel — выдвижная панель корзины с формой заказа
 *
 * Открывается справа поверх контента при добавлении товара
 * или нажатии на кнопку корзины в шапке.
 */

'use client'

import { useState } from 'react'
import Link         from 'next/link'
import { useCartContext } from '../context/CartContext'
import { useTelegram }    from '../hooks/useTelegram'
import { formatPhone, isPhoneComplete, PHONE_MAX_LENGTH } from '../utils/phoneMask'

const fmt = n => Number(n).toLocaleString('ru-RU')

/** Одна строка товара в корзине */
function CartItem({ item }) {
  const { removeFromCart, updateQty } = useCartContext()

  return (
    <div className="flex gap-3 py-4 border-b border-stone-100 last:border-0">
      {/* Фото или заглушка */}
      <div className="w-16 h-20 bg-stone-100 flex-shrink-0 overflow-hidden">
        {item.image
          ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">фото</div>
        }
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-stone-400 uppercase tracking-wide">{item.category}</p>
        <p className="text-sm text-stone-900 font-medium leading-snug mt-0.5 truncate">{item.name}</p>
        <p className="text-sm text-primary-600 font-medium mt-1">{fmt(item.price)} ₽</p>

        {/* Количество */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => updateQty(item.id, item.qty - 1)}
            className="w-7 h-7 border border-stone-200 text-stone-600
                       hover:border-stone-800 hover:text-stone-900
                       flex items-center justify-center text-lg leading-none transition-colors"
          >−</button>
          <span className="w-8 text-center text-sm tabular-nums">{item.qty}</span>
          <button
            onClick={() => updateQty(item.id, item.qty + 1)}
            className="w-7 h-7 border border-stone-200 text-stone-600
                       hover:border-stone-800 hover:text-stone-900
                       flex items-center justify-center text-lg leading-none transition-colors"
          >+</button>
        </div>
      </div>

      {/* Сумма + удалить */}
      <div className="flex flex-col items-end justify-between flex-shrink-0">
        <button
          onClick={() => removeFromCart(item.id)}
          className="text-stone-300 hover:text-red-400 transition-colors text-lg leading-none"
          aria-label="Удалить"
        >×</button>
        <p className="text-sm font-medium text-stone-900">{fmt(item.price * item.qty)} ₽</p>
      </div>
    </div>
  )
}

/** Форма контактных данных + кнопка отправки */
function OrderForm({ onSuccess }) {
  const { items, totalPrice, clearCart } = useCartContext()
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
    const ok = await sendOrder(items, { name, phone, comment })
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
        {sending ? 'Отправляем...' : 'Отправить заявку'}
      </button>

      <p className="text-xs text-stone-400 text-center">
        Менеджер перезвонит и уточнит детали заказа
      </p>
    </form>
  )
}

/** Основной компонент — выдвижная панель */
export default function CartPanel() {
  const { items, totalPrice, totalItems, isOpen, setIsOpen } = useCartContext()
  const [step, setStep] = useState('cart') // 'cart' | 'form'

  function handleClose() {
    setIsOpen(false)
    setTimeout(() => setStep('cart'), 300) // сброс шага после закрытия
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
                {items.map(item => <CartItem key={item.id} item={item} />)}
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
          <div className="border-t border-stone-100 px-6 py-5 space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-stone-500 text-sm">Итого</span>
              <span className="font-display text-2xl text-stone-900">
                {totalPrice.toLocaleString('ru-RU')} ₽
              </span>
            </div>
            <button
              onClick={() => setStep('form')}
              className="w-full btn-primary justify-center"
            >
              Оформить заявку
            </button>
            <p className="text-xs text-stone-400 text-center">
              Без предоплаты — менеджер уточнит все детали
            </p>
          </div>
        )}
      </aside>
    </>
  )
}
