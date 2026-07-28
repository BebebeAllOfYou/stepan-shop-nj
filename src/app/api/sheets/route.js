/**
 * GET /api/sheets — серверный прокси для загрузки данных из Google Таблицы
 *
 * Преимущества серверного прокси:
 *   1. Обходит CORS-ограничения Google Apps Script 302 редиректов.
 *   2. Не блокируется браузерными расширениями (AdBlock и т.д.).
 *   3. Гарантирует актуальные свежие данные (revalidate = 0).
 */

import { NextResponse } from 'next/server'
import { SHEETS_PRICES_URL } from '../../../config/catalog'

export const revalidate = 0 // Отключаем любой кэш Next.js для этого API

export async function GET() {
  if (!SHEETS_PRICES_URL) {
    return NextResponse.json({ products: [] })
  }

  try {
    const freshUrl = `${SHEETS_PRICES_URL}${SHEETS_PRICES_URL.includes('?') ? '&' : '?'}_t=${Date.now()}`
    const res = await fetch(freshUrl, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Google API HTTP ${res.status}` }, { status: 502 })
    }

    const data = await res.json()
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    })
  } catch (err) {
    console.error('[API /api/sheets] Ошибка загрузки:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
