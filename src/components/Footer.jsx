/**
 * Footer — подвал сайта
 *
 * Название компании берётся из src/config/site.js → SITE_NAME
 * Чтобы сменить имя — измените только SITE_NAME в этом файле.
 */

import Link from 'next/link'
import { SITE_NAME } from '../config/site'

const FOOTER_NAV = {
  'Каталог': [
    { label: 'Все товары',            to: '/catalog'  },
    { label: 'Вешалки в цвете',        to: '/catalog'  },
    { label: 'Панели под покраску',    to: '/catalog'  },
    { label: 'Панели в цвете',         to: '/catalog'  },
  ],
  'Компания': [
    { label: 'О нас',     to: '/about'    },
    { label: 'Контакты',  to: '/contacts' },
    { label: 'Отзывы',    to: '/reviews'  },
  ],
  'Покупателям': [
    { label: 'FAQ',             to: '/contacts' },
    { label: 'Доставка и оплата', to: '/contacts' },
    { label: 'Возврат',          to: '/contacts' },
  ],
}

const SOCIALS = [
  {
    name: 'VK',
    href: 'https://vk.com/forma',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
        <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.862-.523-2.049-1.712-1.033-1.01-1.49-.988-1.743-.988-.355 0-.454.1-.454.58v1.564c0 .415-.133.662-1.233.662-1.81 0-3.818-1.097-5.23-3.143C5.47 11.73 4.77 9.587 4.77 9.085c0-.253.1-.489.58-.489h1.744c.434 0 .598.2.766.667.843 2.434 2.25 4.564 2.832 4.564.217 0 .316-.1.316-.647V11.01c-.066-1.165-.683-1.264-.683-1.68 0-.2.167-.4.433-.4h2.745c.366 0 .5.2.5.63v3.386c0 .367.167.5.267.5.217 0 .4-.133.8-.533 1.233-1.384 2.116-3.513 2.116-3.513.117-.253.317-.489.75-.489h1.744c.523 0 .637.268.523.632-.217 1.067-2.332 3.996-2.332 3.996-.183.3-.25.434 0 .767.184.25.784.766 1.184 1.233.733.833 1.3 1.533 1.45 2.016.133.483-.117.733-.6.733z" />
      </svg>
    ),
  },
  {
    name: 'Telegram',
    href: 'https://t.me/forma_mebel',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    href: 'https://youtube.com/@forma',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-stone-950 text-stone-400">

      {/* Основной блок */}
      <div className="container-site py-16 grid grid-cols-2 md:grid-cols-4 gap-10">

        {/* Лого + описание */}
        <div className="col-span-2 md:col-span-1 space-y-5">
          <Link href="/" className="inline-flex items-center gap-1 group">
            <span className="font-display text-xl text-white tracking-tight
                             group-hover:text-primary-400 transition-colors duration-200">
              {SITE_NAME}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mb-0.5 flex-shrink-0" />
          </Link>

          <p className="text-sm leading-relaxed">
            Декоративные панели и настенные вешалки для тех, кто ценит стиль и качество.
            Производство в России.
          </p>

          {/* Соцсети */}
          <div className="flex gap-2.5 pt-1">
            {SOCIALS.map(({ name, href, icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={name}
                className="w-9 h-9 border border-stone-700 flex items-center justify-center
                           hover:border-primary-500 hover:text-primary-400 hover:bg-stone-900
                           transition-all duration-200 rounded-sm"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Навигационные колонки */}
        {Object.entries(FOOTER_NAV).map(([heading, links]) => (
          <nav key={heading}>
            <p className="text-white text-sm font-semibold mb-5 tracking-wide">{heading}</p>
            <ul className="space-y-3">
              {links.map(({ label, to }) => (
                <li key={label}>
                  <Link href={to}
                    className="text-sm hover:text-white transition-colors duration-150">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

      </div>

      {/* Нижняя строка */}
      <div className="border-t border-stone-800">
        <div className="container-site py-5 flex flex-col sm:flex-row justify-between gap-2 text-xs">
          <p>© {year} {SITE_NAME}. Все права защищены.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">Конфиденциальность</Link>
            <Link href="/terms"   className="hover:text-white transition-colors">Условия использования</Link>
          </div>
        </div>
      </div>

    </footer>
  )
}
