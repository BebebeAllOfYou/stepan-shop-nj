/**
 * Header — навигация на next/link
 * Активный маршрут подсвечивается через usePathname().
 */

'use client'

import Link            from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { label: 'Каталог',   to: '/catalog'  },
  { label: 'Интерьеры', to: '/gallery'  },
  { label: 'О нас',     to: '/about'    },
  { label: 'Отзывы',    to: '/reviews'  },
  //{ label: 'Стать партнёром', to: '/partner' },  //← раскомментируйте чтобы показать
  { label: 'Контакты',  to: '/contacts' },
]

export default function Header() {
  // trailingSlash: true → usePathname() возвращает «/catalog/», приводим к «/catalog»
  const pathname = (usePathname() ?? '/').replace(/\/+$/, '') || '/'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-100">
      <div className="container-site flex items-center justify-between h-16">

        {/* Логотип */}
        <Link href="/" className="font-display text-xl text-stone-900 tracking-tight">
          СТЕПАН<span className="text-primary-600">.</span>
        </Link>

        {/* Навигация (desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, to }) => {
            const isActive = pathname === to
            return (
              <Link
                key={to}
                href={to}
                className={[
                  'text-sm transition-colors',
                  isActive
                    ? 'text-stone-900 font-medium border-b-2 border-primary-600 pb-0.5'
                    : 'text-stone-600 hover:text-stone-900',
                ].join(' ')}
              >
                {label}
              </Link>
            )
          })}
        </nav>

      </div>
    </header>
  )
}
