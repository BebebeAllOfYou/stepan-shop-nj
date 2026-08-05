/**
 * GET /api/sheets — серверный прокси для загрузки данных из Google Таблицы
 *
 * Преимущества серверного прокси:
 *   1. Обходит CORS-ограничения Google Apps Script 302 редиректов.
 *   2. Не блокируется браузерными расширениями (AdBlock и т.д.)
 *   3. Кэш 5 минут: холодный старт Google Apps Script (10-20 с) затрагивает
 *      только первый запрос, все остальные — мгновенный ответ из кэша Next.js.
 */

import { NextResponse } from 'next/server'
import { SHEETS_PRICES_URL } from '../../../config/catalog'

// Кэшируем ответ на 5 минут (300 с).
// Изменения в таблице появятся у посетителей с задержкой до 5 минут.
export const revalidate = 300

export async function GET() {
  if (!SHEETS_PRICES_URL) {
    return NextResponse.json({ products: [] })
  }

  try {
    const res = await fetch(SHEETS_PRICES_URL, {
      next: { revalidate: 300 },  // ISR-кэш Next.js на 5 минут
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
        // Браузер кэширует на 5 минут, CDN/прокси — на 5 минут
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    })
  } catch (err) {
    console.error('[API /api/sheets] Ошибка загрузки:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
