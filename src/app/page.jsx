/** Главная страница — только Hero-экран */

import Hero from '../components/Hero'

export const metadata = {
  alternates: { canonical: '/' },
}

export default function HomePage() {
  return (
    <main>
      <Hero />
    </main>
  )
}
