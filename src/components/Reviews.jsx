/**
 * Reviews — отзывы покупателей
 * Данные из /public/data/reviews.json через useReviews()
 * TODO: добавить слайдер (Swiper.js) для мобильных
 */

'use client'

import { useReviews } from '../hooks/useReviews'

function StarRating({ rating, size = 'md' }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={[
            size === 'lg' ? 'text-xl' : 'text-sm',
            i < rating ? 'text-primary-500' : 'text-stone-700',
          ].join(' ')}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export default function Reviews() {
  const { reviews, summary, loading } = useReviews()

  return (
    <section id="reviews" className="py-20 bg-stone-900 text-white">
      <div className="container-site">

        {/* Заголовок */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="section-label text-primary-400 mb-2">Отзывы</p>
            <h1 className="font-display text-3xl md:text-4xl text-white leading-tight">
              Что говорят<br />наши клиенты
            </h1>
          </div>

          {/* Сводный рейтинг из JSON */}
          <div className="flex items-center gap-4 border border-stone-700 px-6 py-4 self-start md:self-auto">
            <p className="font-display text-4xl text-white">{summary.average}</p>
            <div>
              <StarRating rating={Math.round(summary.average)} size="lg" />
              <p className="text-xs text-stone-400 mt-1">
                на основе {summary.total.toLocaleString('ru-RU')} отзывов
              </p>
            </div>
          </div>
        </div>

        {/* Карточки */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-stone-800 p-6 animate-pulse space-y-3">
                <div className="h-3 w-24 bg-stone-700 rounded" />
                <div className="h-16 bg-stone-700 rounded" />
                <div className="h-3 w-32 bg-stone-700 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map(review => (
              <article key={review.id} className="bg-stone-800 p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <StarRating rating={review.rating} />
                  {review.verified && (
                    <span className="text-xs text-primary-400 tracking-wide">✓ покупатель</span>
                  )}
                </div>

                <blockquote className="text-stone-300 leading-relaxed flex-1 text-sm">
                  {review.text}
                </blockquote>

                <div className="pt-4 border-t border-stone-700 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium text-sm">{review.name}</p>
                    <p className="text-stone-400 text-xs mt-0.5">
                      {review.city} · {review.date}
                    </p>
                  </div>
                  <p className="text-xs text-primary-400 tracking-wide text-right whitespace-pre-line">
                      {review.productName}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </section>
  )
}
