/**
 * PromoStripe — горизонтальная информационная лента под Hero
 * Прокручивается как бегущая строка на узких экранах.
 */

const ITEMS = [
  { icon: '🚚', text: 'Бесплатная доставка от 50 000 ₽' },
  { icon: '🛡️', text: 'Гарантия 2 года' },
  { icon: '🏭', text: 'Производство в России' },
  { icon: '⚡', text: 'Простой монтаж за 1 день' },
  { icon: '💳', text: 'Рассрочка 0%' },
]

export default function PromoStripe() {
  return (
    <div className="bg-primary-600 text-white overflow-hidden">
      <div className="container-site">
        {/* Десктоп: статичная строка */}
        <ul className="hidden md:flex items-center justify-center divide-x divide-primary-500">
          {ITEMS.map(({ icon, text }) => (
            <li key={text} className="flex items-center gap-2.5 px-8 py-3.5 text-sm font-medium">
              <span className="text-base">{icon}</span>
              <span>{text}</span>
            </li>
          ))}
        </ul>

        {/* Мобиле: бегущая строка */}
        <div className="md:hidden relative flex overflow-hidden py-3">
          <ul className="flex items-center gap-10 animate-marquee whitespace-nowrap">
            {[...ITEMS, ...ITEMS].map(({ icon, text }, i) => (
              <li key={i} className="flex items-center gap-2 text-sm font-medium flex-shrink-0">
                <span>{icon}</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
