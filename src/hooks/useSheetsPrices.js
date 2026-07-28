/**
 * useSheetsPrices — загружает данные из сервера через /api/sheets
 *
 * Использует надежный серверный API-прокси для стопроцентной
 * подгрузки всех полей из Google Таблицы без ограничений CORS.
 */

import { useState, useEffect } from 'react'

/** Ищет значение по списку синонимов названий колонок (без учёта регистра и символов) */
function getVal(item, aliases) {
  if (!item || typeof item !== 'object') return undefined
  const itemKeys = Object.keys(item)
  for (const alias of aliases) {
    const cleanAlias = String(alias).toLowerCase().replace(/[^a-z0-9а-яё]/gi, '')
    const matchKey = itemKeys.find(k => String(k).toLowerCase().replace(/[^a-z0-9а-яё]/gi, '') === cleanAlias)
    if (matchKey !== undefined && item[matchKey] !== undefined && item[matchKey] !== null && item[matchKey] !== '') {
      return item[matchKey]
    }
  }
  return undefined
}

function parseBool(val) {
  if (val === '' || val === null || val === undefined) return null
  if (typeof val === 'boolean') return val
  const s = String(val).trim().toUpperCase()
  if (s === 'TRUE'  || s === '1' || s === 'ДА')  return true
  if (s === 'FALSE' || s === '0' || s === 'НЕТ') return false
  return null
}

function parseStr(val) {
  if (val === '' || val === null || val === undefined) return null
  return String(val).trim() || null
}

function parseNum(val) {
  if (val === '' || val === null || val === undefined) return null
  const cleaned = String(val).replace(',', '.').replace(/\s/g, '')
  const n = Number(cleaned)
  return isNaN(n) ? null : n
}

function parseObjOrJson(val) {
  if (!val) return null
  if (typeof val === 'object') return val
  try {
    return JSON.parse(val)
  } catch {
    const result = {}
    const lines = String(val).split('\n')
    for (const line of lines) {
      const parts = line.split(':')
      if (parts.length >= 2) {
        const k = parts[0].trim()
        const v = parts.slice(1).join(':').trim()
        if (k) result[k] = v
      }
    }
    return Object.keys(result).length > 0 ? result : null
  }
}

function parseArray(val) {
  if (!val) return null
  if (Array.isArray(val)) return val
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val)
      if (Array.isArray(parsed)) return parsed
    } catch {}
    return val.split(',').map(s => s.trim()).filter(Boolean)
  }
  return null
}

function buildProductsMap(sheetsArray) {
  const map = {}
  for (const item of sheetsArray) {
    const rawId = getVal(item, ['id', '#id', '# id', 'ID', 'идентификатор'])
    const id    = parseNum(rawId)
    if (!id) continue

    map[id] = {
      name:            parseStr(getVal(item, ['name', 'название', 'наименование', 'товар'])),
      price:           parseNum(getVal(item, ['price', 'цена', 'стоимость'])),
      oldPrice:        parseNum(getVal(item, ['oldPrice', 'old_price', 'старая цена', 'старая_цена'])),
      description:     parseStr(getVal(item, ['description', 'описание'])),
      badge:           parseStr(getVal(item, ['badge', 'бейдж', 'метка'])),
      category:        parseStr(getVal(item, ['category', 'категория', 'раздел'])),
      image:           parseStr(getVal(item, ['image', 'фото', 'картинка', 'изображение'])),
      inStock:         parseBool(getVal(item, ['inStock', 'in_stock', 'в наличии', 'наличие'])),
      featured:        parseBool(getVal(item, ['featured', 'на главной', 'рекомендуемый'])),
      wildberriesLink: parseStr(getVal(item, ['wildberriesLink', 'wildberries', 'wb', 'вайлдберриз'])),
      mainInfo:        parseObjOrJson(getVal(item, ['mainInfo', 'main_info', 'основная информация'])),
      generalSpecs:    parseObjOrJson(getVal(item, ['generalSpecs', 'general_specs', 'общие характеристики', 'характеристики'])),
      materials:       parseArray(getVal(item, ['materials', 'материалы', 'материал'])),
      additionalInfo:  parseStr(getVal(item, ['additionalInfo', 'additional_info', 'дополнительная информация', 'доп информация'])),
      dimensions:      parseObjOrJson(getVal(item, ['dimensions', 'габариты', 'размеры'])),
    }
  }
  return map
}

export function useSheetsPrices() {
  const [productsMap, setProductsMap] = useState({})
  const [loading,     setLoading]     = useState(true)

  useEffect(() => {
    let cancelled = false

    fetch('/api/sheets')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(json => {
        if (cancelled) return
        const map = buildProductsMap(json.products ?? json.data ?? json.items ?? [])
        setProductsMap(map)
        setLoading(false)
      })
      .catch(err => {
        if (cancelled) return
        console.warn('[useSheetsPrices] Ошибка:', err.message)
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  return { productsMap, loading }
}
