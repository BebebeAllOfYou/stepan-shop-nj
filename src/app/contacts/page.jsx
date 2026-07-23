/** Страница контактов */

import Contacts    from '../../components/Contacts'
import Breadcrumbs from '../../components/Breadcrumbs'
import JsonLd      from '../../components/JsonLd'
import { SITE_URL, SITE_NAME } from '../../config/site'
import company from '../../../public/data/company.json'

export const metadata = {
  title: 'Контакты',
  description: 'Контакты магазина СТЕПАН: адрес шоурума, телефон, email и часы работы.',
  alternates: { canonical: '/contacts/' },
}

// Локальный бизнес: адрес, телефон, часы работы шоурума
const storeJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FurnitureStore',
  name: SITE_NAME,
  url: `${SITE_URL}/contacts/`,
  telephone: company.contacts.phone,
  email: company.contacts.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: company.contacts.address,
    addressCountry: 'RU',
  },
  openingHours: 'Mo-Sa 10:00-20:00',
  parentOrganization: { '@id': `${SITE_URL}/#organization` },
}

export default function ContactsPage() {
  return (
    <main className="pt-16">
      <JsonLd data={storeJsonLd} />
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Контакты' }]} />
      <Contacts />
    </main>
  )
}
