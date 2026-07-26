/**
 * InteriorGallery — галерея готовых интерьеров
 * Данные загружаются динамически из /public/data/gallery.json через useGallery()
 * Поддерживает полноэкранный Lightbox с листалкой и быструю открытие карточки товара.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useGallery } from '../hooks/useGallery'
import { useFetch }   from '../hooks/useFetch'
import ProductModal   from './ProductModal'

function GalleryCard({ item, onClick }) {
  if (!item) return null

  return (
    <div
      onClick={onClick}
      className="group relative bg-stone-100 aspect-[4/3] rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
    >
      {/* Изображение интерьера */}
      <img
        src={item.image}
        alt={item.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />

      {/* Оверлей с подробностями и подписью */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-900/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

      {/* Иконка лупы при наведении */}
      <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm text-stone-800 text-xs px-2.5 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 font-medium">
        🔍 Увеличить
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        {item.style && (
          <p className="text-[11px] text-primary-300 font-medium tracking-wider uppercase mb-0.5">{item.style}</p>
        )}
        <p className="text-white font-display text-base leading-snug">{item.title}</p>
        {item.productName && (
          <p className="text-xs text-stone-300 opacity-90 mt-1">{item.productName}</p>
        )}
      </div>
    </div>
  )
}

export default function InteriorGallery() {
  const { gallery, loading } = useGallery()
  const { data: productsData } = useFetch('/data/products.json')

  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)

  // `gallery` уже отфильтрована в useGallery по наличии изображения
  const items = gallery

  const prevLightboxImage = useCallback(() => {
    setLightboxIndex(curr => (curr > 0 ? curr - 1 : items.length - 1))
  }, [items.length])

  const nextLightboxImage = useCallback(() => {
    setLightboxIndex(curr => (curr < items.length - 1 ? curr + 1 : 0))
  }, [items.length])

  // Навигация с клавиатуры (Esc, ←, →)
  const handleKey = useCallback((e) => {
    if (selectedProduct !== null) return // Если открыто окно товара, не перехватываем клавиши
    if (lightboxIndex === null) return
    if (e.key === 'Escape')     setLightboxIndex(null)
    if (e.key === 'ArrowLeft')  prevLightboxImage()
    if (e.key === 'ArrowRight') nextLightboxImage()
  }, [lightboxIndex, selectedProduct, prevLightboxImage, nextLightboxImage])

  useEffect(() => {
    if (lightboxIndex === null || selectedProduct !== null) return
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [lightboxIndex, selectedProduct, handleKey])

  // Открытие модального окна товара
  function handleOpenProduct(item) {
    const allProds = productsData?.products ?? []
    const found = allProds.find(p => p.id === item.productId) || 
                  allProds.find(p => p.name && p.name.toLowerCase().includes(item.productName?.toLowerCase()))

    if (found) {
      setSelectedProduct(found)
    } else {
      setSelectedProduct({
        id: item.productId || item.id,
        name: item.productName || item.title,
        category: item.category || 'Панели',
        price: 0,
        image: item.image,
        description: item.title,
      })
    }
  }

  const currentItem = lightboxIndex !== null ? items[lightboxIndex] : null

  return (
    <section id="gallery" className="py-20 bg-stone-50">
      <div className="container-site">

        {/* Заголовок */}
        <div className="mb-10 max-w-xl">
          <p className="section-label mb-2">Интерьеры</p>
          <h1 className="section-title">Готовые проекты наших клиентов</h1>
          <p className="text-stone-500 mt-3 leading-relaxed">
            Стеновые панели и вешалки в реальных интерьерах. Вдохновляйтесь готовыми решениями
            и выбирайте сочетания, которые идеально подойдут вашему пространству.
          </p>
        </div>

        {/* Скелетон загрузки */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-stone-200 rounded-lg animate-pulse" />
            ))}
          </div>
        )}

        {/* Полная сетка всех интерьеров */}
        {!loading && items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {items.map((item, idx) => (
              <GalleryCard
                key={item.id || idx}
                item={item}
                onClick={() => setLightboxIndex(idx)}
              />
            ))}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="py-12 text-center text-stone-400">
            Изображения интерьеров скоро будут добавлены.
          </div>
        )}

      </div>

      {/* ── 🔍 ПОЛНОЭКРАННЫЙ ЛАЙТБОКС С ЛИСТАЛКОЙ ── */}
      {lightboxIndex !== null && currentItem && (
        <div
          className="fixed inset-0 z-[60] bg-stone-950/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-8 animate-[fadeIn_0.2s_ease]"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Верхняя панель: инфо, кликабельное название товара, счётчик и ✕ */}
          <div
            className="w-full max-w-6xl mx-auto flex items-center justify-between text-white z-10"
            onClick={e => e.stopPropagation()}
          >
            <div>
              {currentItem.style && (
                <p className="text-xs text-primary-400 uppercase tracking-widest font-medium mb-0.5">
                  {currentItem.style}
                </p>
              )}
              <h3 className="font-display text-lg md:text-xl text-white">
                {currentItem.title}
              </h3>
              {currentItem.productName && (
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-xs text-stone-400">Товар:</span>
                  <button
                    onClick={() => handleOpenProduct(currentItem)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-800 hover:bg-primary-600 text-white text-xs font-medium rounded-full transition-colors group cursor-pointer border border-white/10"
                    title="Открыть предпросмотр товара"
                  >
                    <span>{currentItem.productName}</span>
                    <span className="text-primary-300 group-hover:text-white transition-transform group-hover:translate-x-0.5">→</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 md:gap-6">
              {/* Счётчик */}
              <span className="text-xs text-stone-400 tracking-wider">
                {lightboxIndex + 1} / {items.length}
              </span>

              {/* Кнопка закрытия (крестик) */}
              <button
                onClick={() => setLightboxIndex(null)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl transition-colors"
                aria-label="Закрыть галерею"
                title="Закрыть просмотр (Escape)"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Центральный блок: Изображение интерьера + Стрелки навигации */}
          <div
            className="relative flex-1 w-full max-w-6xl mx-auto flex items-center justify-center my-4 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Стрелка ВЛЕВО */}
            {items.length > 1 && (
              <button
                onClick={prevLightboxImage}
                className="absolute left-2 md:left-4 z-20 w-12 h-12 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white flex items-center justify-center text-xl backdrop-blur-sm transition-all hover:scale-105 border border-white/10"
                aria-label="Предыдущее фото"
                title="Предыдущее фото (Клавиша ←)"
              >
                ←
              </button>
            )}

            {/* Главное полноэкранное фото */}
            <img
              src={currentItem.image}
              alt={currentItem.title}
              className="max-h-[78vh] max-w-full object-contain shadow-2xl rounded-sm transition-all duration-300 select-none"
            />

            {/* Стрелка ВПРАВО */}
            {items.length > 1 && (
              <button
                onClick={nextLightboxImage}
                className="absolute right-2 md:right-4 z-20 w-12 h-12 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white flex items-center justify-center text-xl backdrop-blur-sm transition-all hover:scale-105 border border-white/10"
                aria-label="Следующее фото"
                title="Следующее фото (Клавиша →)"
              >
                →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Модальное окно предпросмотра товара */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  )
}
