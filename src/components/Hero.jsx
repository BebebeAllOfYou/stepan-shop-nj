/**
 * Hero — главный полноэкранный баннер в стиле IKEA/Hoff
 *
 * Статистика загружается из /public/data/company.json через useCompany()
 * Слоган берётся из src/config/site.js → SITE_TAGLINE
 */

'use client'

import Link           from 'next/link'
import Image          from 'next/image'
import { useCompany } from '../hooks/useCompany'
import { SITE_TAGLINE } from '../config/site'

export default function Hero() {
  const { company } = useCompany()
  const stats = company?.stats ?? []

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center bg-stone-900 overflow-hidden"
      style={{ paddingTop: 'calc(4rem + 2rem)' /* header height + topbar */ }}
    >

      {/* ── Фоновое изображение ─────────────────────────── */}
      <div className="absolute inset-0">
        <Image
          src="/images/home/hero.jpg"
          alt="Декоративные стеновые панели в интерьере"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Тёмный градиент для читаемости текста */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/85 via-stone-950/60 to-stone-950/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/50 via-transparent to-transparent" />
      </div>

      {/* ── Контент ─────────────────────────────────────── */}
      <div className="relative z-10 container-site py-20 md:py-28">
        <div className="max-w-2xl">

          {/* Лейбл */}
          <p className="section-label text-primary-400 mb-4 animate-fadeInUp"
             style={{ animationDelay: '0.1s' }}>
            {SITE_TAGLINE}
          </p>

          {/* Заголовок */}
          <h1
            className="font-display text-5xl md:text-6xl lg:text-7xl text-white leading-[1.05] mb-6 animate-fadeInUp"
            style={{ animationDelay: '0.2s' }}
          >
            Эстетика стен,<br />
            <em className="text-primary-400 not-italic">созданная</em><br />
            для вас
          </h1>

          {/* Подпись */}
          <p
            className="text-stone-300 text-lg leading-relaxed max-w-lg mb-8 animate-fadeInUp"
            style={{ animationDelay: '0.3s' }}
          >
            Самоклеящиеся стеновые панели и настенные вешалки — быстрый монтаж,
            высокое качество и современный дизайн.
          </p>

          {/* CTA кнопки */}
          <div
            className="flex flex-wrap gap-4 mb-12 animate-fadeInUp"
            style={{ animationDelay: '0.4s' }}
          >
            <Link href="/catalog" className="btn-primary">
              Смотреть каталог
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd"
                  d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0
                     010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                  clipRule="evenodd" />
              </svg>
            </Link>
            <Link href="/gallery" className="btn-outline border-white/60 text-white hover:bg-white hover:text-stone-900">
              Готовые интерьеры
            </Link>
          </div>

          {/* Статистика */}
          {stats.length > 0 && (
            <div
              className="flex flex-wrap gap-8 pt-8 border-t border-white/20 animate-fadeInUp"
              style={{ animationDelay: '0.5s' }}
            >
              {stats.map(({ value, label }) => (
                <div key={label}>
                  <p className="font-display text-3xl text-white">{value}</p>
                  <p className="text-xs text-stone-400 mt-0.5 tracking-wide">{label}</p>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Скролл-индикатор */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2 text-white/40">
        <span className="text-[11px] tracking-widest uppercase">Листайте вниз</span>
        <span className="block w-[1px] h-10 bg-white/20 animate-pulse" />
      </div>

    </section>
  )
}
