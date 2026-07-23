/**
 * phoneMask — маска российского номера телефона: +7 (999) 123-45-67
 *
 * formatPhone('89991234567')  → '+7 (999) 123-45-67'
 * formatPhone('999123')       → '+7 (999) 123'
 */

export const PHONE_MAX_LENGTH = 18 // длина строки '+7 (999) 123-45-67'

export function formatPhone(value) {
  let digits = String(value).replace(/\D/g, '')
  if (!digits) return ''

  // 8XXXXXXXXXX и XXXXXXXXXX приводим к 7XXXXXXXXXX
  if (digits[0] === '8') digits = '7' + digits.slice(1)
  if (digits[0] !== '7') digits = '7' + digits
  digits = digits.slice(0, 11)

  const p = digits.slice(1)
  let out = '+7'
  if (p.length > 0) out += ` (${p.slice(0, 3)}`
  if (p.length >= 3) out += ')'
  if (p.length > 3)  out += ` ${p.slice(3, 6)}`
  if (p.length > 6)  out += `-${p.slice(6, 8)}`
  if (p.length > 8)  out += `-${p.slice(8, 10)}`
  return out
}

/** Проверяет, что номер введён полностью (11 цифр) */
export function isPhoneComplete(value) {
  return String(value).replace(/\D/g, '').length === 11
}
