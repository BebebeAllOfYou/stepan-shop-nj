/**
 * useSheetsPrices — универсальный и гибкий парсер данных из Google Таблицы.
 *
 * Автоматически распознаёт колонки независимо от регистра и языка:
 *   - id / #id / Идентификатор
 *   - name / Name / Название / Наименование
 *   - price / Price / Цена / Стоимость
 *   - oldPrice / старая_цена / Старая цена
 *   - description / Описание
 *   - badge / Бейдж / Метка
 *   - category / Категория / Раздел
 *   - image / Фото / Изображение
 *   - inStock / В наличии / Наличие
 *   - featured / На главной
 *   - wildberriesLink / wildberries / Ссылка WB
 *   - mainInfo / Основная информация
 *   - generalSpecs / Общие характеристики
 *   - materials / Материалы
 *   - additionalInfo / Дополнительная информация
 *   - dimensions / Габариты / Размеры
 */

import { useState, useEffect } from 'react'
import { SHEETS_PRICES_URL, PRICES_CACHE_TTL } from '../config/catalog'

const CACHE_KEY = 'furniture_sheets_v5'

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, timestamp } = JSON.parse(raw)
    if (Date.now() - timestamp < PRICES_CACHE_TTL) return data
  } catch {}
  return null
}

function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
  } catch {}
}

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
  // Заменяем запятую на точку в десятичных числах (например "1855,2" -> 1855.2)
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
  const [loading,     setLoading]     = useState(!!SHEETS_PRICES_URL)

  useEffect(() => {
    if (!SHEETS_PRICES_URL) {
      setLoading(false)
      return
    }

    const cached = readCache()
    if (cached) {
      setProductsMap(cached)
      setLoading(false)
      return
    }

    let cancelled = false

    fetch(SHEETS_PRICES_URL)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(json => {
        if (cancelled) return
        const map = buildProductsMap(json.products ?? json.data ?? json.items ?? [])
        writeCache(map)
        setProductsMap(map)
        setLoading(false)
      })
      .catch(err => {
        if (cancelled) return
        console.warn('[useSheetsPrices] Не удалось загрузить данные из Google Таблицы:', err.message)
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  return { productsMap, loading }
}
