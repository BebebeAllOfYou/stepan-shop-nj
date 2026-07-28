/**
 * discountCalculator.js — калькулятор скидок от суммы заказа
 *
 * Скидка зависит от итоговой стоимости покупки (до скидки):
 *   — от 100 000 ₽ → 10%
 *   — от 200 000 ₽ → 20%
 *   — от 350 000 ₽ → 30%
 *
 * Гибкая настройка: каждый товар в products.json может иметь
 * своё поле "discounts" (тогда используются его пороги вместо глобальных):
 *   "discounts": [
 *     { "minAmount": 50000,  "discountPercent": 5  },
 *     { "minAmount": 150000, "discountPercent": 15 },
 *     { "minAmount": 300000, "discountPercent": 25 }
 *   ]
 */

const fmt = n => Number(n).toLocaleString('ru-RU')

// ── Глобальные пороги скидок (применяются ко всем товарам по умолчанию) ──────
export const DEFAULT_DISCOUNT_TIERS = [
  { minAmount: 100000, discountPercent: 10, label: `от ${fmt(100000)} ₽` },
  { minAmount: 200000, discountPercent: 20, label: `от ${fmt(200000)} ₽` },
  { minAmount: 350000, discountPercent: 30, label: `от ${fmt(350000)} ₽` },
]

/**
 * Возвращает актуальные уровни скидки для товара.
 * Если у товара в JSON есть поле discounts[] — использует их,
 * иначе — глобальные DEFAULT_DISCOUNT_TIERS.
 */
export function getProductDiscounts(product) {
  if (Array.isArray(product?.discounts) && product.discounts.length > 0) {
    return product.discounts
      .map(d => ({
        minAmount:       Number(d.minAmount ?? 0),
        discountPercent: Number(d.discountPercent ?? d.discount ?? 0),
        label:           d.label ?? `от ${fmt(d.minAmount ?? 0)} ₽`,
      }))
      .filter(d => d.minAmount > 0 && d.discountPercent > 0)
      .sort((a, b) => a.minAmount - b.minAmount)
      .slice(0, 3)
  }
  return DEFAULT_DISCOUNT_TIERS
}

/**
 * Расчёт цены с учётом суммовой скидки.
 *
 * Логика:
 *   1. Считаем полную стоимость: fullTotal = basePrice × qty
 *   2. Находим подходящий уровень скидки по fullTotal
 *   3. Применяем скидку к каждой единице и к итогу
 *
 * @param {number} basePrice  — цена за 1 шт. (без скидки)
 * @param {number} quantity   — количество штук
 * @param {Array}  tiers      — массив уровней скидки
 * @returns {object}
 */
export function calculateDiscountPrice(basePrice, quantity, tiers = DEFAULT_DISCOUNT_TIERS) {
  const base = Math.max(0, Number(basePrice) || 0)
  const qty  = Math.max(1, Math.floor(Number(quantity) || 1))

  // Полная стоимость ДО скидки
  const fullTotal = base * qty

  // Находим максимальный достигнутый уровень скидки
  const sortedDesc = [...tiers].sort((a, b) => b.minAmount - a.minAmount)
  const activeTier = sortedDesc.find(t => fullTotal >= t.minAmount) ?? null

  const discountPercent = activeTier?.discountPercent ?? 0
  const unitPrice       = Math.round(base * (1 - discountPercent / 100))
  const totalPrice      = unitPrice * qty
  const totalSavings    = fullTotal - totalPrice

  // Следующий недостигнутый уровень
  const sortedAsc = [...tiers].sort((a, b) => a.minAmount - b.minAmount)
  const nextTier  = sortedAsc.find(t => fullTotal < t.minAmount) ?? null
  const amountNeededForNextTier = nextTier ? nextTier.minAmount - fullTotal : 0

  // Минимальное количество для достижения каждого порога
  const qtyForTier = tier =>
    base > 0 ? Math.ceil(tier.minAmount / base) : 0

  return {
    qty,
    basePrice: base,
    fullTotal,
    unitPrice,
    discountPercent,
    activeTier,
    nextTier,
    amountNeededForNextTier,
    totalPrice,
    totalSavings,
    tiers: sortedAsc,
    qtyForTier,
  }
}

/**
 * Расчёт скидки для всей корзины (несколько товаров).
 * Скидка считается от суммарной базовой стоимости всех позиций.
 *
 * @param {Array}  items  — элементы корзины [{price, qty}, ...]
 * @param {Array}  tiers  — уровни скидки
 */
export function calculateCartDiscount(items, tiers = DEFAULT_DISCOUNT_TIERS) {
  const baseTotal = items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 0), 0)

  const sortedDesc = [...tiers].sort((a, b) => b.minAmount - a.minAmount)
  const activeTier = sortedDesc.find(t => baseTotal >= t.minAmount) ?? null

  const discountPercent = activeTier?.discountPercent ?? 0
  const totalPrice      = Math.round(baseTotal * (1 - discountPercent / 100))
  const totalSavings    = baseTotal - totalPrice

  const sortedAsc = [...tiers].sort((a, b) => a.minAmount - b.minAmount)
  const nextTier  = sortedAsc.find(t => baseTotal < t.minAmount) ?? null
  const amountNeededForNextTier = nextTier ? nextTier.minAmount - baseTotal : 0

  return {
    baseTotal,
    discountPercent,
    activeTier,
    nextTier,
    amountNeededForNextTier,
    totalPrice,
    totalSavings,
    tiers: sortedAsc,
  }
}
