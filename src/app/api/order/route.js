/**
 * POST /api/order — приём заявок и отправка в Telegram
 *
 * Токен бота хранится на сервере (.env.local / переменные окружения хостинга)
 * и не попадает в клиентский бандл.
 *
 * Тело запроса:
 *   { type: 'order',       items: [...], customer: { name, phone, comment } }
 *   { type: 'partnership', data: { company, phone, volume, comment } }
 */

import { NextResponse } from 'next/server'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const CHAT_ID   = process.env.TELEGRAM_CHAT_ID

/** Экранирует HTML-спецсимволы в пользовательском вводе (parse_mode: HTML) */
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const fmt = n => Number(n).toLocaleString('ru-RU')

/** Форматирует дату и время по московскому времени */
function nowMSK() {
  return new Date().toLocaleString('ru-RU', {
    timeZone: 'Europe/Moscow',
    day:      '2-digit',
    month:    '2-digit',
    year:     'numeric',
    hour:     '2-digit',
    minute:   '2-digit',
  })
}

/** Строит текст заявки-заказа из корзины */
function buildOrderText(items, customer) {
  const lines = items.map(item =>
    `• <b>${esc(item.name)}</b> — ${Number(item.qty)} шт. × ${fmt(item.price)} ₽ = ${fmt(item.price * item.qty)} ₽`
  )

  const total = items.reduce((s, i) => s + Number(i.price) * Number(i.qty), 0)

  return [
    '🛒 <b>НОВЫЙ ЗАКАЗ</b>',
    '',
    `👤 Клиент: ${esc(customer.name)}`,
    `📞 Телефон: ${esc(customer.phone)}`,
    customer.comment ? `💬 Комментарий: ${esc(customer.comment)}` : '',
    '',
    '<b>Состав заказа:</b>',
    ...lines,
    '',
    `💰 <b>Итого: ${fmt(total)} ₽</b>`,
    '',
    `🕐 ${nowMSK()}`,
  ].filter(l => l !== null && l !== undefined && l !== false).join('\n')
}

/** Строит текст заявки на партнёрство */
function buildPartnershipText(data) {
  return [
    '🤝 <b>ЗАЯВКА НА ПАРТНЁРСТВО</b>',
    '',
    `🏢 Компания / Имя: ${esc(data.company)}`,
    `📞 Телефон: ${esc(data.phone)}`,
    `📦 Объём закупки: ${esc(data.volume) || 'не указан'}`,
    data.comment ? `💬 Комментарий: ${esc(data.comment)}` : '',
    '',
    `🕐 ${nowMSK()}`,
  ].filter(Boolean).join('\n')
}

export async function POST(request) {
  if (!BOT_TOKEN || !CHAT_ID) {
    return NextResponse.json(
      { error: 'Telegram не настроен — задайте TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID' },
      { status: 500 },
    )
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Некорректный JSON' }, { status: 400 })
  }

  let text
  if (body.type === 'order') {
    const { items, customer } = body
    if (!Array.isArray(items) || items.length === 0 || !customer?.name || !customer?.phone) {
      return NextResponse.json({ error: 'Не заполнены обязательные поля заказа' }, { status: 400 })
    }
    text = buildOrderText(items, customer)
  } else if (body.type === 'partnership') {
    const { data } = body
    if (!data?.company || !data?.phone) {
      return NextResponse.json({ error: 'Не заполнены обязательные поля заявки' }, { status: 400 })
    }
    text = buildPartnershipText(data)
  } else {
    return NextResponse.json({ error: 'Неизвестный тип заявки' }, { status: 400 })
  }

  let res
  try {
    res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' }),
    })
  } catch {
    return NextResponse.json({ error: 'Нет соединения с Telegram' }, { status: 502 })
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    return NextResponse.json({ error: err.description ?? `Telegram HTTP ${res.status}` }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
