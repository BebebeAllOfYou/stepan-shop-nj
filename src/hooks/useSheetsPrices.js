/**
 * useSheetsPrices — загружает данные товаров из Google Таблицы через Apps Script.
 *
 * Поддерживает новые поля:
 *   - mainInfo (Основная информация)
 *   - generalSpecs (Общие характеристики)
 *   - materials (Материалы)
 *   - additionalInfo (Дополнительная информация)
 *   - dimensions (Габариты)
 *   - description (Описание)
 */

import { useState, useEffect } from 'react'
import { SHEETS_PRICES_URL, PRICES_CACHE_TTL } from '../config/catalog'

const CACHE_KEY = 'furniture_sheets_v4'

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
  } catch {}
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
  const n = Number(val)
  return isNaN(n) ? null : n
}

function parseObjOrJson(val) {
  if (!val) return null
  if (typeof val === 'object') return val
  try {
    return JSON.parse(val)
  } catch {
    // Если передана строка вида "Ключ:Значение\nКлюч2:Значение2"
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
    const id = Number(item.id)
    if (!id) continue
    map[id] = {
      name:             parseStr(item.name),
      price:            parseNum(item.price),
      oldPrice:         parseNum(item.oldPrice),
      description:      parseStr(item.description),
      badge:            parseStr(item.badge),
      category:         parseStr(item.category),
      image:            parseStr(item.image),
      inStock:          parseBool(item.inStock),
      featured:         parseBool(item.featured),
      wildberriesLink:  parseStr(item.wildberriesLink),
      mainInfo:         parseObjOrJson(item.mainInfo),
      generalSpecs:     parseObjOrJson(item.generalSpecs),
      materials:        parseArray(item.materials),
      additionalInfo:   parseStr(item.additionalInfo),
      dimensions:       parseObjOrJson(item.dimensions),
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
        const map = buildProductsMap(json.products ?? json.data ?? [])
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
