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

const KNOWN_KEYS = [
  'Количество в упаковке (шт.)',
  'Количество в упаковке',
  'Вид рисунка',
  'Форма профиля',
  'Тип поверхности',
  'Фактура поверхности',
  'Фактура',
  'Покрытие',
  'Узор',
  'Цвет',
  'Артикул',
  'Бренд',
  'Страна производства',
  'Тип монтажа',
  'Способ монтажа панели',
  'Способ монтажа',
  'Площадь покрытия',
  'Вид стеновых панелей',
  'Назначение стеновой панели',
  'Назначение',
  'Влагостойкость',
  'Ударопрочность',
  'Длина упаковки',
  'Высота упаковки',
  'Ширина упаковки',
  'Высота предмета',
  'Ширина предмета',
  'Глубина предмета',
  'Вес с упаковкой (кг)',
  'Вес с упаковкой',
  'Вес упаковки',
]

const KEY_NORMALIZATION = {
  'количество в упаковке (шт.)': 'Количество в упаковке (шт.)',
  'количество в упаковке':        'Количество в упаковке (шт.)',
  'вид рисунка':                 'Вид рисунка',
  'форма профиля':               'Вид рисунка',
  'узор':                        'Вид рисунка',
  'фактура':                     'Вид рисунка',
  'тип поверхности':             'Тип поверхности',
  'покрытие':                    'Тип поверхности',
  'фактура поверхности':         'Тип поверхности',
  'цвет':                        'Цвет',
  'артикул':                     'Артикул',
  'бренд':                       'Бренд',
  'страна производства':         'Страна производства',
  'тип монтажа':                 'Тип монтажа',
  'способ монтажа':              'Тип монтажа',
  'способ монтажа панели':       'Тип монтажа',
}

function normalizeKeyName(key) {
  const clean = String(key).trim().toLowerCase()
  return KEY_NORMALIZATION[clean] || String(key).trim()
}

function parseObjOrJson(val) {
  if (!val) return null
  if (typeof val === 'object') {
    const normalized = {}
    for (const [k, v] of Object.entries(val)) {
      if (v !== null && v !== undefined && v !== '') {
        normalized[normalizeKeyName(k)] = typeof v === 'string' ? v.trim() : v
      }
    }
    return Object.keys(normalized).length > 0 ? normalized : null
  }

  const str = String(val).trim()
  if (!str) return null

  try {
    const parsed = JSON.parse(str)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parseObjOrJson(parsed)
    }
  } catch {}

  const result = {}
  const lines = str.split(/\r?\n|;/).map(l => l.trim()).filter(Boolean)

  for (const line of lines) {
    const parts = line.split(/[:=\-—]/)
    if (parts.length >= 2) {
      const rawK = parts[0].trim()
      const rawV = parts.slice(1).join(':').trim()
      if (rawK && rawV) {
        result[normalizeKeyName(rawK)] = rawV
        continue
      }
    }

    let matchedKey = null
    for (const keyCandidate of KNOWN_KEYS) {
      if (line.toLowerCase().startsWith(keyCandidate.toLowerCase())) {
        if (!matchedKey || keyCandidate.length > matchedKey.length) {
          matchedKey = keyCandidate
        }
      }
    }

    if (matchedKey) {
      const restVal = line.substring(matchedKey.length).replace(/^[:\s\-—]+/, '').trim()
      if (restVal) {
        result[normalizeKeyName(matchedKey)] = restVal
        continue
      }
    }
  }

  if (Object.keys(result).length > 0) {
    return result
  }

  return null
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
      additionalInfo:  parseObjOrJson(getVal(item, ['additionalInfo', 'additional_info', 'дополнительная информация', 'доп информация'])),
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
