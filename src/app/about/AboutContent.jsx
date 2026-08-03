/**
 * AboutContent — клиентский компонент страницы «О нас»
 * (вынесен отдельно, чтобы page.jsx мог экспортировать metadata как Server Component)
 */

'use client'

import Link          from 'next/link'
import Image         from 'next/image'
import Breadcrumbs   from '../../components/Breadcrumbs'
import WhyUs         from '../../components/WhyUs'
import { useCompany } from '../../hooks/useCompany'
import { SITE_NAME } from '../../config/site'

function StatsBlock() {
  const { company } = useCompany()
  const stats = company?.stats ?? []
  if (stats.length === 0) return null

  return (
    <div className="grid grid-cols-3 gap-6 py-10 border-y border-stone-200">
      {stats.map(({ value, label }) => (
        <div key={label} className="text-center">
          <p className="font-display text-4xl md:text-5xl text-stone-900 mb-1">{value}</p>
          <p className="text-sm text-stone-500 leading-relaxed">{label}</p>
        </div>
      ))}
    </div>
  )
}

export default function AboutContent() {
  return (
    <main className="pt-16">
      <Breadcrumbs
        items={[{ label: 'Главная', href: '/' }, { label: 'О нас' }]}
        bg="bg-stone-50"
      />

      {/* ── Hero блок ─────────────────────────────────────── */}
      <section className="bg-stone-50 py-16 md:py-24">
        <div className="container-site">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">

            {/* Текст */}
            <div className="space-y-6">
              <p className="section-label">О компании</p>
              <h1 className="section-title">
                {SITE_NAME} — мы создаём<br />
                <span className="text-primary-600">красивые интерьеры</span>
              </h1>
              <p className="section-subtitle">
                Производим декоративные стеновые панели и настенные вешалки из МДФ.
                Наши изделия помогают быстро и стильно обновить любое пространство —
                без ремонта, без инструментов, без лишних затрат.
              </p>
              <p className="text-stone-500 leading-relaxed">
                С 2012 года мы поставляем продукцию частным покупателям, дизайнерам и
                строительным компаниям по всей России. Собственное производство позволяет
                контролировать каждый этап — от выбора материалов до упаковки.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/catalog"  className="btn-primary">Смотреть каталог</Link>
                <Link href="/contacts" className="btn-outline">Написать нам</Link>
              </div>
            </div>

            {/* Фото */}
            <div className="relative aspect-[4/3] bg-stone-200 rounded-sm overflow-hidden shadow-xl">
              <Image
                src="/images/home/hero.jpg"
                alt={`${SITE_NAME} — производство`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 to-transparent" />
            </div>

          </div>
        </div>
      </section>

      {/* ── Статистика ────────────────────────────────────── */}
      <section className="py-12 bg-white">
        <div className="container-site">
          <StatsBlock />
        </div>
      </section>

      {/* ── Наши ценности ─────────────────────────────────── */}
      <section className="py-16 bg-stone-50">
        <div className="container-site">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <p className="section-label mb-3">Наши принципы</p>
            <h2 className="section-title mb-4">Что для нас важно</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                id: 'quality',
                num: '01',
                title: 'Качество без компромиссов',
                text: 'Мы используем только сертифицированные материалы и жёсткий контроль на каждом этапе производства.',
              },
              {
                id: 'design',
                num: '02',
                title: 'Современный дизайн',
                text: 'Наша команда следит за актуальными тенденциями и создаёт коллекции, которые не устаревают.',
              },
              {
                id: 'service',
                num: '03',
                title: 'Сервис на высшем уровне',
                text: 'Помогаем с выбором, отвечаем на вопросы и поддерживаем на каждом этапе — от заказа до монтажа.',
              },
            ].map(({ id, num, title, text }) => (
              <div
                key={id}
                id={`value-${id}`}
                className="bg-white p-8 rounded-sm border border-stone-100
                           hover:border-primary-200 hover:shadow-md transition-all duration-300"
              >
                <p className="font-display text-4xl text-primary-200 mb-4">{num}</p>
                <h3 className="font-display text-xl text-stone-900 mb-3">{title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Преимущества ──────────────────────────────────── */}
      <WhyUs />

      {/* ── CTA блок ──────────────────────────────────────── */}
      <section className="py-16 bg-stone-900 text-white">
        <div className="container-site text-center space-y-6">
          <p className="section-label text-primary-400">Работайте с нами</p>
          <h2 className="font-display text-3xl md:text-4xl text-white">
            Готовы обновить свой интерьер?
          </h2>
          <p className="text-stone-400 max-w-lg mx-auto leading-relaxed">
            Посмотрите каталог или свяжитесь с нами — поможем подобрать решение под любой бюджет.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-2">
            <Link href="/catalog"  className="btn-primary">Перейти в каталог</Link>
            <Link href="/contacts"
              className="btn-outline border-stone-600 text-stone-300
                         hover:bg-stone-700 hover:text-white hover:border-stone-600">
              Связаться с нами
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
