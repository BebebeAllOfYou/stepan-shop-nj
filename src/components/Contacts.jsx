/**
 * Contacts — контакты и форма обратной связи
 * Контактные данные загружаются из /public/data/company.json через useCompany()
 * TODO: подключить форму к бэкенду или Formspree
 */

'use client'

import { useCompany } from '../hooks/useCompany'

export default function Contacts() {
  const { company } = useCompany()
  const contacts = company?.contacts

  const contactRows = contacts
    ? [
        { label: 'Адрес',    value: contacts.address, hint: `Шоурум: ${contacts.workHours.showroom}` },
        { label: 'Телефон',  value: contacts.phone,   href: `tel:${contacts.phone.replace(/[^+\d]/g, '')}`, hint: `Звонок бесплатный, ${contacts.workHours.phone}` },
        { label: 'Email',    value: contacts.email,   href: `mailto:${contacts.email}`, hint: 'Ответим в течение одного рабочего дня' },
      ]
    : []

  return (
    <section id="contacts" className="py-20 bg-white">
      <div className="container-site">
        <div className="grid md:grid-cols-2 gap-16 items-start">

          {/* Левый блок */}
          <div>
            <p className="section-label mb-2">Контакты</p>
            <h1 className="section-title mb-6">Свяжитесь с нами</h1>
            <p className="text-stone-500 leading-relaxed mb-10">
              Расскажите о вашем проекте — мы поможем подобрать мебель под
              интерьер, просчитаем стоимость и согласуем сроки.
            </p>

            <address className="not-italic space-y-8">
              {contactRows.map(({ label, value, href, hint }) => (
                <div key={label} className="flex gap-6">
                  <div className="w-px bg-primary-300 self-stretch" />
                  <div>
                    <p className="text-xs text-stone-400 tracking-wide uppercase mb-1">{label}</p>
                    {href
                      ? <a href={href} className="text-stone-900 font-medium hover:text-primary-600 transition-colors">{value}</a>
                      : <p className="text-stone-900 font-medium">{value}</p>
                    }
                    <p className="text-xs text-stone-400 mt-0.5">{hint}</p>
                  </div>
                </div>
              ))}
            </address>
          </div>

          {/* Форма */}
          {/*
          <div className="bg-stone-50 p-8">
            <h3 className="font-display text-xl text-stone-900 mb-6">Оставить заявку</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-stone-500 uppercase tracking-wide mb-1.5">Ваше имя</label>
                <input type="text" placeholder="Иван Иванов"
                  className="w-full border border-stone-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-stone-800 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-stone-500 uppercase tracking-wide mb-1.5">Телефон</label>
                <input type="tel" placeholder="+7 (___) ___-__-__"
                  className="w-full border border-stone-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-stone-800 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-stone-500 uppercase tracking-wide mb-1.5">Сообщение</label>
                <textarea rows={4} placeholder="Опишите, что вас интересует..."
                  className="w-full border border-stone-200 bg-white px-4 py-3 text-sm focus:outline-none focus:border-stone-800 transition-colors resize-none" />
              </div>
              <button type="button" onClick={() => console.log('TODO: отправить форму')}
                className="w-full btn-primary justify-center">
                Отправить заявку
              </button>
              <p className="text-xs text-stone-400 text-center leading-relaxed">
                Нажимая кнопку, вы соглашаетесь с{' '}
                <a href="/privacy" className="underline underline-offset-2 hover:text-stone-700">политикой конфиденциальности</a>
              </p>
            </div>
          </div>
          */}
        </div>
      </div>
    </section>
  )
}
