/**
 * Breadcrumbs — хлебные крошки с микроразметкой schema.org BreadcrumbList
 *
 * Фон подложки должен совпадать с фоном секции страницы (проп bg),
 * на тёмных страницах передавайте dark для светлого текста.
 *
 * Использование (последний элемент — текущая страница, без ссылки):
 *   <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Каталог' }]} bg="bg-stone-50" />
 */

import Link   from 'next/link'
import JsonLd from './JsonLd'
import { SITE_URL } from '../config/site'

export default function Breadcrumbs({ items, bg = 'bg-white', dark = false }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE_URL}${item.href === '/' ? '/' : item.href + '/'}` } : {}),
    })),
  }

  const linkColor    = dark ? 'text-stone-500 hover:text-white' : 'text-stone-400 hover:text-stone-900'
  const currentColor = dark ? 'text-stone-300' : 'text-stone-600'
  const dividerColor = dark ? 'text-stone-600' : 'text-stone-300'

  return (
    <div className={bg}>
      <JsonLd data={jsonLd} />
      {/* z-10 — чтобы крошки не перекрывались секциями с position: relative (Hero) */}
      <nav aria-label="Хлебные крошки" className="container-site pt-6 -mb-10 relative z-10">
        <ol className="flex flex-wrap items-center gap-2 text-xs">
          {items.map((item, i) => {
            const isLast = i === items.length - 1
            return (
              <li key={item.label} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true" className={dividerColor}>/</span>}
                {item.href && !isLast ? (
                  <Link href={item.href} className={`${linkColor} transition-colors`}>
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current="page" className={currentColor}>{item.label}</span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
    </div>
  )
}
