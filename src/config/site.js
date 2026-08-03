/**
 * site.js — базовые настройки сайта
 *
 * SITE_URL используется в sitemap.xml, robots.txt, canonical и schema.org.
 * Задайте NEXT_PUBLIC_SITE_URL в .env.local (и в настройках хостинга).
 */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '')

export const SITE_NAME = 'СТЕПАН'

/** Слоган компании — отображается в шапке и на главной странице */
export const SITE_TAGLINE = 'Декоративные панели и вешалки'
