/**
 * Partner — секция «Стать партнёром»
 *
 * Карта: используется Yandex Maps через iframe.
 * Чтобы изменить точку на карте:
 *   1. Откройте https://yandex.ru/maps
 *   2. Найдите нужный адрес
 *   3. Нажмите «Поделиться» → «Скопировать код для вставки»
 *   4. Замените значение константы MAP_EMBED_URL ниже
 */

// ─── НАСТРОЙКИ — меняйте здесь ───────────────────────────────────────────────

/** Координаты цеха: широта, долгота (Лебяжье, Кировская обл.) */
const MAP_EMBED_URL =
  'https://yandex.ru/map-widget/v1/?ll=51.095694%2C57.781736&z=14&pt=51.095694,57.781736,pm2rdm'

/** Адрес цеха (отображается рядом с картой) */
const WORKSHOP_ADDRESS = 'с. Лебяжье, Кировская область'

// ─────────────────────────────────────────────────────────────────────────────

const BENEFITS = [
  { icon: '📦', title: 'Оптовые цены',      text: 'Специальные условия от 50 единиц. Чем больше объём — тем выгоднее цена.' },
  { icon: '🏭', title: 'Собственный цех',   text: 'Производство полного цикла. Контроль качества на каждом этапе.' },
  { icon: '🚚', title: 'Доставка по России', text: 'Отправляем ТК «СДЭК», «Деловые Линии», «ПЭК». Упаковка — за наш счёт.' },
  { icon: '📐', title: 'Работа под заказ',  text: 'Изготовим панели нужного размера, цвета и фактуры по вашим ТЗ.' },
  { icon: '🤝', title: 'Личный менеджер',   text: 'Закреплённый менеджер, быстрые ответы, счета и документы день в день.' },
  { icon: '📋', title: 'Все документы',     text: 'Работаем с ИП и юридическими лицами. Полный пакет закрывающих документов.' },
]

const WHOLESALE_TIERS = [
  { from: 'от 50 ед.',  discount: '−5%',  label: 'Старт'   },
  { from: 'от 200 ед.', discount: '−10%', label: 'Партнёр' },
  { from: 'от 500 ед.', discount: '−18%', label: 'Дилер'   },
]

export default function Partner() {
  return (
    <section id="partner" className="py-24 bg-stone-950 text-white overflow-hidden">
      <div className="container-site">

        {/* Заголовок */}
        <div className="mb-16 max-w-2xl">
          <p className="section-label text-primary-400 mb-3">Партнёрство</p>
          <h1 className="font-display text-4xl md:text-5xl text-white leading-tight mb-5">
            Стать партнёром
          </h1>
          <p className="text-stone-400 text-lg leading-relaxed">
            Мы производим стеновые панели и декоративные рейки в собственном
            цехе и готовы к долгосрочному сотрудничеству — дизайнерам,
            строительным компаниям, магазинам отделочных материалов.
          </p>
        </div>

        {/* Преимущества */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {BENEFITS.map(({ icon, title, text }) => (
            <div
              key={title}
              className="group bg-stone-900 border border-stone-800 p-7
                         hover:border-primary-600 hover:bg-stone-900/80
                         transition-all duration-300"
            >
              <span className="text-3xl mb-4 block">{icon}</span>
              <h3 className="font-display text-lg text-white mb-2">{title}</h3>
              <p className="text-stone-400 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        {/* Оптовые условия */}
        <div className="mb-20">
          <p className="section-label text-primary-400 mb-3">Оптовые закупки</p>
          <h3 className="font-display text-2xl text-white mb-8">Условия по объёму</h3>

          <div className="grid sm:grid-cols-3 gap-4">
            {WHOLESALE_TIERS.map(({ from, discount, label }, i) => (
              <div
                key={label}
                className={[
                  'relative p-8 border text-center transition-all duration-300',
                  i === 1
                    ? 'border-primary-600 bg-primary-600/10'
                    : 'border-stone-800 bg-stone-900 hover:border-stone-600',
                ].join(' ')}
              >
                {i === 1 && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2
                                   bg-primary-600 text-white text-xs px-3 py-1 tracking-wide uppercase">
                    Популярный
                  </span>
                )}
                <p className="text-stone-400 text-sm mb-3">{label}</p>
                <p className="font-display text-4xl text-white mb-2">{discount}</p>
                <p className="text-stone-400 text-sm">{from}</p>
              </div>
            ))}
          </div>

          <p className="text-stone-500 text-xs mt-4">
            * Скидки суммируются с акционными предложениями. Для получения индивидуального КП — свяжитесь с нами.
          </p>
        </div>

        {/* Карта производства */}
        <div className="max-w-4xl mx-auto">
          <div>
            <p className="section-label text-primary-400 mb-3">Наш цех</p>
            <h3 className="font-display text-2xl text-white mb-2">Производство</h3>
            <p className="text-stone-400 text-sm mb-6 flex items-center gap-2">
              <span>📍</span> {WORKSHOP_ADDRESS}
            </p>

            {/* iframe Яндекс.Карты — замените MAP_EMBED_URL вверху файла */}
            <div className="relative overflow-hidden border border-stone-800 rounded-sm" style={{ paddingBottom: '45%' }}>
              <iframe
                src={MAP_EMBED_URL}
                title="Расположение цеха"
                allowFullScreen
                className="absolute inset-0 w-full h-full grayscale"
                style={{ border: 0 }}
              />
            </div>

            <p className="text-stone-500 text-xs mt-3">
              Принимаем партнёров по предварительной записи.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
