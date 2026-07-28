/**
 * layout.jsx — корневой layout приложения (Next.js App Router)
 *
 * Оборачивает все страницы в CartProvider, Header, Footer и CartPanel.
 * Содержит микроразметку schema.org: Organization + WebSite.
 */

import '../index.css'
import { CartProvider } from '../context/CartContext'
import Header           from '../components/Header'
import Footer           from '../components/Footer'
import CartPanel        from '../components/CartPanel'
import JsonLd           from '../components/JsonLd'
import { SITE_URL, SITE_NAME } from '../config/site'
import company from '../../public/data/company.json'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:  SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description:
    'Самоклеящиеся стеновые панели и настенные вешалки для быстрого и стильного обновления интерьера.',
  icons: {
    icon: '/favicon/Stepan_1.png',
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/favicon/Stepan_1.png`,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: company.contacts.phone,
    email: company.contacts.email,
    contactType: 'customer service',
    availableLanguage: 'ru',
  },
  sameAs: company.social.map(s => s.url),
}

const webSiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  publisher: { '@id': `${SITE_URL}/#organization` },
  inLanguage: 'ru',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        <JsonLd data={organizationJsonLd} />
        <JsonLd data={webSiteJsonLd} />
        <CartProvider>
          <Header />
          {children}
          <Footer />
          <CartPanel />
        </CartProvider>
      </body>
    </html>
  )
}
