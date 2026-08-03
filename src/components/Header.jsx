/**
 * Header — шапка сайта в стиле крупного ритейлера (IKEA/Hoff)
 *
 * Структура:
 *   [TopBar]   — тонкая информационная полоска: телефон, часы работы, соцсети
 *   [MainBar]  — логотип, навигация, корзина
 *   [Drawer]   — мобильное выдвижное меню
 *
 * Название компании берётся из src/config/site.js → SITE_NAME
 * Чтобы сменить имя — измените только SITE_NAME в этом файле.
 */

'use client'

import { useState, useEffect } from 'react'
import Link            from 'next/link'
import { usePathname } from 'next/navigation'
import { useCartContext } from '../context/CartContext'
import { SITE_NAME }   from '../config/site'

const NAV_LINKS = [
  { label: 'Каталог',   to: '/catalog',  emoji: '🛋️' },
  { label: 'Интерьеры', to: '/gallery',  emoji: '🖼️' },
  { label: 'О нас',     to: '/about',    emoji: '🏢' },
  { label: 'Отзывы',    to: '/reviews',  emoji: '⭐' },
  { label: 'Контакты',  to: '/contacts', emoji: '📞' },
]

/* ── Иконка корзины ─────────────────────────────────────────────── */
function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      className="w-5 h-5" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0
           00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114
           60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 110-1.5.75.75
           0 010 1.5zm10.5 0a.75.75 0 110-1.5.75.75 0 010 1.5z" />
    </svg>
  )
}

/* ── Логотип ─────────────────────────────────────────────────────── */
function Logo({ onClick }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      className="flex-shrink-0 flex items-center gap-1 group"
      aria-label={`${SITE_NAME} — главная страница`}
    >
      <span className="font-display text-2xl text-stone-900 tracking-tight leading-none
                       group-hover:text-primary-700 transition-colors duration-200">
        {SITE_NAME}
      </span>
      <span className="w-2 h-2 rounded-full bg-primary-600 mb-0.5 flex-shrink-0
                       group-hover:scale-125 transition-transform duration-200" />
    </Link>
  )
}

export default function Header() {
  const pathname = (usePathname() ?? '/').replace(/\/+$/, '') || '/'
  const [open, setOpen]           = useState(false)
  const [scrolled, setScrolled]   = useState(false)
  const { totalItems, setIsOpen: openCart } = useCartContext()

  /* Закрываем меню при смене страницы */
  useEffect(() => { setOpen(false) }, [pathname])

  /* Тень хедера при скролле */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Блокируем скролл при открытом мобильном меню */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/*  FIXED HEADER WRAPPER                             */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <header
        className={[
          'fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-300',
          scrolled ? 'shadow-md' : 'shadow-none border-b border-stone-100',
        ].join(' ')}
      >

        {/* ── TopBar: информационная полоса ─────────────── */}
        <div className="hidden md:block bg-stone-900 text-stone-300 text-xs">
          <div className="container-site flex items-center justify-between h-8">
            <span>Бесплатная доставка от 50 000 ₽ по Москве и МО</span>
            <div className="flex items-center gap-6">
              <a href="tel:+79991234567"
                className="hover:text-white transition-colors">
                +7 (999) 123-45-67
              </a>
              <span className="text-stone-600">|</span>
              <span>пн–вс 9:00–21:00</span>
            </div>
          </div>
        </div>

        {/* ── MainBar: лого + навигация + корзина ────────── */}
        <div className="container-site flex items-center justify-between h-16 gap-6">

          {/* Логотип */}
          <Logo onClick={() => setOpen(false)} />

          {/* ── Desktop навигация ── */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {NAV_LINKS.map(({ label, to }) => {
              const isActive = pathname === to
              return (
                <Link
                  key={to}
                  href={to}
                  className={[
                    'relative px-4 py-2 text-sm font-medium rounded-sm transition-colors duration-150 whitespace-nowrap',
                    isActive
                      ? 'text-primary-700 bg-primary-50'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50',
                  ].join(' ')}
                >
                  {label}
                  {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-primary-600 rounded-full" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Правый блок */}
          <div className="flex items-center gap-1 flex-shrink-0">

            {/* Кнопка корзины */}
            <button
              id="header-cart-btn"
              onClick={() => openCart(true)}
              aria-label={`Корзина (${totalItems} товаров)`}
              className="relative flex items-center gap-2 pl-3 pr-4 h-10
                         text-stone-700 hover:text-stone-900 hover:bg-stone-50
                         rounded-sm transition-colors duration-150"
            >
              <CartIcon />
              <span className="hidden sm:inline text-sm font-medium">Корзина</span>
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1
                                 text-[11px] font-bold bg-primary-600 text-white
                                 rounded-full flex items-center justify-center leading-none">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            {/* Бургер — только мобиле */}
            <button
              id="header-burger-btn"
              onClick={() => setOpen(v => !v)}
              aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={open}
              className="md:hidden ml-1 w-10 h-10 flex flex-col items-center justify-center gap-[5px]
                         text-stone-700 hover:text-stone-900 rounded-sm hover:bg-stone-50 transition-colors"
            >
              <span className={[
                'block w-5 h-[1.5px] bg-current rounded-full transition-all duration-300',
                open ? 'translate-y-[6.5px] rotate-45' : '',
              ].join(' ')} />
              <span className={[
                'block w-5 h-[1.5px] bg-current rounded-full transition-all duration-300',
                open ? 'opacity-0 scale-x-0' : '',
              ].join(' ')} />
              <span className={[
                'block w-5 h-[1.5px] bg-current rounded-full transition-all duration-300',
                open ? '-translate-y-[6.5px] -rotate-45' : '',
              ].join(' ')} />
            </button>

          </div>
        </div>
      </header>

      {/* ── Mobile: Backdrop ─────────────────────────────── */}
      <div
        onClick={() => setOpen(false)}
        className={[
          'fixed inset-0 z-40 bg-stone-950/50 backdrop-blur-sm transition-opacity duration-300 md:hidden',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        aria-hidden="true"
      />

      {/* ── Mobile: Выдвижной ящик ───────────────────────── */}
      <aside
        className={[
          'fixed top-0 right-0 z-50 h-full w-[78vw] max-w-[340px] bg-white shadow-2xl',
          'flex flex-col transition-transform duration-300 ease-in-out md:hidden',
          open ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
        aria-label="Навигационное меню"
      >
        {/* Шапка ящика */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
          <Logo onClick={() => setOpen(false)} />
          <button
            onClick={() => setOpen(false)}
            aria-label="Закрыть меню"
            className="w-9 h-9 flex items-center justify-center text-stone-400
                       hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors text-2xl"
          >×</button>
        </div>

        {/* Список ссылок */}
        <nav className="flex-1 overflow-y-auto py-3">
          {NAV_LINKS.map(({ label, to, emoji }) => {
            const isActive = pathname === to
            return (
              <Link
                key={to}
                href={to}
                onClick={() => setOpen(false)}
                className={[
                  'flex items-center gap-4 px-6 py-4 text-base transition-colors border-l-[3px]',
                  isActive
                    ? 'border-primary-600 bg-primary-50 text-stone-900 font-semibold'
                    : 'border-transparent text-stone-600 hover:bg-stone-50 hover:text-stone-900',
                ].join(' ')}
              >
                <span className="text-xl w-7 text-center">{emoji}</span>
                <span>{label}</span>
                {isActive && (
                  <span className="ml-auto text-primary-500 text-xs font-bold">●</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Нижний блок — контакты + корзина */}
        <div className="border-t border-stone-100 p-6 space-y-3">
          <a href="tel:+79991234567"
            className="flex items-center gap-2 text-sm text-stone-600">
            <span className="text-base">📞</span>
            +7 (999) 123-45-67
          </a>
          <button
            id="mobile-cart-btn"
            onClick={() => { setOpen(false); openCart(true) }}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-stone-900 text-white
                       hover:bg-stone-800 transition-colors rounded-sm text-sm font-medium"
          >
            <span>Корзина заказа</span>
            <span className="flex items-center gap-2">
              {totalItems > 0 && (
                <span className="bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
              <CartIcon />
            </span>
          </button>
        </div>

      </aside>
    </>
  )
}
