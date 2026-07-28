/**
 * Header — шапка сайта с адаптивной навигацией
 *
 * Desktop: горизонтальное меню
 * Mobile:  логотип + кнопка-бургер → выдвижной ящик
 */

'use client'

import { useState, useEffect } from 'react'
import Link            from 'next/link'
import { usePathname } from 'next/navigation'

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

          {/* Бургер-кнопка — только на мобиле */}
          <button
            onClick={() => setOpen(v => !v)}
            aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={open}
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px]
                       text-stone-700 hover:text-stone-900 rounded-full hover:bg-stone-100 transition-colors"
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

        {/* Нижний блок */}
        <div className="border-t border-stone-100 p-6">
          <p className="text-center text-xs text-stone-400">
            © 2025 СТЕПАН. Все права защищены.
          </p>
        </div>

      </aside>
    </>
  )
}
