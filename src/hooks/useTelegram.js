/**
 * useTelegram — хук для отправки заявок через серверный роут /api/order
 *
 * Токен бота хранится только на сервере (см. src/app/api/order/route.js).
 *
 * Поддерживает два типа заявок:
 *   sendOrder(items, customer)      — заказ из корзины
 *   sendPartnership(formData)       — заявка на партнёрство
 */

import { useState, useCallback } from 'react'

async function postOrder(payload) {
  let res
  try {
    res = await fetch('/api/order/', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })
  } catch {
    throw new Error('Нет соединения с сервером. Проверьте интернет.')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `HTTP ${res.status}`)
  }
}

export function useTelegram() {
  const [sending, setSending] = useState(false)
  const [error,   setError]   = useState(null)

  const sendOrder = useCallback(async (items, customer) => {
    setSending(true)
    setError(null)
    try {
      await postOrder({ type: 'order', items, customer })
      return true
    } catch (e) {
      setError(e.message)
      return false
    } finally {
      setSending(false)
    }
  }, [])

  const sendPartnership = useCallback(async (data) => {
    setSending(true)
    setError(null)
    try {
      await postOrder({ type: 'partnership', data })
      return true
    } catch (e) {
      setError(e.message)
      return false
    } finally {
      setSending(false)
    }
  }, [])

  return { sendOrder, sendPartnership, sending, error }
}
