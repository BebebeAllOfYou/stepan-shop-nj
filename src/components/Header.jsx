/**
 * Header — шапка сайта с адаптивной навигацией
 *
 * Desktop: горизонтальное меню + кнопка корзины
 * Mobile:  логотип + кнопка корзины + кнопка-бургер → выдвижной ящик
 */

'use client'

import { useState, useEffect } from 'react'
import Link            from 'next/link'
import { usePathname } from 'next/navigation'
import { useCartContext } from '../context/CartContext'

const NAV_LINKS = [
  { label: 'Каталог',   to: '/catalog',  emoji: '🛋️' },
  { label: 'Интерьеры', to: '/gallery',  emoji: '🖼️' },
  { label: 'О нас',     to: '/about',    emoji: '🏢' },
  { label: 'Отзывы',    to: '/reviews',  emoji: '⭐' },
  // { label: 'Стать партнёром', to: '/partner', emoji: '🤝' },
  { label: 'Контакты',  to: '/contacts', emoji: '📞' },
]

export default function Header() {
  const pathname    = (usePathname() ?? '/').replace(/\/+$/, '') || '/'
  const [open, setOpen] = useState(false)
  const { totalItems, setIsOpen: openCart } = useCartContext()

  // Закрываем меню при смене страницы
  useEffect(() => { setOpen(false) }, [pathname])

  // Блокируем скролл при открытом меню
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-100">
        <div className="container-site flex items-center justify-between h-16 gap-4">

          {/* Логотип */}
          <Link
            href="/"
            className="font-display text-xl text-stone-900 tracking-tight flex-shrink-0"
            onClick={() => setOpen(false)}
          >
            СТЕПАН<span className="text-primary-600">.</span>
          </Link>

          {/* ── Desktop: горизонтальное меню ── */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 flex-1 justify-center">
            {NAV_LINKS.map(({ label, to }) => {
              const isActive = pathname === to
              return (
                <Link
                  key={to}
                  href={to}
                  className={[
                    'text-sm transition-colors whitespace-nowrap',
                    isActive
                      ? 'text-stone-900 font-semibold border-b-2 border-primary-600 pb-0.5'
                      : 'text-stone-500 hover:text-stone-900',
                  ].join(' ')}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Правая группа: корзина + бургер */}
          <div className="flex items-center gap-1 flex-shrink-0">

            {/* Кнопка корзины — всегда видна */}
            <button
              onClick={() => openCart(true)}
              aria-label={`Корзина (${totalItems})`}
              className="relative w-10 h-10 flex items-center justify-center text-stone-600
                         hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors"
            >
              {/* Иконка корзины */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                className="w-5 h-5" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218
                     c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0
                     110-1.5.75.75 0 010 1.5zm10.5 0a.75.75 0 110-1.5.75.75 0 010 1.5z" />
              </svg>

              {/* Счётчик */}
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 text-[10px] font-bold
                                 bg-primary-600 text-white rounded-full flex items-center justify-center leading-none">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            {/* Бургер-кнопка — только на мобиле */}
            <button
              onClick={() => setOpen(v => !v)}
              aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={open}
              className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px]
                         text-stone-700 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
            >
              {/* 3 полоски → крестик */}
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

      {/* ── Mobile: Backdrop ── */}
      <div
        onClick={() => setOpen(false)}
        className={[
          'fixed inset-0 z-40 bg-stone-950/50 backdrop-blur-sm transition-opacity duration-300 md:hidden',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        aria-hidden="true"
      />

      {/* ── Mobile: Выдвижной ящик ── */}
      <aside
        className={[
          'fixed top-0 right-0 z-50 h-full w-[75vw] max-w-[320px] bg-white shadow-2xl',
          'flex flex-col transition-transform duration-300 ease-in-out md:hidden',
          open ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
        aria-label="Навигационное меню"
      >
        {/* Шапка ящика */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <Link href="/" onClick={() => setOpen(false)}
            className="font-display text-lg text-stone-900 tracking-tight">
            СТЕПАН<span className="text-primary-600">.</span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label="Закрыть меню"
            className="w-9 h-9 flex items-center justify-center text-stone-400 hover:text-stone-900
                       hover:bg-stone-100 rounded-full transition-colors text-2xl leading-none"
          >×</button>
        </div>

        {/* Список ссылок */}
        <nav className="flex-1 overflow-y-auto py-4">
          {NAV_LINKS.map(({ label, to, emoji }) => {
            const isActive = pathname === to
            return (
              <Link
                key={to}
                href={to}
                onClick={() => setOpen(false)}
                className={[
                  'flex items-center gap-4 px-6 py-4 text-base transition-colors border-l-4',
                  isActive
                    ? 'border-primary-600 bg-primary-50 text-stone-900 font-semibold'
                    : 'border-transparent text-stone-600 hover:bg-stone-50 hover:text-stone-900',
                ].join(' ')}
              >
                <span className="text-xl w-7 text-center">{emoji}</span>
                <span>{label}</span>
                {isActive && (
                  <span className="ml-auto text-primary-600 text-sm">●</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Нижний блок — кнопка корзины */}
        <div className="border-t border-stone-100 p-6">
          <button
            onClick={() => { setOpen(false); openCart(true) }}
            className="w-full flex items-center justify-between px-5 py-3.5 bg-stone-900 text-white
                       hover:bg-stone-800 transition-colors rounded text-sm font-medium"
          >
            <span>Моя корзина</span>
            <span className="flex items-center gap-2">
              {totalItems > 0 && (
                <span className="bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="w-4 h-4" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0
                     00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114
                     60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 110-1.5.75.75
                     0 010 1.5zm10.5 0a.75.75 0 110-1.5.75.75 0 010 1.5z" />
              </svg>
            </span>
          </button>
          <p className="text-center text-xs text-stone-400 mt-3">
            © 2025 СТЕПАН. Все права защищены.
          </p>
        </div>

      </aside>
    </>
  )
}
