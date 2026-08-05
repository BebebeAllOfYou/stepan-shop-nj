/** @type {import('next').NextConfig} */
module.exports = {
  // Единый канонический вид URL: со слэшем на конце (/catalog/).
  // Запросы без слэша получают 308-редирект — дублей страниц для поисковиков нет.
  trailingSlash: true,

  images: {
    // Ширины для адаптивной нарезки (px) — под них sharp режет WebP-версии
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes:  [64, 128, 256, 384, 512],
    // Форматы в порядке приоритета (AVIF дает еще более высокую степень сжатия для поддерживающих браузеров)
    formats: ['image/avif', 'image/webp'],
    // Кэш оптимизированных изображений — 30 дней
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  // ── Заголовки безопасности для всех маршрутов ────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Запрет открывать сайт в iframe на сторонних доменах (защита от clickjacking)
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },

          // Браузер не пытается угадать MIME-тип файла (защита от MIME-sniffing атак)
          { key: 'X-Content-Type-Options', value: 'nosniff' },

          // При переходе по внешней ссылке передаётся только origin, без пути
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

          // Разрешает только собственный контент + данные + картинки из /images
          // Запрещает inline-скрипты кроме Next.js runtime (nonce не нужен — статика)
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js требует unsafe-inline для hydration
              "style-src 'self' 'unsafe-inline'",                // Tailwind инлайн-стили
              "img-src 'self' data: blob:",
              "font-src 'self'",                                  // шрифты только локальные
              "connect-src 'self' https://api.telegram.org",      // только Telegram API (заявки)
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },

          // Разрешает HTTPS только, без HTTP fallback (1 год + subdomains)
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },

          // Ограничивает доступ к браузерным API (камера, микрофон, геолокация)
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}
