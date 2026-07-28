/**
 * CartContext — глобальное состояние корзины
 *
 * Оборачивает всё приложение. Даёт доступ к корзине через useCartContext().
 * Учитывает оптовые скидки от объема при подсчёте итоговой цены.
 * Данные сохраняются в localStorage и восстанавливаются при перезагрузке.
 */

'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { getProductDiscounts, calculateDiscountPrice } from '../utils/discountCalculator'

const CartContext = createContext(null)

const STORAGE_KEY = 'furniture_cart_v1'

function loadFromStorage() {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveToStorage(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {}
}

export function CartProvider({ children }) {
  const [items,  setItems]  = useState(loadFromStorage)
  const [isOpen, setIsOpen] = useState(false)

  // Сохраняем корзину в localStorage при каждом изменении
  useEffect(() => { saveToStorage(items) }, [items])

  const addToCart = useCallback((product, quantity = 1) => {
    const addQty = Math.max(1, Math.floor(Number(quantity) || 1))
    setItems(prev => {
      const exists = prev.find(i => i.id === product.id)
      if (exists) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + addQty } : i)
      }
      return [...prev, { ...product, qty: addQty }]
    })
    setIsOpen(true) // открываем панель при добавлении
  }, [])

  const removeFromCart = useCallback((id) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  const updateQty = useCallback((id, qty) => {
    if (qty < 1) return
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalItems = items.reduce((s, i) => s + i.qty, 0)

  // Итоговая сумма корзины с учётом скидок от количества
  const totalPrice = items.reduce((sum, item) => {
    const tiers = getProductDiscounts(item)
    const calc  = calculateDiscountPrice(item.price, item.qty, tiers)
    return sum + calc.totalPrice
  }, 0)

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQty, clearCart,
      totalItems, totalPrice,
      isOpen, setIsOpen,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCartContext() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCartContext должен использоваться внутри <CartProvider>')
  return ctx
}
