/**
 * discountCalculator.js — утилита калькулятора скидок от объема
 *
 * Поддерживает 3 уровня скидки (по умолчанию: 10%, 20%, 30%).
 * Каждая позиция в products.json может содержать свой массив "discounts":
 *   "discounts": [
 *     { "minQty": 10,  "discountPercent": 10 },
 *     { "minQty": 50,  "discountPercent": 20 },
 *     { "minQty": 100, "discountPercent": 30 }
 *   ]
 */

export const DEFAULT_DISCOUNT_TIERS = [
  { minQty: 10,  discountPercent: 10, label: 'От 10 шт'  },
  { minQty: 50,  discountPercent: 20, label: 'От 50 шт'  },
  { minQty: 100, discountPercent: 30, label: 'От 100 шт' },
]

/**
 * Возвращает 3 уровня скидки для конкретного товара
 */
export function getProductDiscounts(product) {
  if (Array.isArray(product?.discounts) && product.discounts.length > 0) {
    return product.discounts
      .map(d => ({
        minQty: Number(d.minQty || 0),
        discountPercent: Number(d.discountPercent ?? d.discount ?? 0),
        label: d.label || `От ${d.minQty} шт`,
      }))
      .filter(d => d.minQty > 0 && d.discountPercent > 0)
      .sort((a, b) => a.minQty - b.minQty)
      .slice(0, 3)
  }
  return DEFAULT_DISCOUNT_TIERS
}

/**
 * Расчёт стоимости с учётом объёма
 */
export function calculateDiscountPrice(basePrice, quantityInput, tiers = DEFAULT_DISCOUNT_TIERS) {
  const base = Math.max(0, Number(basePrice) || 0)
  const qty  = Math.max(1, Math.floor(Number(quantityInput) || 1))

  // Сортируем уровни по убыванию количества (чтобы найти максимальную применимую скидку)
  const sortedDesc = [...tiers].sort((a, b) => b.minQty - a.minQty)
  const activeTier = sortedDesc.find(t => qty >= t.minQty) || null

  const discountPercent = activeTier ? activeTier.discountPercent : 0
  const unitPrice       = Math.round(base * (1 - discountPercent / 100))
  const totalPrice      = unitPrice * qty
  const fullPrice       = base * qty
  const totalSavings    = fullPrice - totalPrice

  // Следующий нестигнутый уровень скидки
  const sortedAsc = [...tiers].sort((a, b) => a.minQty - b.minQty)
  const nextTier  = sortedAsc.find(t => qty < t.minQty) || null
  const itemsNeededForNextTier = nextTier ? nextTier.minQty - qty : 0

  return {
    qty,
    basePrice: base,
    unitPrice,
    discountPercent,
    activeTier,
    nextTier,
    itemsNeededForNextTier,
    totalPrice,
    fullPrice,
    totalSavings,
    tiers: sortedAsc,
  }
}
