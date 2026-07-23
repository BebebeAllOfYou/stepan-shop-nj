/**
 * InteriorGallery — галерея готовых интерьеров
 * Данные загружаются динамически из /public/data/gallery.json через useGallery()
 */

'use client'

import Link           from 'next/link'
import { useGallery } from '../hooks/useGallery'

function GalleryCard({ item, className = '' }) {
  if (!item) return null

  return (
    <div className={`group relative bg-stone-100 overflow-hidden cursor-pointer ${className}`}>
      {/* Изображение интерьера */}
      {item.image ? (
        <img 
          src={item.image} 
          alt={item.title} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-stone-300 text-xs">
          [Фото интерьера]
        </div>
      )}

      {/* Оверлей с подписью */}
      <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/50 transition-colors duration-400" />
      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <p className="text-xs text-primary-300 tracking-wide uppercase">{item.style}</p>
        <p className="text-white font-display mt-0.5">{item.title}</p>
        {item.productName && (
          <p className="text-[11px] text-stone-300 opacity-90 mt-0.5">{item.productName}</p>
        )}
      </div>
    </div>
  )
}

export default function InteriorGallery() {
  const { gallery, loading } = useGallery()

  const items = gallery.length > 0 ? gallery : []

  return (
    <section id="gallery" className="py-20 bg-stone-50">
      <div className="container-site">

        {/* Заголовок */}
        <div className="mb-10 max-w-xl">
          <p className="section-label mb-2">Интерьеры</p>
          <h1 className="section-title">Готовые проекты наших клиентов</h1>
          <p className="text-stone-500 mt-3 leading-relaxed">
            Стеновые панели и вешалки для любого интерьера. Вдохновляйтесь готовыми решениями
            и выбирайте сочетания, которые идеально подойдут вашему пространству.
          </p>
        </div>

        {/* Сетка — ассиметричный layout */}
        {!loading && items.length >= 5 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-[520px]">
            {/* Большая карточка */}
            <GalleryCard item={items[0]} className="row-span-2 col-span-1 md:col-span-1" />

            {/* Малые карточки */}
            <GalleryCard item={items[1]} />
            <GalleryCard item={items[2]} />
            <GalleryCard item={items[3]} />
            <GalleryCard item={items[4]} />
          </div>
        )}

        {/* Ссылка на все проекты */}
        <div className="mt-8 text-center">
          <Link href="/gallery" className="btn-outline">Все проекты</Link>
        </div>

      </div>
    </section>
  )
}
